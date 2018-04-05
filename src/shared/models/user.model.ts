import Promise from "bluebird";
import mongoose from "mongoose";
import axios from "axios";

import { RepositoryBase, IUser } from "../interfaces";
import { userSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";


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
	 * Define custom methods for MLAB Mongo Dataabse 
	 */
	static remoteCreateUser(_data:any) {		

		return new Promise( (resolve, reject) => {

			// throw error if user profile has no properties 
			if( _data && objectKeysLength (_data) === 0 ) 
				return reject(' Invalid Profile');			

			// stringify data and build remote url for this collection
			let data = stringify(_data);			
			let rURL = RemoteQueryBuilder.buildCollectionURL('users');	

			axios.post( rURL, data).then( response => { resolve(response.data); })
	        .catch( (err) => {	       
	        	reject(err);
	        });
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

