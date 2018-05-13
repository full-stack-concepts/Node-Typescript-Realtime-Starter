import fs from "fs-extra";
import Promise from "bluebird";
import path from "path";
import jsonFile from  "jsonfile";

Promise.promisifyAll(fs);
Promise.promisifyAll(jsonFile);

import { 
	IUser, 
	IClient, 
	ICustomer
} from "../../shared/interfaces";

import {
	POPULATE_LOCAL_DATASTORE
} from "../../util/secrets";

import {
	getPathToDataStore
} from "../../util";

interface IData {
	users?: {
		superadmin?: IUser[],
		admin: IUser[],
		poweruser: IUser[],
		author: IUser[],
		user: IUser[]
	},
	defaultClient?: IClient[],
	defaultCustomer?: ICustomer[]
}


export class DataStore {

	/********
	 * Store generated data in data store folders, location @dataStore
	 * @dataStore = PRIVATE_DATA_DIR
	 */
	static storeDataLocally(data:IData) {

		// return to caller if this config option is set to FALSE
		if(!POPULATE_LOCAL_DATASTORE) 
			return Promise.resolve();
		
		const $stores:string[]=["1","2","3"];
		const $dataStore:string = getPathToDataStore();

		return Promise.map( $stores, (store:string) => {
			let pathToFile:string = `${path.join($dataStore,store)}\\data.json`;				
			jsonFile.writeFile( pathToFile, data, {spaces:1}, (err:any) => {															
				(err)? Promise.reject(err):Promise.resolve();				
			});	
		})
		.then( () => Promise.resolve() )
		.catch( (err:any) => {
			console.error("Local DataStore: generated data could not be saved. ", err );
			process.exit(1);
		});	

	}	

}