import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_SYSTEM_USER } from "../../util/secrets";
import { DefaultModel} from "./default.model";
import { ISystemUser } from "../interfaces";
import { ReadWriteRepositoryBase } from "../../engines";
import { TSYSTEMUSER } from "../types";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class SystemUserRepository extends ReadWriteRepositoryBase<ISystemUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 
			PERSON_SUBTYPE_SYSTEM_USER, 
			connection
		);
	}
}

/*****
 * Model extends Default Model which provides support for external MpngoDB Providers
 */
export class SystemUserModel extends DefaultModel  {

	/***
	 * Database Connection Type for this model: users
	 */
	private dbType:number = 1;

	private _systemUserModel: ISystemUser;	

	constructor(systemUserModel: ISystemUser) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._systemUserModel = systemUserModel;

		this.launchRepository();				
	}			

	/***
	 *
	 */
	private async launchRepository() {

		this.repoConstructor = SystemUserRepository;	
		
		await this.createRepo(this.dbType);			
	}

	/****
	 * Define custom methods for local onstance of MongoDB here	
	 */
	public createUser(user:ISystemUser): Promise<any> {			
		const repo = this.repo;		
		return new Promise ( (resolve, reject) => {
			repo.create(user, (err:Error, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	

}

export const systemUserModel = new SystemUserModel(TSYSTEMUSER);


