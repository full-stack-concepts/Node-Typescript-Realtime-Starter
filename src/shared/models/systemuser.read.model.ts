import Promise from "bluebird";
import mongoose from "mongoose";

import { proxyService } from "../../services";
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

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new SystemUserReadRepository( this.userDBConn );
		});		
	}				

	/****
	 * Define custom methods for local onstance of MongoDB here	
	 */
	
}

export const systemUserReadModel = new SystemUserReadModel(TSYSTEMUSER);


