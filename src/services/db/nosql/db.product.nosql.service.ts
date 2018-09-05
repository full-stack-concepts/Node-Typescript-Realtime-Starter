import mongoose from "mongoose";

import {
	USE_LOCAL_MONGODB_SERVER,
	SYSTEM_DB_PRODUCTS_ADMIN_USER,
	DB_SYSTEM_USERS,
	DB_MAX_POOL_SIZE
} from "../../../util/secrets";

import { proxyService } from "../../../services";

import { INOSQLAccount} from "../interfaces";


export class NOSQL_ProductService {

	/***
	 * Proxy Service
	 */
	private proxyService:any;	

	/***
	 * Instance of Mongoose Nativce Connection
	 */
	private db:any;

	/***
	 *
	 */
	private account:INOSQLAccount;		

	constructor() {

		this.proxyService = proxyService;		

		// configure local subscribers
		this.configureSubscribers();
	}

	/****
	 * Class subscribers
	 */
	private configureSubscribers():void {					
	}

	/****
	 * Connection string
	 */
	private constructConnectionString():string {	
		const a:INOSQLAccount = this.account;
		return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	
	}	

	private defaultErrorMessage(err:Error):void {
		console.error("Local Database : Could not connect to Product Databse. Please check your configuration.");
		console.error(err);
		process.exit(1);
	}			

	/****
	 * Set up connection with Product DB 
	 */
	private async connect() {	

		/****
		 * Format Connection Object
		 */
		const account:INOSQLAccount = DB_SYSTEM_USERS.find( 
			(systemUser:INOSQLAccount) => systemUser.user === SYSTEM_DB_PRODUCTS_ADMIN_USER
		);	
		this.account = account;	 

		/****
		 * Connection String
		 */
		const connStr:string = this.constructConnectionString();

		/****
		 * Connect
		 */
		const db = mongoose.createConnection( connStr );		

		/***
		 *  DB Open Event: forward Native Injection so it can 
		 * be injected into our Mongoose models 
		 */
		db.on('open', () => { 				

			/****
			 * Propagate NativeConnnection
			 */
		 	proxyService.setProductDB(db);					

		 	/****
		 	 * Propagate LIVE state of USER DB
		 	 */
		 	proxyService.setProductDBLive();

		 	/****
		 	 * Return to caller
		 	 */
		 	return Promise.resolve();
		}); 			

		/***
		 * DB Disconnect Event
		 * Propagate OFFLINE state of USER DB
		 */
		db.on('disconnect', () => { 			 
		 	proxyService.setProductDBOffline();
		});
	}			
}

/****
 * Export for Bootstrap Controller
 */
export const connectToProductDatabase = () => {
	const instance:any = new NOSQL_ProductService();
	return instance.connect()
	.then( () => Promise.resolve() )
	.catch( (err:Error) => Promise.reject(err) );	
}


