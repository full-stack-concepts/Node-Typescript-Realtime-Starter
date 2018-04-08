import fetch from "node-fetch";
import Promise from "bluebird";

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
	DB_POPULATE_USERS
} from "../util/secrets";

import {
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

	private __eval( {type, amount}:IDataType ) {				
		
		return new Promise ( (resolve, reject) => {
			switch( type) {
				case 'superadmin':	resolve( createSuperAdmin( amount) ); break;
				case 'admin': 		resolve( createAdmin(amount) ); break;
				case 'poweruser': 	resolve( createPowerUser(amount)); break;
				case 'author': 		resolve( createAuthor(amount) ); break;
				case 'user': 		resolve( createUser(amount));  break;
			}
		});		
	}

	private _generateData(settings:IDataType[]) {
		
		return Promise.all(
			settings.map ( setting => {		
				console.log(setting)		
				return Promise.resolve( this.__eval( setting ))
			})
		)
		.then( data => console.log(data) );
	}

	/*
	switch(setting.type) {
				case 'superadmin':	this.createSuperAdmin().then( data => { return data; }); break;
				case 'admin': 		this.createAdmin(x); break;
				case 'poweruser': 	this.createPowerUser(x); break;
				case 'author': 		this.createAuthor(x); break;
				case 'user': 		this.createUser(x);break;
			}

			*/

	/*****
	 * 
	 */
	private async populate( collections:any[]) {

		console.log("*** Start population")
		// process thick: inventory data types
		const settings:any[] = this._populationSettings();

		// process thick: generate data
		const data:any = this._generateData(settings);

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
		collections = await this.safetyCheck();
		console.log("Collections to populate ", collections)

		let result:boolean = await this.populate ( collections );

		
	}
   
};

export const populateDatabase = () => {
	let instance:any = new DataBreeder()
	instance.test();
}

