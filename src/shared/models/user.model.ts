import Promise from "bluebird";
import mongoose from "mongoose";

import { DefaultModel} from "./default.model";
import { TUSER } from "../types";
import { RepositoryBase,  IUser, IListOptions } from "../interfaces";
import { userSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";


/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class UserRepository extends RepositoryBase<IUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super('User', connection);
	}
}

export class UserModel extends DefaultModel  {

	private _userModel: IUser;	

	constructor(userModel: IUser) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._userModel = userModel;
	}	

	/****
	 * Define custom methods for local onstance of MongoDB here	
	 */
	public createUser(user:IUser): Promise<any> {
		const repo = new UserRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.create(user, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	

	public insert(users:IUser[]): Promise<any> {
		const repo = new UserRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.insertMany( users, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	public  remove( cond:Object):Promise<any> { 
		const repo = new UserRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {						
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	

	public findOne (cond:Object):Promise<any> {
		const repo = new UserRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.findOne ( cond, (err:any, res:any) => {					
				if(err) {
					reject(err);
				} else if(!res) {
					resolve();
				} else {
					resolve(res)
				}
			});
		});
	}
}

export const userModel = new UserModel(TUSER);

