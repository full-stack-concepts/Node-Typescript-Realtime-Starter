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

export class UserModel  {

	private _userModel: IUser;	

	constructor(userModel: IUser) {
		this._userModel = userModel;
	}

	/****
	 * Custom Methods for MLAB Mongo Databse				
	 */

	//** MLAB: Create user 
	static remoteCreateUser(_data:any) {		
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

	//** MLAB find single user
	static remoteFindOneOnly(query:Object, collection:string) {
		return new Promise( (resolve, reject) => {
			query = stringify( query);
			let rURL = RemoteQueryBuilder.findOneRemoteURL(collection, query);							
			fetch(rURL)
			.then( (res:any) =>res.json())
			.then( (response:any) => resolve(response) )			
        	.catch( err => reject(err) );        
		});
	}

	/****
	 * Define custom methods for local onstance of MongoDB here	
	 */
	 static findAll():Promise<any> {
		let repo = new UserRepository();
		return new Promise ( (resolve, reject) => {	
			repo.find().exec( (err:any, res:any) => {							
				if(err) { reject (err); }
				else if(!res) { resolve([]); } 
				else { resolve(res);}		
			});
		});		
	}
}

