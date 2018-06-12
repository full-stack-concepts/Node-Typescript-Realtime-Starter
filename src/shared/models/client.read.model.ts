import Promise from "bluebird";
import mongoose from "mongoose";

import { proxyService } from "../../services";
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

		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			if(proxyService.userDB) this.userDBConn = proxyService.userDB;				
			this.repo = new ClientReadRepository( this.userDBConn );
		});		
	}	
	
}

export const clientReadModel:any = new ClientReadModel(TCLIENT);





