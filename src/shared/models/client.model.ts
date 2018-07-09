import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_CLIENT } from "../../util/secrets";
import { proxyService } from "../../services";
import { DefaultModel } from "./default.model";
import { IClient } from "../interfaces";
import { ReadWriteRepositoryBase } from "../../engines";
import { TCLIENT } from "../types";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class ClientRepository extends ReadWriteRepositoryBase<IClient> {
	
	constructor(connection:mongoose.Model<mongoose.Document>, redisClient:any) {
		super( 
			PERSON_SUBTYPE_CLIENT, 
			connection, 
			redisClient 
		);
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

		proxyService.userDBLive$.subscribe( (state:boolean) => {				

			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new ClientRepository( this.userDBConn, this.redisClient );			
		});		
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	public createUser(client:IClient): Promise<any> {
		const repo = new ClientRepository( this.userDBConn, this.redisClient );
		return new Promise ( (resolve, reject) => {
			repo.create(client, (err:any, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}		
}

export const clientModel:any = new ClientModel(TCLIENT);





