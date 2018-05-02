import Promise from "bluebird";

import { DefaultModel} from "./default.model";
import { RepositoryBase,  ISystemUser, IListOptions } from "../interfaces";
import { systemUserSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";


/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class SystemUserRepository extends RepositoryBase<ISystemUser> {
	
	constructor() {
		super(systemUserSchema);
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
	public static createUser(user:ISystemUser): Promise<any> {
		let repo = new SystemUserRepository();
		return new Promise ( (resolve, reject) => {
			repo.create(user, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	
	
	public static insert(users:ISystemUser[]): Promise<any> {
		let repo = new SystemUserRepository();
		return new Promise ( (resolve, reject) => {
			repo.insertMany( users, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	public static remove( cond:Object):Promise<any> { 
		let repo = new SystemUserRepository();
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {						
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	

	public static findOne (cond:Object):Promise<any> {
		let repo = new SystemUserRepository();
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

