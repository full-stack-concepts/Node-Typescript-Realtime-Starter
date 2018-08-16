import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_USER } from "../../util/secrets";
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
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super(
			PERSON_SUBTYPE_USER, 
			connection
		);
	}
}

export class UserModel extends DefaultModel  {

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

		this.repoConstructor = UserRepository;	

		await this.createRepo(this.dbType);			
	}

	/****
	 * Define custom methods for User Model Only	
	 */
	public createUser(user:IUser): Promise<any> {
		const repo = this.repo;		
		return new Promise ( (resolve, reject) => {
			repo.create(user, (err:Error, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}			

}

export const userModel = new UserModel(TUSER);

