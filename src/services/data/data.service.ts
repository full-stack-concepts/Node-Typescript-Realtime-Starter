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
import { proxyService, dbModelService } from "./../../services";

/***
 * Import DB Population Settings
 */
import {	
	GENERATE_SAMPLE_DATA,
	POPULATE_LOCAL_DATASTORE,
	POPULATE_LOCAL_DATABASE,
	POPULATE_REMOTE_DATABASE,
	COLLECTION_MINIMUM_TRESHOLD,
	COLLECTION_MAXIMUM_TRESHOLD,
	DB_CREATE_USERS,
	DB_SYSTEM_USERS_COLLECTION_NAME,
	DB_USERS_COLLECTION_NAME,
	DB_CREATE_CLIENTS,
	DB_CLIENTS_COLLECTION_NAME,
	DB_CREATE_CUSTOMERS,
	DB_CUSTOMERS_COLLECTION_NAME,	
	DB_POPULATE_COLLECTIONS,
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

interface IModelSetting {
	model:any,
	type: string,
	collection:string
}

import { Observable, Subscription } from "rxjs";

export class DataBreeder {	

	data:any; //#TODO: assign interface IDATA?	

	private daController:Function;	

	/****
	 * Data Model Service
	 */
	private dbModelService:any = dbModelService;

	/****
	 * All PERSON READ models
	 */ 
	protected readModels:IModelSetting[];

	constructor() {
		this.configureSubscribers();
	}		

	private configureSubscribers():void {	

        this.dbModelService.readModels$.subscribe( (models:IModelSetting[]) => this.readModels = models );
	}

	private exitMessage():void {
		console.log("** DB Configuration: no need to populate DB with data .....")
	}					

	private processDataCategory( { category, cSettings, counter}:any) {

		console.log("** ",  DATA_CREATE_USER_TYPE, category, counter.count)

		// process thick: Create required amount of users		
		console.log("*** BP 1 ", DATA_CREATE_USER_TYPE)		
		return proxyService.daController[DATA_CREATE_USER_TYPE]( category, counter.count)

		// process thick: slice portions per user sub type
		.then( (users:any[]) => {	
			console.log("*** BP 2")
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
						return proxyService.daController[DATA_FORMAT_USER_SUBTYPE]( collection );
					})								
				})
				// proces thick: return to caller
				.then( data => {  return { users: data }; });

			} else if(category === 'clients') {

				// process thick: format collection per user sub type				
				return  proxyService.daController[DATA_FORMAT_USER_SUBTYPE]( { category: 'defaultClient', amount:  counter.count, data: users } )
				// proces thick: return to caller
				.then( (data:any) => {  return data; })

			} else if(category === 'customers' ) {

				// process thick: format collection per user sub type			
				return  proxyService.daController[DATA_FORMAT_USER_SUBTYPE]( { category: 'defaultCustomer', amount:  counter.count, data: users })
				// proces thick: return to caller
				.then( (data:any) => {  return data; })
					
			}
		})
		.then( (collection:any) => Promise.resolve(collection) )	
	}   

	private _generateData( pConfiguration:any) {		

		/***
		 *
		 */   
		let settings:any[] = pConfiguration.settings;	

		/***
		 *
		 */
		let categories:string[] = Object.keys(settings);	

		/***
		 *
		 */
		const config:any[] = categories.map( (category:any) => {

			let counter:number = pConfiguration.counters.find ( (counter:any) => counter.category === category);
			let cSettings:any[] = settings[category];			

			return { 
				category: category, 
				cSettings: cSettings, 
				counter: counter 
			};
		});

		console.log("***** Configuration ")
		console.log(config)

		/***
		 *
		 */
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
				{ category: "superadmin", amount: 1, collection: DB_SYSTEM_USERS_COLLECTION_NAME},
				{ category: "admin", amount: DB_POPULATE_ADMINS, collection: DB_USERS_COLLECTION_NAME },
				{ category: "poweruser", amount: DB_POPULATE_POWER_USERS, collection: DB_USERS_COLLECTION_NAME },
				{ category: "author", amount: DB_POPULATE_AUTHORS, collection: DB_USERS_COLLECTION_NAME },
				{ category: "user", amount:DB_POPULATE_USERS, collection: DB_USERS_COLLECTION_NAME}
			],
			clients: [ { category: "default", amount: DB_POPULATE_DEFAULT_CLIENTS, collection: DB_CLIENTS_COLLECTION_NAME } ],
			customers: [ { category: "default", amount: DB_POPULATE_DEFAULT_CUSTOMERS, collection: DB_CUSTOMERS_COLLECTION_NAME } ]
		}
	}

	/*****
	 * TODO: split data generation for local and remote db
	 */
	private populate( {local, remote}:any) {

		// process thick: inventory data types
		const settings:any = this._populationSettings();		

		// process thick: count users
		const categoryCounters:any[] = this._calculateItemsPerCategory(settings);	
		
		// process thick: generate data	
		this._generateData({ settings:settings,	counters:categoryCounters })

		// process thick: assign data to global
		.then( (data:any) => { return this.data = data; } )			
	
		 // process thick: add generated users to local database		 
		.then( () => UserTypes.storeLocally( this.data) )

		// process thick: add generated users to remote database
		.then( () => UserTypes.storeRemote ( this.data) )

		.catch( (err:any) => console.error(err) );
	
	}


	/***
	 * Remove collection if 
	 * @collections: array[{collection:string, counter:number}]
	 */
	private _collectionsToPopulate( collections:any[]) {				
		collections.forEach( (c:any) => (c.count >= COLLECTION_MINIMUM_TRESHOLD && c.count <= COLLECTION_MAXIMUM_TRESHOLD)? c.populate=true : c.populate=false );
		return collections;
	}	

	/***
	 * @collection:string
	 * Counts items per collection
	 */
	private _countItems( collection:string) {

		let url:string = RemoteQueryBuilder.list({
			collection:collection, 
			query:{}, 
			count: true
		});

		return get(url).then( (count:number) => Promise.resolve(count) );
	}

	/***
	 * @collections: Remote DB (MLAB) collections
	 */
	private _countItemsPerRemoteCollection( collections:string[]) {		

		let counts:any=[];

		return Promise.map( collections, (collection:string) => {
			return this._countItems(collection)
			.then( (count:number) => ({collection, count}) ) 
		})	
		.then( (results:any) => Promise.resolve(results) )
		.catch( err => Promise.reject(err));
	}	

	/***
	 * Filter Remote DB Collections for rpe-defined collections that we may populate with data
	 */
	private _filterForUserAllowedCollections(__remoteCollections:string[]):string[] {		
		
		/*** 
		 * Get settings collection list
		 */
		const collections:string[] = DB_POPULATE_COLLECTIONS || [];

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

	/***
	 * Fetch Remote DB Collections
	 */
	private _fetchCollections() {
		let url:string = RemoteQueryBuilder.list({});				
		return fetch(url)
		.then( (res:any) => res.json())
		.then( (collections:string[]) => Promise.resolve(collections) )		
		.catch( (err:Error) => Promise.reject(err) )
	}

	/****
	 * Test Configuration Remote DB on MLAB 
	 * (1) Fetch collections
	 * (2) Remove disallowed collections
	 * (3) Count Current amount of documents per collection
	 * (4) Test for minimum of maximum treshold
	 */
	private safetyCheckRemoteDatabase():any {		

		if(!POPULATE_REMOTE_DATABASE) 
			return Promise.resolve([]);
		
		// process thick: fetch DB collections list
		return this._fetchCollections()

		// process thick: filter collections by eliminating collections that we dont need to check for existing data		
		.then( (collections:string[]) => this._filterForUserAllowedCollections(collections) )

		// process thick: count Documents per collection		
		.then( (collections:string[]) => this._countItemsPerRemoteCollection(collections) )

		// process thick: filter for collections that we need to populate
		.then( (collections:any) => this._collectionsToPopulate(collections) )

		// process thick: return to caller
		.then( (collections:string[]) => Promise.resolve( collections ) )

		.catch( (err:Error) => Promise.reject(err) );
	}

	/****
	 * Test Configuration Local Mongoose DB
	 * (1) Fetch collections
	 * (2) Remove disallowed collections
	 * (3) Count Current amount of documents per collection
	 * (4) Test for minimum of maximum treshold
	 */
	private safetyCheckLocalUserDatabase() {	

		let userDB = proxyService.userDB;	
		
		return userDB.db.listCollections().toArray()

		// process thick: clean mongoose collections array
		.then( (_collections:any) => {
			let collections:string[] = [];			
			_collections.forEach( (_collection:any, index:number) => collections.push(_collection.name) );
			return collections;
		})

		// process thick: filter collections by eliminating collections that we dont need to check for existing data
		.then( (collections:string[]) => this._filterForUserAllowedCollections(collections) )

		// process thick: loop through read models to count items per collection
		.then( (collections:any) => {				
			return Promise.map( collections, (collection:string) => {
				let readModel:IModelSetting = this.readModels.find( (model:IModelSetting) => model.collection === collection);
				return readModel.model.find({})
				.then( (result:any[]) => ({collection, count:result.length}) )				
			})
			.then( (results:any) => Promise.resolve(results) );							
		})

		// process thick:  filter for collections that we need to populate
		.then( (collections:any) => this._collectionsToPopulate(collections) )

		// process thick: return to caller
		.then( (collections:string[]) => Promise.resolve( collections ) )

		.catch( (err:Error) => Promise.reject(err) );	
	}

	public generateData() {

		/***
		 * Does the developer wants sample data for his application?
		 */
		if(!GENERATE_SAMPLE_DATA) {
			this.exitMessage();
		} else {

			this.populate ( {
				local: [],
				remote: []
			});
		}

		/***
		 * Perform safetycheck before populating database
		 */
		/*
		return Promise.join<any>(
			this.safetyCheckRemoteDatabase(),
			this.safetyCheckLocalUserDatabase()
		).spread ( (
			remoteCollections:any[],
			localCollections:any[]
		) => {
			console.log("**** REMOTE COLLECTIONS ", remoteCollections)
			console.log("**** LOCAL COLLECTIONS  ", localCollections)		
		})	
		*/
		

		
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


export const dataBreeder:ActionService = new ActionService();




