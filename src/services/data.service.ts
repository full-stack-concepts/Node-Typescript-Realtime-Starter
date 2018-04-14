import fetch from "node-fetch";
import faker from "faker";
import Promise from "bluebird";
import chain from 'lodash/chain';

import { IUser } from "../shared/interfaces";
import { UserModel} from "../shared/models";
import { RemoteQueryBuilder } from "../util";
import { IListOptions} from "../shared/interfaces";

import { get} from "../util";


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

console.log("****** locale ", DB_POPULATION_LOCALE )
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

	private async _fetchCollections() {

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

	private async __countItems( collection:string) {

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

	private async _testCollectionsForData( collections:string[]) {		

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

	private async safetyCheck() {		
		
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

	private processDataCategory( { category, cSettings, counter}:any ) {

		// process thick: Create required amount of users				
		createUserType( category, counter.count)

		// process thick: slice portions per user sub type
		.then( (users:IUser[]) => {	

			switch(category) {

				case 'users': 	

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
								return Promise.resolve( formatUserSubType( collection ))
							})
						)					
					});	
					break;

				
				case 'clients':
						formatUserSubType( { category: 'defaultClient', amount:  counter.count, data: users });	
						// return Promise.resolve( formatUserSubType( collection ))		
				break;


				case 'customers':
					formatUserSubType( { category: 'defaultCustomer', amount:  counter.count, data: users });
					// return Promise.resolve( formatUserSubType( collection ))					
				break;

				
			}
		});

		return category
	}

	private _generateData( pConfiguration:any) {		

		let settings:any[] = pConfiguration.settings;

		console.log(" ***** Process Data Generation ", settings)
		console.log(pConfiguration.counters)

		let categories:string[] = Object.keys(settings);		
		const config:any[] = categories.map( (category:string) => {
			let counter:number = pConfiguration.counters.find ( (counter) => counter.category === category),
				cSettinga:any[] = settings[category];
			console.log("** ", settings[category])
			return { 
				category: category, 
				cSettings: cSettinga,
				counter: counter 
			};
		});
	
		config.map( this.processDataCategory )			

	}

	/****
	 * Calculate items per data type
	 */
	private _calculateItemsPerCategory(items:any[]):any {		
		let categories:string[] = Object.keys(items);		
		return categories.map( (category:string) => {
			return items[category].reduce( countArrayItems, { category: category, count: 0} )
		});				
	}


	private _populationSettings():IDataType[] {		
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
	private async populate( collections:any[]) {

		// process thick: inventory data types
		const settings:any[] = this._populationSettings();

		// process thick: count users
		const categoryCounters:any[] = this._calculateItemsPerCategory(settings);		

		// process thick: generate data	
		const data:any = this._generateData({
			settings:settings,
			counters:categoryCounters
		});	
		return Promise.resolve(true);
	}

	public async test() {

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

		let result:boolean = await this.populate ( collections );

		
	}
   
};

export const populateDatabase = () => {
	let instance:any = new DataBreeder()
	instance.test();
}

