import mongoose from "mongoose";

import { deepCloneObject} from "../../util";

import {
	USE_LOCAL_MONGODB_SERVER,	
	DB_CONFIG_PORT,
	DB_CONFIG_USER,	
	DB_MAX_POOL_SIZE,
	DB_MAX_POOL_SIZE_ADMIN_CONN, 
	DB_SYSTEM_USERS,
	SYSTEM_DB_USERS_ADMIN_USER
	
} from "../../util/secrets";

import { 
	IConnection 
} from "../../shared/interfaces";

import {
	proxyService
} from "../../services";

interface IConnectAccount {
	user: string, 
	password: string,
	host:string,
	db: string, 
	port: number,
	type: number
}

/******************
 * Before connecting create a DB Admin with your mongo interface
 * db.createUser({user: DB_CONFIG_USER, pwd: DB_CONFIG_PASSWORD, roles: [{role: "dbOwner", db: DB_CONFIG_DATABASE}]});
 *
 */
export class DBUserService {

 	/***
	 * Instance of Mongoose Nativce Connection
	 */
	private db:any;

   	/***
	 * Proxy Service
	 */
	private proxyService:any = proxyService;

    /***
	 *
	 */
	private account:IConnectAccount;	

	constructor() {		

		/****
		 * Return if local MongoDB instance is 
		 * not configured in environmental file (.env or .prod)
		 */
		if(!USE_LOCAL_MONGODB_SERVER) return;		

		/****
		 * Configure Subscribers
		 */
		this.configureSubscribers();
	}

	private configureSubscribers():void {		

		/****
		 * Connect after DBAdmin signals that DB Account for this db exists
		 */

		this.proxyService.connectUsersDatabase$.subscribe( (state:boolean) => this.connect() );	

	}

	private constructConnectionString():string {
		const a:IConnectAccount = this.account;
		return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	
	}	

	private defaultErrorMessage(err:any):void {
		console.error("Local Database : Could not connect to local instance of MONGODB or authentication failed. Please check your configuration.");
		console.error(err);
		process.exit(1);
	}

	/****
	 * Set up connection with default DB 
	 */
	private async connect() {	

		/****
		 * Format Connection Object
		 */
		 const account:IConnectAccount = DB_SYSTEM_USERS.find( 
		 	(systemUser:IConnectAccount) => systemUser.user === SYSTEM_DB_USERS_ADMIN_USER
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
		 	proxyService.setUserDB(db);					

		 	/****
		 	 * Propagate LIVE state of USER DB
		 	 */
		 	proxyService.setUserDBLive();

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
		 	proxyService.setUserDBOffline();
		});
	}		
}

/****
 * Export for Bootstrap Controller
 */
export const connectToUserDatabase = () => {
	const instance:any = new DBUserService();
	return instance.connect()
	.then( () => Promise.resolve() )
	.catch( (err:any) => Promise.reject(err) );	
}