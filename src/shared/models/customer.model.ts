import Promise from "bluebird";
import mongoose from "mongoose";

import { DefaultModel } from "./default.model";
import { RepositoryBase, ICustomer, IListOptions } from "../interfaces";
import { TCUSTOMER } from "../types";
import { customerSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class CustomerRepository extends RepositoryBase<ICustomer> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 'Customer', connection );
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
	public createUser(customer:ICustomer): Promise<any> {
		const repo = new CustomerRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.create(customer, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	

	public insert(customers:ICustomer[]): Promise<any> {
		const repo = new CustomerRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.insertMany( customers, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	public remove( cond:Object):Promise<any> { 
		const repo = new CustomerRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {					
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	

	public findOne (cond:Object):Promise<any> {
		const repo = new CustomerRepository( this.userDBConn );
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

export const customerModel:any = new CustomerModel(TCUSTOMER);



