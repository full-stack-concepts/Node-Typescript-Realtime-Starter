import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_SYSTEM_USER } from "../../util/secrets";
import { DefaultModel} from "./default.model";
import { ISystemUser } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { TSYSTEMUSER } from "../types";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class SystemUserReadRepository extends ReadRepositoryBase<ISystemUser> {
	
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
export class SystemUserReadModel extends DefaultModel  {

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

		this.repoConstructor = SystemUserReadRepository;	

		await this.createRepo(this.dbType);			
	}

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	
}

export const systemUserReadModel = new SystemUserReadModel(TSYSTEMUSER);


