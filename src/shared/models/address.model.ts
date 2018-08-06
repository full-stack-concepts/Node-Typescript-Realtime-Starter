import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_USER } from "../../util/secrets";
import { ADDRESS_TYPE } from "../../util/secrets";
import { proxyService } from "../../services";
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
	
	constructor(connection:mongoose.Model<mongoose.Document>, redisClient:any) {
		super(
			ADDRESS_TYPE, 
			connection, 
			redisClient
		);
	}
}

export class AddressModel extends DefaultModel  {

	private _addressModel: IUserAddress;	

	constructor(addressModel: IUserAddress) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._addressModel = addressModel;

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new AddressRepository( this.userDBConn, this.redisClient );
		});		
	}		

}

export const addressModel = new AddressModel(TADDRESS);