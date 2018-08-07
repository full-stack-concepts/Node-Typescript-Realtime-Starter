import Promise from "bluebird";
import mongoose from "mongoose";

import { ADDRESS_TYPE } from "../../util/secrets";
import { proxyService } from "../../services";
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
	
	constructor(connection:mongoose.Model<mongoose.Document>, redisClient:any) {
		super( 
			ADDRESS_TYPE, 
			connection, 
			redisClient
		);
	}
}

export class AddressReadModel extends DefaultModel  {

	private _addressModel: IUserAddress;	

	constructor(addressModel: IUserAddress) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._addressModel = addressModel;

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new AddressReadRepository( this.userDBConn, this.redisClient );		
		});		
	}	

	/****
	 * Define custom methods for UserRead Model here
	 */	
	

}

export const addressReadModel:AddressReadModel = new AddressReadModel(TADDRESS);

