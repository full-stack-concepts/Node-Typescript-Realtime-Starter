import Promise from "bluebird";

import { DefaultModel } from "./default.model";
import { RepositoryBase,  IClient, IListOptions } from "../interfaces";
import { clientSchema } from "../schemas";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class ClientRepository extends RepositoryBase<IClient> {
	
	constructor() {
		super(clientSchema, 'client');
	}
}


export class ClientModel extends DefaultModel  {

	private _clientModel: IClient;	

	constructor(clientModel: IClient) {

		/****
		 * Call Parent Constructor
		 */
		super();
		
		this._clientModel = clientModel;
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	public static createUser(client:IClient): Promise<any> {
		const repo = new ClientRepository();
		return new Promise ( (resolve, reject) => {
			repo.create(client, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	

	static insert(clients:IClient[]): Promise<any> {
		const repo = new ClientRepository();
		return new Promise ( (resolve, reject) => {
			repo.insertMany( clients, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	static remove( cond:Object):Promise<any> { 
		const repo = new ClientRepository();
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {					
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	

	public static findOne (cond:Object):Promise<any> {
		const repo = new ClientRepository();
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





