/****
 * Do not use es2016 async or await in conjunction with bluebird promises
 * see https://github.com/Microsoft/TypeScript/issues/8331
 */
import fetch from "node-fetch";
import faker from "faker";
import Promise from "bluebird";
import chain from 'lodash/chain';
import { IUser, IClient, ICustomer } from "../..//shared/interfaces";
import { UserModel, ClientModel, CustomerModel} from "../../shared/models";
import { RemoteQueryBuilder } from "../../util";
import { IListOptions} from "../../shared/interfaces";

import { get} from "../../util";
import { DataStore } from "./data.store.service";
import { UserTypes } from "./data.usertypes.service";
import { proxyService } from "./../../services";

/***
 * Import DB Population Settings
 */
import {	
	GENERATE_SAMPLE_DATA,
	DB_CREATE_USERS,
	DB_USERS_COLLECTION_NAME,
	DB_CREATE_CLIENTS,
	DB_CLIENTS_COLLECTION_NAME,
	DB_CREATE_CUSTOMERS,
	DB_CUSTOMERS_COLLECTION_NAME,	
	DB_POPULATE_TEST_COLLECTIONS,
	DB_POPULATE_ADMINS,
	DB_POPULATE_POWER_USERS,
	DB_POPULATE_AUTHORS,
	DB_POPULATE_USERS,
	DB_POPULATION_LOCALE,
	DB_POPULATE_DEFAULT_CLIENTS,
	DB_POPULATE_DEFAULT_CUSTOMERS
} from "../../util/secrets";

import {
	DATA_CREATE_USER_TYPE,
	DATA_FORMAT_USER_SUBTYPE,
	LOCAL_STORAGE_ADD
} from "../../controllers/actions";


import {
	countArrayItems	
} from "../../util";


/***
 * Import SuperAdminCredentials
 */
import {
	SUPERADMIN_FIRST_NAME,
	SUPERADMIN_LAST_NAME,
	SUPERADMIN_EMAIL,
	SUPERADMIN_PASSWORD
} from "../../util/secrets";


interface IDataType {
	type:string,
	amount: number
}

import { Observable, Subscription } from "rxjs";

export class DataBreeder {	

	data:any; //#TODO: assign interface IDATA?	

	private daController:Function;	

	constructor() {
		this.configureSubscribers();
	}		

	private configureSubscribers():void {
			
		proxyService.startDataOperations$.subscribe( (state:boolean) => {   			
        	if(proxyService._daController) this.daController = proxyService._daController;          	 
        	this.generateData();
        });
	}

	private exitMessage():void {
		console.log("** DB Configuration: no need to populate DB with data .....")
	}

	private _fetchCollections() {

		let url:string = RemoteQueryBuilder.list({});		
		return fetch(url).then( res => res.json()).then( collections => Promise.resolve(collections) )
		.catch( err => Promise.reject(err) )
	}

	private _filterForUserAllowedCollections(__remoteCollections:string[]):string[] {
		
		/*** 
		 * Get settings collection list
		 */
		const collections:string[] = DB_POPULATE_TEST_COLLECTIONS || [];

		/***
		 * Remove any MongoDB system collection
		 */
		const remoteCollections = __remoteCollections.filter( c => c != 'system.indexes');

		/***
		 * Test if user provided collections exit on DB Host 
		 * es2016 or vanillla js: remoteCollection.include(c)
		 */
		let allCollectionsExist:boolean = collections.some( c => remoteCollections.includes(c) );		

		/***
		 * All collections provided by user do exist
		 */
		if(allCollectionsExist) {
			return collections;

		/***
		 * Further Filter collections		
		 */
		} else {
			return collections.map( c => {if(remoteCollections.indexOf(c) >=0) return c; });
		};		
	}

	private __countItems( collection:string) {

		let url:string = RemoteQueryBuilder.list({
			collection:collection, 
			query:{}, 
			count: true
		});

		return get(url).then( (count:number) => {
			console.log(count)
			return Promise.resolve(count) 
		});
	}

	private _testCollectionsForData( collections:string[]) {		

		let counts:any=[];

		return Promise.map( collections, (collection:any) => {
			this.__countItems(collection)
			.then( count => ({collection:collection, count:count}) ) 
		})	
		.then( results => Promise.resolve(results) )
		.catch( err => Promise.reject(err));
	}	

	private _collectionsToPopulate( collections:any[]) {		
		return collections.filter( (c:any) => {					
			return c.count === 0 
		});
	}

	private safetyCheck() {		
		
		/**
		 * process thick: fetch DB collections list
		 */
		return this._fetchCollections()

		/*** 
		 * process thick: filter collections by eliminating collections that we dont need to check for existing data
		 */
		.then( remoteCollections => this._filterForUserAllowedCollections(remoteCollections) )

		/***
		 * process thick: count Documents per collection
		 */
		.then( collections => this._testCollectionsForData(collections) )

		/***
		 * process thick: filter for collections that we need to populate
		 */
		.then( collections => this._collectionsToPopulate(collections) )

		/***
		 * process thick: return to caller
		 */
		.then( collections => Promise.resolve( collections ) )

		.catch( err => Promise.reject(err) );
	}

