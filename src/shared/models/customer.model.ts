import Promise from "bluebird";
import mongoose from "mongoose";
import fetch from "node-fetch";

import { 
	RepositoryBase, 
	ICustomer,
	IListOptions
} from "../interfaces";

import { customerSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class CustomerRepository extends RepositoryBase<ICustomer> {
	
	constructor() {
		super(customerSchema);
	}
}

export class CustomerModel  {

	private _customerModel: ICustomer;	

	constructor( customerModel: ICustomer) {
		this._customerModel = customerModel;
	}

	/****
	 * Custom Methods for MLAB Mongo Databse				
	 */

	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	 
}



