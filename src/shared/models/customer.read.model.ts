import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_CUSTOMER } from "../../util/secrets";
import { DefaultModel } from "./default.model";
import { ICustomer } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { TCUSTOMER } from "../types";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class CustomerReadRepository extends ReadRepositoryBase<ICustomer> {
	
	constructor(connection:mongoose.Model<mongoose.Document> ) {
		super( 
			PERSON_SUBTYPE_CUSTOMER, 
			connection
		);
	}
}

export class CustomerReadModel extends DefaultModel  {

	/***
	 * Database Connection Type for this model: users
	 */
	private dbType:number = 1;

	private _customerModel: ICustomer;	

	constructor(customerModel: ICustomer) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._customerModel = customerModel;

		this.launchRepository();		
	}	

	/***
	 *
	 */
	private async launchRepository() {

		this.repoConstructor = CustomerReadRepository;	

		await this.createRepo(this.dbType);			
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	
	
}

export const customerReadModel:any = new CustomerReadModel(TCUSTOMER);



