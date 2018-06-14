import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_USER } from "../../util/secrets";
import { proxyService } from "../../services";
import { DefaultModel} from "./default.model";
import { TUSER } from "../types";
import { IUser } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class UserReadRepository extends ReadRepositoryBase<IUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>, redisClient:any) {
		super( 
			PERSON_SUBTYPE_USER, 
			connection, 
			redisClient
		);
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

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new UserReadRepository( this.userDBConn, this.redisClient );
		});		
	}	

	/****
	 * Define custom methods for UserRead Model here
	 */	
	

}

export const userReadModel = new UserReadModel(TUSER);

