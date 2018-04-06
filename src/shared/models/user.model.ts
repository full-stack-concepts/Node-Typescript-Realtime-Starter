import Promise from "bluebird";
import mongoose from "mongoose";
import axios from "axios";

import { RepositoryBase, IUser } from "../interfaces";
import { userSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

/*********************************************
 * Define AXIOS constants
 */
axios.defaults.baseURL = 'https://api.mlab.com/api/1/databases';
axios.defaults.headers.post['Content-Type'] = 'application/json';


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
			axios.post( rURL, data)
			.then( response => { resolve(response.data); })
			.catch( err => reject(1040) );			
		});
	}

	//** MLAB find single user
	static remoteFindOneOnly(query:Object, collection:string) {
		return new Promise( (resolve, reject) => {
			query = stringify( query);
			let rURL = RemoteQueryBuilder.findOneRemoteURL(collection, query);					
			axios.get(rURL)
			.then( response => resolve(response.data) )			
        	.catch( err => reject(1041) );        
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

