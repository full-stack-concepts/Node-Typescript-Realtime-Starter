import Promise from "bluebird";
import mongoose from "mongoose";

import { proxyService } from "../../services";
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

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new UserReadRepository( this.userDBConn );
		});		
	}	

	/****
	 * Define custom methods for UserRead Model here
	 */	
	

}

export const userReadModel = new UserReadModel(TUSER);

