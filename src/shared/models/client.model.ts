import Promise from "bluebird";
import mongoose from "mongoose";
import fetch from "node-fetch";

import { RepositoryBase,  IClient, IListOptions } from "../interfaces";
import { clientSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class ClientRepository extends RepositoryBase<IClient> {
	
	constructor() {
		super(clientSchema);
	}
}

export class ClientModel  {

	private _clientModel: IClient;	

	constructor(clientModel: IClient) {
		this._clientModel = clientModel;
	}

	/****
	 * Custom Methods for MLAB Mongo Databse				
	 */

	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */

	static insert(clients:IClient[]): Promise<any> {
		let repo = new ClientRepository();
		return new Promise ( (resolve, reject) => {
			repo.insertMany( clients, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	static remove( cond:Object):Promise<any> { 
		let repo = new ClientRepository();
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {					
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	
	 
}





