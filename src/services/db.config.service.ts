import mongoose from "mongoose";
import Promise from "bluebird";
const MongoDB = require("mongodb");
const MongoClient = MongoDB.MongoClient;


Promise.promisifyAll(MongoDB);
Promise.promisifyAll(MongoClient);
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
	DB_MAX_POOL_SIZE_ADMIN_CONN
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
	user: DB_CONFIG_USER,
	password: DB_CONFIG_PASSWORD,
	port: DB_CONFIG_PORT,
	db: DB_CONFIG_DATABASE
}

const a:IConnection = deepCloneObject(c);
a.db = "admin";


/******************
 * Before connecting create a DB Admin with your mongo interface
 * db.createUser({user: DB_CONFIG_USER, pwd: DB_CONFIG_PASSWORD, roles: [{role: "dbOwner", db: DB_CONFIG_DATABASE}]});
 *
 */
export class DBConfigService {

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
		 * Connect to local MongoDB Instance
		 */
		this.connect();

		/****
		 * Connect to local MongoDB Admin Database
		 */
		this.adminConnect()

		/****
		 * Configure Subscribers
		 */
		this.configureSubscribers();
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
		 	proxyService.setLocalDBInstance(db);					

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

	/****
	 * Set up connectoin with MoongoDB Admin DB
	 */
	private adminConnect() {

		/****
		 * Connection String
		 */
		const connStr:string = this.constructAdminConnectionString();	
		
		/****
		 * Connect
		 */
		return MongoClient.connect( connStr )

		/****
		 * Propagate Admin DB Native Connection
		 */
		.then( (db:any) => {
			proxyService.setLocalAdminDbInstance(db);	
			proxyService.adminDB$.next(true);
		})

		/****
		 * Retunn to caller
		 */
		.then( () => Promise.resolve() )

		/****
		 * Critical error
		 */
		 .catch( (err:any) => this.defaultErrorMessage(err) );		

	}

	private configureSubscribers():void {

		this.proxyService.db$.subscribe( (state:boolean) => this._live = state );		

	}

}