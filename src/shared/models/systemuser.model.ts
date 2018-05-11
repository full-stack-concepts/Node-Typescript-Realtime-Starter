import Promise from "bluebird";
import mongoose from "mongoose";

import { proxyService} from "../../services";
import { DefaultModel} from "./default.model";
import { RepositoryBase,  ISystemUser, IListOptions } from "../interfaces";
import { TSYSTEMUSER } from "../types";
import { systemUserSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";


/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */

class SystemUserRepository extends RepositoryBase<ISystemUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 'SystemUser', connection);
	}
}

/*****
 * Model extends Default Model which provides support for external MpngoDB Providers
 */
export class SystemUserModel extends DefaultModel  {

	private _systemUserModel: ISystemUser;

	constructor(systemUserModel: ISystemUser) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._systemUserModel = systemUserModel;		
	}			

	/****
	 * Define custom methods for local onstance of MongoDB here	
	 */
	public createUser(user:ISystemUser): Promise<any> {			
		const repo = new SystemUserRepository( this.userDBConn );		
		return new Promise ( (resolve, reject) => {
			repo.create(user, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	
	
	public insert(users:ISystemUser[]): Promise<any> {
		let repo = new SystemUserRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.insertMany( users, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	public remove( cond:Object):Promise<any> { 
		let repo = new SystemUserRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {						
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}  	

	public findOne (cond:Object):Promise<any> {

		console.log("**** Try to find: ", cond)
		// console.log(this.userDBConn);
		let repo = new SystemUserRepository( this.userDBConn );
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

export const systemUserModel = new SystemUserModel(TSYSTEMUSER);


