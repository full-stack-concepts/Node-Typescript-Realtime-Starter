import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_CUSTOMER } from "../../util/secrets";
import { proxyService } from "../../services";
import { DefaultModel } from "./default.model";
import { ICustomer } from "../interfaces";
import { ReadWriteRepositoryBase } from "../../engines";
import { TCUSTOMER } from "../types";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class CustomerRepository extends ReadWriteRepositoryBase<ICustomer> {
	
	constructor(connection:mongoose.Model<mongoose.Document>, redisClient:any) {
		super( 
			PERSON_SUBTYPE_CUSTOMER, 
			connection, 
			redisClient 
		);
	}
}

export class CustomerModel extends DefaultModel  {

	private _customerModel: ICustomer;	

	constructor(customerModel: ICustomer) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._customerModel = customerModel;

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new CustomerRepository( this.userDBConn, this.redisClient );			
		});		
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	public createUser(customer:ICustomer): Promise<any> {	
		const repo = new CustomerRepository( this.userDBConn, this.redisClient );
		return new Promise ( (resolve, reject) => {
			repo.create(customer, (err:any, res:any) => {						
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}		
}

export const customerModel:any = new CustomerModel(TCUSTOMER);



