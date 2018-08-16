import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_USER } from "../../util/secrets";
import { DefaultModel} from "./default.model";
import { TUSER } from "../types";
import { IUser } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class UserReadRepository extends ReadRepositoryBase<IUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document> ) {
		super( 
			PERSON_SUBTYPE_USER, 
			connection
		);
	}
}

export class UserReadModel extends DefaultModel  {

	/***
	 * Database Connection Type for this model: users
	 */
	private dbType:number = 1;

	private _userModel: IUser;	

	constructor(userModel: IUser) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._userModel = userModel;

		this.launchRepository();				
	}	

	/***
	 *
	 */
	private async launchRepository() {

		this.repoConstructor = UserReadRepository;	

		await this.createRepo(this.dbType);			
	}

	/****
	 * Define custom methods for UserRead Model here
	 */	
	

}

export const userReadModel:UserReadModel = new UserReadModel(TUSER);

