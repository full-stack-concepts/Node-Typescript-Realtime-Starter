import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_CUSTOMER } from "../../util/secrets";
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
	
	constructor(connection:mongoose.Model<mongoose.Document> ) {
		super( 
			PERSON_SUBTYPE_CUSTOMER, 
			connection
		);
	}
}

export class CustomerModel extends DefaultModel  {

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

		this.repoConstructor = CustomerRepository;	

		await this.createRepo(this.dbType);			
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	public createUser(customer:ICustomer): Promise<any> {	
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.create(customer, (err:Error, res:any) => {						
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}		
}

export const customerModel:any = new CustomerModel(TCUSTOMER);



