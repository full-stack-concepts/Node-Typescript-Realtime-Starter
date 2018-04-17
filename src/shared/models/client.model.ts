import Promise from "bluebird";
import mongoose from "mongoose";
import fetch from "node-fetch";

import { RepositoryBase,  IClient, IListOptions } from "../interfaces";
import { clientSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

const headers:any= { 'Content-Type': 'application/json' };

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class ClientRepository extends RepositoryBase<IClient> {
	
	constructor() {
		super(clientSchema);
	}
}


// #TODO: move MLAB functions to base class and let Model extend this base class
export class ClientModel  {

	private _clientModel: IClient;	

	constructor(clientModel: IClient) {
		this._clientModel = clientModel;
	}

	/****
	 * Custom Methods for MLAB Mongo Databse				
	 */
	// MLAB: Insert many users
	public static mlab_insert(collection:string,  data:any, ) {
		return new Promise( (resolve, reject) => {
			let rURL = RemoteQueryBuilder.buildCollectionURL( collection.toString() );					
			fetch(rURL, { method: 'POST', body: JSON.stringify(data), headers:headers })
			.then( (res:any) =>res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );		
		});
	}

	//** MLAB Delete collection
	public static mlab_deleteCollection(collection:string) {
		return new Promise ( (resolve, reject) => {
			let rURL:string = RemoteQueryBuilder.buildCollectionURL(collection.toString());			
			console.log(rURL)
			fetch(rURL, { method: 'DELETE', headers:headers})
			.then( (res:any) => res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );			
		});
	}
	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */

	static insert(clients:IClient[]): Promise<any> {
		let repo = new ClientRepository();
		return new Promise ( (resolve, reject) => {
			repo.insertMany( clients, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	static remove( cond:Object):Promise<any> { 
		let repo = new ClientRepository();
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {					
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	
	 
}





