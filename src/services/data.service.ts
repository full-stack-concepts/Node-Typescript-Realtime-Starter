/****
 * Do not use es2016 async or await in conjunction with bluebird promises
 * see https://github.com/Microsoft/TypeScript/issues/8331
 */
import fetch from "node-fetch";
import faker from "faker";
import Promise from "bluebird";
import chain from 'lodash/chain';
import { IUser } from "../shared/interfaces";
import { UserModel, ClientModel, CustomerModel} from "../shared/models";
import { RemoteQueryBuilder } from "../util";
import { IListOptions} from "../shared/interfaces";

import { get} from "../util";
import { DataStore } from "./datastore.service";

/***
 * Import DB Population Settings
 */
import {	
	DB_POPULATE,
	DB_CREATE_USERS,
	DB_USERS_COLLECTION_NAME,
	DB_CREATE_CLIENTS,
	DB_CLIENTS_COLLECTION_NAME,
	DB_CREATE_CUSTOMERS,
	DB_CUSTOMERS_COLLECTION_NAME,
	DB_POPULATE_SAFETY_FIRST,
	DB_POPULATE_TEST_COLLECTIONS,
	DB_POPULATE_ADMINS,
	DB_POPULATE_POWER_USERS,
	DB_POPULATE_AUTHORS,
	DB_POPULATE_USERS,
	DB_POPULATION_LOCALE,
	DB_POPULATE_DEFAULT_CLIENTS,
	DB_POPULATE_DEFAULT_CUSTOMERS
} from "../util/secrets";

/***
 * Default Faker language locale
 * More info: https://github.com/marak/Faker.js/
*/
faker.locale =  DB_POPULATION_LOCALE;

import {
	countArrayItems,
	createUserType,
	formatUserSubType,	
	createSuperAdmin,
	createAdmin,
	createPowerUser,
	createAuthor,
	createUser
} from "../util";

/***
 * Import SuperAdminCredentials
 */
import {
	SUPERADMIN_FIRST_NAME,
	SUPERADMIN_LAST_NAME,
	SUPERADMIN_EMAIL,
	SUPERADMIN_PASSWORD
} from "../util/secrets";

interface IDataType {
	type:string,
	amount: number
}

export class DataBreeder {	

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

		return Promise.all(
			collections.map ( collection => 
				this.__countItems(collection)
				 .then( count => ({collection:collection, count:count}) 
			))
		)
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

		// process thick: Create required amount of users				
		return createUserType( category, counter.count)

		// process thick: slice portions per user sub type
		.then( (users:any[]) => {	

			if( category === 'users' ) {

				return Promise.all(						
					cSettings.map ( ({ category, amount}:any) => {																			
						let portion:IUser[] = users.slice(0, amount);	
						users.splice(0, amount);
						return Promise.resolve( { 
							'category': category, 
							'data': portion, 								
							'amount': amount
						})
					})											
				)					
				// process thick: format collection per user sub type
				.then( (collection: any) => {
					return Promise.all(
						collection.map( (collection:any) => {						
							return formatUserSubType( collection )
						})
					)					
				})
				// proces thick: return to caller
				.then( data => {  return { users: data }; });

			} else if(category === 'clients') {

				// process thick: format collection per user sub type				
				return formatUserSubType( { category: 'defaultClient', amount:  counter.count, data: users } )
				// proces thick: return to caller
				.then( data => {  return data; })

			} else if(category === 'customers' ) {

				// process thick: format collection per user sub type			
				return formatUserSubType( { category: 'defaultCustomer', amount:  counter.count, data: users })
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

		return Promise.all(
			config.map ( configuration => 
				Promise.resolve( this.processDataCategory(configuration) 
			))
		).then( data => Promise.resolve(data));	

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

		// process thick: store locally
		.then( (data:any) => DataStore.storeDataLocally(data) );
		
	}

	public test() {

		let collections:any[];

		/***
		 * Does the developer wants sample data for his application?
		 */
		if(!DB_POPULATE) this.exitMessage();

		/***
		 * Perform safetycheck before populating database
		 */
		// collections = await this.safetyCheck();
		// console.log("Collections to populate ", collections)

		let result:any = this.populate ( collections );

		
	}
   
};

export const populateDatabase = () => {
	let instance:any = new DataBreeder()
	instance.test();
}

