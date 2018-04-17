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
	static insert(customers:ICustomer[]): Promise<any> {
		let repo = new CustomerRepository();
		return new Promise ( (resolve, reject) => {
			repo.insertMany( customers, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	static remove( cond:Object):Promise<any> { 
		let repo = new CustomerRepository();
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {					
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	
	 
}



