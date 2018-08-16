import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_USER } from "../../util/secrets";
import { ADDRESS_TYPE } from "../../util/secrets";
import { DefaultModel} from "./default.model";
import { TADDRESS } from "../types";
import { IUserAddress } from "../interfaces";
import { ReadWriteRepositoryBase } from "../../engines";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class AddressRepository extends ReadWriteRepositoryBase<IUserAddress> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super(
			ADDRESS_TYPE, 
			connection		
		);
	}
}

export class AddressModel extends DefaultModel  {

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

		this.repoConstructor = AddressRepository;	

		await this.createRepo(this.dbType);			
	}	

}

export const addressModel = new AddressModel(TADDRESS);