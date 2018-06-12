import Promise from "bluebird";
import mongoose from "mongoose";

import { proxyService } from "../../services";
import { DefaultModel } from "./default.model";
import { ICustomer } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { TCUSTOMER } from "../types";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class CustomerReadRepository extends ReadRepositoryBase<ICustomer> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 'Customer', connection );
	}
}

export class CustomerReadModel extends DefaultModel  {

	private _customerModel: ICustomer;	

	constructor(customerModel: ICustomer) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._customerModel = customerModel;

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new CustomerReadRepository( this.userDBConn );
		});		
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	
	
}

export const customerReadModel:any = new CustomerReadModel(TCUSTOMER);



