import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_SYSTEM_USER } from "../../util/secrets";
import { proxyService } from "../../services";
import { DefaultModel} from "./default.model";
import { ISystemUser } from "../interfaces";
import { ReadWriteRepositoryBase } from "../../engines";
import { TSYSTEMUSER } from "../types";
import { ApplicationLogger } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class SystemUserRepository extends ReadWriteRepositoryBase<ISystemUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>, redisClient:any) {
		super( 
			PERSON_SUBTYPE_SYSTEM_USER, 
			connection, 
			redisClient
		);
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

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new SystemUserRepository( this.userDBConn, this.redisClient );

			 // log event 
	        ApplicationLogger.application({
	            section:'BootstrapController', 
	            eventID: 1016	, 
	            action: 'DB SystemUser ReadWrite Model and Repository has initialized.'
	        });
		});		
	}			

	/****
	 * Define custom methods for local onstance of MongoDB here	
	 */
	public createUser(user:ISystemUser): Promise<any> {			
		const repo = new SystemUserRepository( this.userDBConn, this.redisClient );		
		return new Promise ( (resolve, reject) => {
			repo.create(user, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	

}

export const systemUserModel = new SystemUserModel(TSYSTEMUSER);


