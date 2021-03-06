import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_USER } from "../../util/secrets";
import { proxyService } from "../../services";
import { DefaultModel} from "./default.model";
import { TUSER } from "../types";
import { IUser } from "../interfaces";
import { ReadWriteRepositoryBase } from "../../engines";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class UserRepository extends ReadWriteRepositoryBase<IUser> {
	
	constructor(connection:mongoose.Model<mongoose.Document>, redisClient:any) {
		super(
			PERSON_SUBTYPE_USER, 
			connection, 
			redisClient
		);
	}
}

export class UserModel extends DefaultModel  {

	private _userModel: IUser;	

	constructor(userModel: IUser) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._userModel = userModel;

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new UserRepository( this.userDBConn, this.redisClient );
		});		
	}	

	/****
	 * Define custom methods for User Model Only	
	 */
	public createUser(user:IUser): Promise<any> {
		const repo = new UserRepository( this.userDBConn, this.redisClient );
		return new Promise ( (resolve, reject) => {
			repo.create(user, (err:Error, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}			

}

export const userModel = new UserModel(TUSER);

