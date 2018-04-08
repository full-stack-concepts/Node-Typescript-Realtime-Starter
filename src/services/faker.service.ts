import faker from "faker";
import fetch from "node-fetch";
import axios from "axios";
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

/***
 * Import SuperAdminCredentials
 */
import {
	SUPERADMIN_FIRST_NAME,
	SUPERADMIN_LAST_NAME,
	SUPERADMIN_EMAIL,
	SUPERADMIN_PASSWORD
} from "../util/secrets";

export class DataBreeder {

	private createSuperAdmin() {

	}

	private createAdmin() {
	}

	private createPowerUser() {}

	private createAuthor() {}

	private createUser() {}

	private exitMessage():void {
		console.log("** DB Configuration: no need to populate DB with data .....")
	}

	private async fetchCollections() {

		let url:string = RemoteQueryBuilder.list({});		
		return fetch(url).then( res => res.json()).then( collections => Promise.resolve(collections) )
		.catch( err => Promise.reject(err) )
	}

	private filterForUserAllowedCollections(__remoteCollections:string[]):string[] {
		
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

	private async testCollectionsForData( collections:string[]) {		

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

	private collectionsToPopulate( collections:any[]) {		
		return collections.filter( (c:any) => {					
			return c.count === 0 
		});
	}

	private async safetyCheck() {		
		
		/**
		 * process thick: fetch DB collections list
		 */
		return this.fetchCollections()

		/*** 
		 * process thick: filter collections by eliminating collections that we dont need to check for existing data
		 */
		.then( remoteCollections => this.filterForUserAllowedCollections(remoteCollections) )

		/***
		 * process thick: count Documents per collection
		 */
		.then( collections => this.testCollectionsForData(collections) )

		/***
		 * process thick: filter for collections that we need to populate
		 */
		.then( collections => this.collectionsToPopulate(collections) )

		/***
		 * process thick: return to caller
		 */
		.then( collections => Promise.resolve( collections ) )

		.catch( err => Promise.reject(err) );
	}

	/*****
	 * 
	 */
	private async populate( collections:any[]) {

		console.log("*** Start population")

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

