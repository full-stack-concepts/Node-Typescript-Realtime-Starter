import Promise from "bluebird";
import mongoose from "mongoose";

import { ADDRESS_TYPE } from "../../util/secrets";
import { DefaultModel} from "./default.model";
import { TADDRESS } from "../types";
import { IUserAddress } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class AddressReadRepository extends ReadRepositoryBase<IUserAddress> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 
			ADDRESS_TYPE, 
			connection
		);
	}
}

export class AddressReadModel extends DefaultModel  {

	/***
	 * Database Connection Type for this model: users
	 */
	private dbType:number = 1;

	private _addressModel: IUserAddress;	

	constructor(addressModel: IUserAddress) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._addressModel = addressModel;

		this.launchRepository();		
	}	

	/***
	 *
	 */
	private async launchRepository() {

		this.repoConstructor = AddressReadRepository;	

		await this.createRepo(this.dbType);			
	}	

	/****
	 * Define custom methods for UserRead Model here
	 */	
	

}

export const addressReadModel:AddressReadModel = new AddressReadModel(TADDRESS);

