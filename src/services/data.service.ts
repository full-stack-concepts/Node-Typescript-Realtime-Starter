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
	DB_POPULATE_SAFETY_FIRST,
	DB_POPULATE_TEST_COLLECTIONS,
	DB_POPULATE_ADMINS,
	DB_POPULATE_POWER_USERS,
	DB_POPULATE_AUTHORS,
	DB_POPULATE_USERS,
	DB_POPULATION_LOCALE
} from "../util/secrets";

console.log("****** locale ", DB_POPULATION_LOCALE )
/***
 * Default Faker language locale
 * More info: https://github.com/marak/Faker.js/
*/
faker.locale =  DB_POPULATION_LOCALE;

import {
	countArrayItems,
	createDefaultUser,
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

	private _populationSettings():IDataType[] {
		return  [
			{ type: "superadmin", amount: 1},
			{ type: "admin", amount: DB_POPULATE_ADMINS },
			{ type: "poweruser", amount: DB_POPULATE_POWER_USERS },
			{ type: "author", amount: DB_POPULATE_AUTHORS},
			{ type: "user", amount:DB_POPULATE_USERS}
		];	
	}

	private _calculateItems(arr:any[]):any {
		return arr.reduce( countArrayItems, { count: 0} )
	}

	private processDataCategory( { category, settings, count}:any ) {

		switch(category) {
			case 'users': 

				// process thick: Create required amount of users				 
				createDefaultUser(count.count)

				// process thick: slice portions per user sub type
				.then( (users:IUser[]) => {														
					return Promise.all(
						settings.map ( ({type, amount}:any) => {																			
							let portion:IUser[] = users.slice(0, amount);	
							users.splice(0, amount);
							return Promise.resolve( { 'data': portion, 'type': type, 'amount': amount})
						})
					)
					.then( (collection:any) => { return collection; } )												
				})

				// process thick: format collection per user sub type
				.then( (collection: any) => {
					return Promise.all(
						collection.map( (collection:any) => {						
							return Promise.resolve( formatUserSubType( collection ))
						})
					)
					.then( data => console.log(data) )
				})			
				
			break;
		}

		return category
	}

	private _generateData( pConfiguration:any) {

		console.log("*** start data generation ", )

		const test =  pConfiguration

		.map( this.processDataCategory )

		

		console.log("result", test);
		
		
	}

	/*****
	 * 
	 */
	private async populate( collections:any[]) {

		console.log("*** Start population")
		// process thick: inventory data types
		const userPopulation:IDataType[] = this._populationSettings();

		// process thick: count users
		const userCount = this._calculateItems(userPopulation);

		console.log("**** Creating " + userCount.count + " users")

		// process thick: generate data
		const data:any = this._generateData([
			{ category: 'users', settings: userPopulation, count: userCount }				
		]);

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

