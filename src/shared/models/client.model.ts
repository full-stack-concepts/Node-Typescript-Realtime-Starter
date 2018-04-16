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
	 
}





