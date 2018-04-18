import Promise from "bluebird";
import mongoose from "mongoose";
import fetch from "node-fetch";

import { RepositoryBase,  IUser, IListOptions } from "../interfaces";
import { userSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

const headers:any= { 'Content-Type': 'application/json' };


/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class UserRepository extends RepositoryBase<IUser> {
	
	constructor() {
		super(userSchema);
	}
}


// #TODO: move MLAB functions to base class and let Model extend this base class
export class UserModel  {

	private _userModel: IUser;	

	constructor(userModel: IUser) {
		this._userModel = userModel;
	}

	/****
	 * Custom Methods for MLAB Mongo Databse				
	 */   

	//** MLAB: Create user 
	public static remoteCreateUser(_data:any) {		
		return new Promise( (resolve, reject) => {			 
			if( _data && objectKeysLength (_data) === 0 ) reject(' Invalid Profile');					
			let data = stringify(_data);			
			let rURL = RemoteQueryBuilder.buildCollectionURL('users');			
			fetch(rURL, { method: 'POST', body: data, headers:headers })
			.then( (res:any) =>res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );			
		});
	}

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

	//** MLAB find single user
	public static remoteFindOneOnly(query:Object, collection:string) {
		return new Promise( (resolve, reject) => {
			query = stringify( query);
			let rURL = RemoteQueryBuilder.findOneRemoteURL(collection, query);
			console.log(rURL);
			fetch(rURL)
			.then( (res:any) =>res.json())
			.then( (response:any) => resolve(response) )			
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
	 * Define custom methods for local onstance of MongoDB here	
	 */
	static createUsers(users:IUser[]): Promise<any> {
		let repo = new UserRepository();
		return new Promise ( (resolve, reject) => {
			repo.insertMany( users, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	public static remove( cond:Object):Promise<any> { 
		let repo = new UserRepository();
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {						
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	


}

