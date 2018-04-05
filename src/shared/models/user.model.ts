import Promise from "bluebird";
import mongoose from "mongoose";
import axios from "axios";

import { RepositoryBase, IUser } from "../interfaces";
import { userSchema } from "../schemas";


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