	private processDataCategory( { category, cSettings, counter}:any) {

		console.log("** ",  DATA_CREATE_USER_TYPE, category, counter.count)

		// process thick: Create required amount of users				
		return this.daController[DATA_CREATE_USER_TYPE]( category, counter.count)

		// process thick: slice portions per user sub type
		.then( (users:any[]) => {	

			if( category === 'users' ) {

				return Promise.map( cSettings, ({ category, amount}:any) => {
					let portion:IUser[] = users.slice(0, amount);	
					users.splice(0, amount);
					return Promise.resolve( { 
						'category': category, 
						'data': portion, 								
						'amount': amount
					});
				})	
				// process thick: format collection per user sub type
				.then( (collections: any) => {
					return Promise.map( collections, (collection:any) => {
						return this.daController[DATA_FORMAT_USER_SUBTYPE]( collection );
					})								
				})
				// proces thick: return to caller
				.then( data => {  return { users: data }; });

			} else if(category === 'clients') {

				// process thick: format collection per user sub type				
				return  this.daController[DATA_FORMAT_USER_SUBTYPE]( { category: 'defaultClient', amount:  counter.count, data: users } )
				// proces thick: return to caller
				.then( (data:any) => {  return data; })

			} else if(category === 'customers' ) {

				// process thick: format collection per user sub type			
				return  this.daController[DATA_FORMAT_USER_SUBTYPE]( { category: 'defaultCustomer', amount:  counter.count, data: users })
				// proces thick: return to caller
				.then( (data:any) => {  return data; })
					
			}
		})
		.then( (collection:any) => Promise.resolve(collection) )	
	}   

	private _generateData( pConfiguration:any) {		
   
		let settings:any[] = pConfiguration.settings;	

		let categories:string[] = Object.keys(settings);		
		const config:any[] = categories.map( (category:any) => {

			let counter:number = pConfiguration.counters.find ( (counter:any) => counter.category === category),
				cSettings:any[] = settings[category];			
			return { 
				category: category, 
				cSettings: cSettings, 
				counter: counter 
			};
		});

		return Promise.map( config, (configuration:any) => Promise.resolve( this.processDataCategory(configuration)) )
		.then( data => Promise.resolve(data));	

	}

	/****
	 * Calculate items per data type
	 */
	private _calculateItemsPerCategory(items:any[]):any {		
		let categories:string[] = Object.keys(items);		
		return categories.map( (category:any) => {
			return items[category].reduce( countArrayItems, { category: category, count: 0} )
		});				
	}


	private _populationSettings() {		
		return  {
			users: [
				{ category: "superadmin", amount: 1},
				{ category: "admin", amount: DB_POPULATE_ADMINS },
				{ category: "poweruser", amount: DB_POPULATE_POWER_USERS },
				{ category: "author", amount: DB_POPULATE_AUTHORS},
				{ category: "user", amount:DB_POPULATE_USERS}
			],
			clients: [ { category: "default", amount: DB_POPULATE_DEFAULT_CLIENTS } ],
			customers: [ { category: "default", amount: DB_POPULATE_DEFAULT_CUSTOMERS } ]
		}
	}

	/*****
	 * 
	 */
	private populate( collections:any[]) {

		// process thick: inventory data types
		const settings:any = this._populationSettings();

		// process thick: count users
		const categoryCounters:any[] = this._calculateItemsPerCategory(settings);		

		// process thick: generate data	
		this._generateData({ settings:settings,	counters:categoryCounters })

		// process thick: assign data to global
		.then( (data:any) => { return this.data = data; } )		

		// process thick: add generated data to local store 		
		.then( () => this.daController[LOCAL_STORAGE_ADD]( this.data ) )
		// DataStore.storeDataLocally( this.data ) )
	
		 // process thick: add generated users to local database		 
		.then( () => UserTypes.storeLocally( this.data) )

		// process thick: add generated users to remote database
		.then( () => UserTypes.storeRemote ( this.data) )

		.then( () => console.log("*** Proceed "))
	}

	public generateData() {

		let collections:any[];

		/***
		 * Does the developer wants sample data for his application?
		 */
		if(!GENERATE_SAMPLE_DATA) this.exitMessage();

		/***
		 * Perform safetycheck before populating database
		 */
		// collections = await this.safetyCheck();
		// console.log("Collections to populate ", collections)

		let result:any = this.populate ( collections );
		
	}   
};

/****
 * Public Interface for Data Actions Controller
 */
class ActionService {

	public generateData() {
		let instance:any = new DataBreeder();
		return instance.generateData();			
	}	
}


export const dataBreeder:ActionService = new DataBreeder();




