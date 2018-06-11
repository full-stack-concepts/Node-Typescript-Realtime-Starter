import Promise from "bluebird";
import mongoose from "mongoose";

import { DefaultModel} from "./default.model";
import { ISystemUser } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { TSYSTEMUSER } from "../types";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class SystemUserReadRepository extends ReadRepositoryBase<ISystemUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 'SystemUser', connection);
	}
}

/*****
 * Model extends Default Model which provides support for external MpngoDB Providers
 */
export class SystemUserReadModel extends DefaultModel  {

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
	public find(query:any, fields?:any, options?:any):Promise<any> {
		const repo = new SystemUserReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.find(query, fields, options, (err:any, result:any) => {
				(err)? resolve(result):reject(err);
			});
		});
	}	
	
	public findOne (query:Object):Promise<any> {
		console.log("** Find System User ", query)
		const repo = new SystemUserReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.findOne ( query, (err:any, res:any) => {					
				if(err) { reject(err); } 
				else if(!res) { resolve(); } 
				else { resolve(res); }
			});
		});
	}
}

export const systemUserReadModel = new SystemUserReadModel(TSYSTEMUSER);


