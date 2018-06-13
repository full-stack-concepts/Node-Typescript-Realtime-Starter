/****
 * Wrapper for Database Methods
 */

import mongoose from "mongoose";
mongoose.Promise = global.Promise;

/****
 * DB Settings
 */
import {	
	TEST_ACCOUNT_USER_DB_ADMIN,
	TEST_ACCOUNT_PRODUCT_DB_ADMIN,
	DB_MAX_POOL_SIZE
} from "../../../src/util/secrets";



/****
 * Database Connections
 */
export class DataBaseConnections {
	
	public  userDB:any;
	public productDB:any;

	private constructUserDBConnectionString():string {
		const a:any = TEST_ACCOUNT_USER_DB_ADMIN;
		return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	
	}	

	private constructProductDBConnectionString():string {
		const a:any = TEST_ACCOUNT_PRODUCT_DB_ADMIN;
		return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	
	}	

	public closeConnection():void {
		mongoose.connection.close();
	}

	/****
	 * 
	 */
	public initUserDatabase() {	

		try {		
			let mongoURI:string = this.constructUserDBConnectionString();	
			const db:any = 	mongoose.createConnection( mongoURI );			
			return db;
		} catch(e) {
			console.log(e);
		}		
	}

	/****
	 *
	 */
	public initProductDatabase():void {

		try {		
			let mongoURI:string = this.constructProductDBConnectionString();			
			const db:any = 	mongoose.createConnection( mongoURI );			
			return db;
		} catch(e) {
			console.log(e);
		}			
	}
}

export const dbTestEnvironment:DataBaseConnections = new DataBaseConnections();