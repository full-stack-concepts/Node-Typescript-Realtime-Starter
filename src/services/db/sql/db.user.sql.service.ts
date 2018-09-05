import mysql from "mysql";

import {
	SQL_CONNECTION_SETTINGS	
} from "../../../util/secrets";

import { IConnection  } from "../../../shared/interfaces";

import { ISQLAccount} from "../interfaces";

import { proxyService } from "../../../services";

export class SQL_UserService {

	// Instance of SQL Connection	
	private connection:any;

   	// Proxy Service	
	private proxyService:any = proxyService;

    // 
	private account:ISQLAccount;	

	constructor() {		

		/****
		 * Return if local MongoDB instance is 
		 * not configured in environmental file (.env or .prod)
		 */
		if(!SQL_CONNECTION_SETTINGS.USE_LOCAL_SQL_SERVER) return;		

		// Configure Subscribers	
		this.configureSubscribers();
	}

	/****
	 * Connect after DBAdmin signals that DB Account for this db exists
	 */
	private configureSubscribers():void {		

		this.proxyService.connectUsersDatabase$.subscribe( (state:boolean) => this.connect() );	

	}

	/****
	 * Set up connection with SQL Users DB
	 */
	private async connect() {	
		
	}

}

/****
 * Export for Bootstrap Controller
 */
export const connectToSQLUserDatabase = () => {
	const instance:any = new SQL_UserService();
	return instance.connect()
	.then( () => Promise.resolve() )
	.catch( (err:Error) => Promise.reject(err) );	
}