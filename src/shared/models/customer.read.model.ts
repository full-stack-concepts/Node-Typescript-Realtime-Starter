import Promise from "bluebird";
import mongoose from "mongoose";

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
	public find(query:any, fields?:any, options?:any):Promise<any> {
		const repo = new CustomerReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.find(query, fields, options, (err:any, result:any) => {
				(err)? resolve(result):reject(err);
			});
		});
	}

	public findOne (cond:Object):Promise<any> {
		const repo = new CustomerReadRepository( this.userDBConn );
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

export const customerReadModel:any = new CustomerReadModel(TCUSTOMER);



