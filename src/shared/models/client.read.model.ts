import Promise from "bluebird";
import mongoose from "mongoose";

import { DefaultModel } from "./default.model";
import { IClient } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { TCLIENT } from "../types";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
class ClientReadRepository extends ReadRepositoryBase<IClient> {
	
	constructor(connection:mongoose.Model<mongoose.Document>) {
		super( 'Client', connection );
	}
}

export class ClientReadModel extends DefaultModel  {

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
	public find(query:any, fields?:any, options?:any):Promise<any> {
		const repo = new ClientReadRepository( this.userDBConn );
		return new Promise ( (resolve, reject) => {
			repo.find(query, fields, options, (err:any, result:any) => {
				(err)? resolve(result):reject(err);
			});
		});
	}

	public findOne (cond:Object):Promise<any> {
		const repo = new ClientReadRepository( this.userDBConn );
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

export const clientReadModel:any = new ClientReadModel(TCLIENT);





