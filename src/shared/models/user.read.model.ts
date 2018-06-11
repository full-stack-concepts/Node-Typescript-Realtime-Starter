import Promise from "bluebird";
import mongoose from "mongoose";

import { DefaultModel} from "./default.model";
import { TUSER } from "../types";
import { IUser } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class UserReadRepository extends ReadRepositoryBase<IUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super('User', connection);
	}
}

export class UserReadModel extends DefaultModel  {

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
	public findAll ( query:Object={}, fields:Object={}, options:Object={}):Promise<any> {
		const repo = new UserReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.find ( {}, fields, options, (err:any, res:any) => {					
				if(err) { reject(err);} 
				else if(!res) {  resolve(); } 
				else {  resolve(res); }
			});
		});
	}

	public find (query:Object, fields:Object={}, options:Object={} ):Promise<any> {
		const repo = new UserReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.find ( query, fields, options, (err:any, res:any) => {					
				if(err) {  reject(err); } 
				else if(!res) { resolve(); } 
				else { resolve(res); }
			});
		});
	}

	
	public findOne (query:Object):Promise<any> {
		const repo = new UserReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.findOne ( query, (err:any, res:any) => {					
				if(err) { reject(err); } 
				else if(!res) { resolve(); } 
				else { resolve(res); }
			});
		});
	}

	public findById(id:string):Promise<any> {
		const repo = new UserReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.findById ( id, (err:any, res:any) => {					
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}
}

export const userReadModel = new UserReadModel(TUSER);

