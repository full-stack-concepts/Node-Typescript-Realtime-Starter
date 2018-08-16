import Promise from "bluebird";
import mongoose from "mongoose";

import { PERSON_SUBTYPE_CLIENT } from "../../util/secrets";
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
	
	constructor(connection:mongoose.Model<mongoose.Document> ) {
		super( 
			PERSON_SUBTYPE_CLIENT, 
			connection
		);
	}
}
 
export class ClientModel extends DefaultModel  {

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

		this.repoConstructor = ClientRepository;	

		await this.createRepo(this.dbType);			
	}	

	/****
	 * Define custom methods for local instance of MongoDB here	
	 */
	public createUser(client:IClient): Promise<any> {
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.create(client, (err:Error, res:any) => {			
				if(err) { reject(err);} else { resolve(res);}
			});
		});
	}		
}

export const clientModel:any = new ClientModel(TCLIENT);





