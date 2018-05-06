import mongoose from "mongoose";
import Promise from "bluebird";

mongoose.Promise = global.Promise;

import { deepCloneObject} from "../util";

import {
	USE_LOCAL_MONGODB_SERVER,
	DB_CONFIG_HOST,
	DB_CONFIG_PORT,
	DB_CONFIG_USER,
	DB_CONFIG_PASSWORD,
	DB_CONFIG_DATABASE,
	DB_MAX_POOL_SIZE,
	DB_MAX_POOL_SIZE_ADMIN_CONN, 

	SYSTEM_DB_USERS_ADMIN_USER, 
	SYSTEM_DB_USERS_ADMIN_PASSWORD
} from "../util/secrets";

import { 
	IConnection 
} from "../shared/interfaces";

import {
	proxyService
} from "../services";

/****
 * Default Connection Settings Object
 */
const c:IConnection = {
	host: DB_CONFIG_HOST, 
	user: SYSTEM_DB_USERS_ADMIN_USER,
	password: SYSTEM_DB_USERS_ADMIN_PASSWORD,
	port: DB_CONFIG_PORT,
	db: "gitlab"
}

const a:IConnection = deepCloneObject(c);
a.db = "admin";


/******************
 * Before connecting create a DB Admin with your mongo interface
 * db.createUser({user: DB_CONFIG_USER, pwd: DB_CONFIG_PASSWORD, roles: [{role: "dbOwner", db: DB_CONFIG_DATABASE}]});
 *
 */
export class DBUserService {

 	public _live:boolean; 	

    // inject proxy service
    private proxyService:any = proxyService;
	
	private get live():boolean {
		return this._live;
	}
		
	private set live(state:boolean){
		this._live = state;
	}

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

		this.proxyService.db$.subscribe( (state:boolean) => this._live = state );	

		/****
		 * Connect after DBAdmin signals that DB Account for this db exists
		 */

		this.proxyService.connectUsersDatabase$.subscribe( (state:boolean) => this.connect() );	

	}

	private constructConnectionString():string {
		return `mongodb://${c.user}:${c.password}@${c.host}:${c.port}/${c.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	
	}

	private constructAdminConnectionString():string {
		return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${DB_MAX_POOL_SIZE_ADMIN_CONN}`;	
	}

	private defaultErrorMessage(err:any):void {
		console.error("Local Database : Could not connect to local instance of MONGODB or authentication failed. Please check your configuration.");
		console.error(err);
		process.exit(1);
	}

	/****
	 * Set up connection with default DB 
	 */
	private connect() {		

		/****
		 * Connection String
		 */
		const connStr:string = this.constructConnectionString();

		/****
		 * Connect
		 */
		return mongoose.connect( connStr )

		/****
		 * Propagate Native Connection
		 */
		.then( () => {

			/****
			 * Native Connection
			 */
			const db:any = mongoose.connection;	

			/****
			 * Propagate NativeConnnection
			 */
		 	proxyService.setUserDB(db);					

		 	/****
		 	 * Propagate DB is live
		 	 */
		 	proxyService.setUserDBLive();

			/****
			 * Listen for connection errors
			 */
			db.on('error', (err:any) =>  this.defaultErrorMessage(err) );

			/****
			 * On DB Open Event
			 */
			db.on('open', () => {});
		})

		/****
		 * Critical Error
		 */
		 .catch( (err:any) => this.defaultErrorMessage(err) );	

	}		

}