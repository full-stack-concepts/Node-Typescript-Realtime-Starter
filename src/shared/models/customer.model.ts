import Promise from "bluebird";
import mongoose from "mongoose";

import { DefaultModel } from "./default.model";
import { RepositoryBase, ICustomer, IListOptions } from "../interfaces";

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

export class CustomerModel extends DefaultModel  {

	private _customerModel: ICustomer;	

	constructor( customerModel: ICustomer) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._customerModel = customerModel;
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	public static createUser(customer:ICustomer): Promise<any> {
		const repo = new CustomerRepository();
		return new Promise ( (resolve, reject) => {
			repo.create(customer, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	

	static insert(customers:ICustomer[]): Promise<any> {
		const repo = new CustomerRepository();
		return new Promise ( (resolve, reject) => {
			repo.insertMany( customers, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	static remove( cond:Object):Promise<any> { 
		const repo = new CustomerRepository();
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {					
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	

	public static findOne (cond:Object):Promise<any> {
		const repo = new CustomerRepository();
		return new Promise ( (resolve, reject) => {
			repo.findOne ( cond, (err:any, res:any) => {				
				if(err) {
					reject(err);
				} else if(!res) {
					resolve();
				} else {
					resolve(res)
				}
			});
		});
	}
	 
}



