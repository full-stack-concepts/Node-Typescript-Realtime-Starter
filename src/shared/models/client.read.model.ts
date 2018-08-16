import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_CLIENT } from "../../util/secrets";
import { DefaultModel } from "./default.model";
import { IClient } from "../interfaces";
import { ReadRepositoryBase } from "../../engines";
import { TCLIENT } from "../types";
import { LoggerController } from "../../controllers";

/***
 * Local Repository that contains all methods for 
 * local instance of MongoDB
 */
export class ClientReadRepository extends ReadRepositoryBase<IClient> {
	
	constructor(connection:mongoose.Model<mongoose.Document> ) {
		super( 
			PERSON_SUBTYPE_CLIENT, 
			connection			
		);
	}
}

export class ClientReadModel extends DefaultModel  {

	/***
	 * Database Connection Type for this model: users
	 */
	private dbType:number = 1;

	private _clientModel: IClient;	

	constructor(clientModel: IClient) {

		/****
		 * Call Parent Constructor
		 */
		super();

		this._clientModel = clientModel;

		this.launchRepository();		
	}	

	/***
	 *
	 */
	private async launchRepository() {

		this.repoConstructor = ClientReadRepository;	

		await this.createRepo(this.dbType);			
	}	
	
}

export const clientReadModel:any = new ClientReadModel(TCLIENT);





