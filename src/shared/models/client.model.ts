import Promise from "bluebird";
import mongoose from "mongoose";

import { DefaultModel } from "./default.model";
import { IClient } from "../interfaces";
import { ReadWriteRepositoryBase } from "../../engines";
import { TCLIENT } from "../types";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class ClientRepository extends ReadWriteRepositoryBase<IClient> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 'Client', connection );
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
	public createUser(client:IClient): Promise<any> {
		const repo = new ClientRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.create(client, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}	

	public insert(clients:IClient[]): Promise<any> {
		const repo = new ClientRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.insertMany( clients, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	public remove( cond:Object):Promise<any> { 
		const repo = new ClientRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.remove( cond, (err:any) => {					
				if(err) {reject(err); } else { resolve(); }
			});
		});
	}	

	public findOne (cond:Object):Promise<any> {
		const repo = new ClientRepository( this.userDBConn );
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

export const clientModel:any = new ClientModel(TCLIENT);





