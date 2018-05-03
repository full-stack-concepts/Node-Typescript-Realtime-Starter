import Promise from "bluebird";
import mongoose from "mongoose";
const MongoDB = require("mongodb");

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

import { IConnection } from "../shared/interfaces";
import { proxyService } from "../services";

/****
 * Default Connection Settings Object
 */
const a:IConnection = {
	host: DB_CONFIG_HOST, 
	user: DB_CONFIG_USER,
	password: DB_CONFIG_PASSWORD,
	port: DB_CONFIG_PORT,
	db: DB_CONFIG_DATABASE
}

const MongoClient = MongoDB.MongoClient;
Promise.promisifyAll(MongoDB);
Promise.promisifyAll(MongoClient);


interface IDB_GET_ROLE_OPTION {
	rolesInfo: number,
	showPriviliges: boolean,
	showBuiltinRoles: boolean;
}

export class DBOpsService {

	/***
	 * Proxy Service
	 */
	private proxyService:any;

	/***
	 * Instance of MongoDB CLient
	 */
	private client:any;

	/***
	 * Instance of Mongoose CLient
	 */
	private db:any;

	/***
	 * Admin Database
	 */
	private adminDB:any

	/***
	 * System UserID 
	 */
	private systemUserID:mongoose.Types.ObjectId;

	/***
	 * required roles
	 */ 
	private requiredRoles:string[] = [
		'manageOpRole',
		'mongostatRole',
		'dropSystemViewsAnyDatabase'
	];

	/***
	 * Current roles
	 */
	currentRoles:string[]=[];

	constructor() {

		this.proxyService = proxyService;		

		// configure local subscribers
		this.configureSubscribers();
	}

	/****
	 * Class subscribers
	 */
	private configureSubscribers():void {	

		/****
		 * Subscriber: proxyService flags to test MongoClient
		 * get instance through get call to proxy service
		 */		
		this.proxyService.mongoClient$.subscribe( (state:boolean) => {		
			if(state) this.adminDB = this.testMongoClient();
		});	

		/****
		 * Subscriber: Mongoose Native Connection
		 */			
		this.proxyService.localDBInstance$.subscribe( (state:boolean) => {
			if(proxyService.db) this.db = proxyService.db;		
		});	

		/****
		 * Subscriber:
		 */
		this.proxyService.dbUser$.subscribe( (userID:mongoose.Types.ObjectId) => {
			this.systemUserID = userID;
			console.log(userID)
		})

	}

	/****
	 * Set up connectoin with MoongoDB Admin DB
	 */
	private connect() {

		/****
		 * Connection String
		 */
		const connStr:string = this.constructAdminConnectionString();	
		
		/****
		 * Connect
		 */
		return MongoClient.connect( connStr )		

		/****
		 * Retunn to caller
		 */
		.then( (client:any) => Promise.resolve( this.client = client) )

		/****
		 * Critical error
		 */
		 .catch( (err:any) => this.defaultErrorMessage(err) );		

	}

	private constructAdminConnectionString():string {
		return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${DB_MAX_POOL_SIZE_ADMIN_CONN}`;	
	}	

	/****
	 * Select Admin DB (Mongoclient 3.0 and up)
	 */
	private selectAdminDB() {
		return new Promise ( (resolve, reject) => {
			this.adminDB = this.client.db("admin").admin();
			resolve();
		});		
	}

	/****
	 * List Current Databases
	 */
	private listDatabases() {
		return this.adminDB.listDatabases()
		.then( (list:any) => {
			console.log(list)
			Promise.resolve(list)
		})
		.catch( (err:any) => Promise.reject(err) );
	}

	private closeConnection():void {
		this.client.close();
	}

	/****
	 * Current Database Roles
	 */
	private getCurrentDBRoles() {
		
		const options:IDB_GET_ROLE_OPTION = {
			rolesInfo: 1,
			showPriviliges: true,
			showBuiltinRoles: false
		}

		return this.adminDB.command({rolesInfo:1, showBuiltinRoles:1})	
		.then( (roles:any) => Promise.resolve(roles) )
		.catch( (err:any) => Promise.reject(err) );
	}

	/***
	 * Return a list of required roles
	 */
	private evalRoles( list:any):string[] {
		return this.requiredRoles.map( ( requiredRole:string) => {			
			if(!list.roles.find( (role:string) => role === requiredRole ) ) {			
				return requiredRole;
			}
		});
	}

	private defaultErrorMessage(err:any):void {
		console.error("Local Database : Could not configure MongoClient.Please check your configuration.");
		console.error(err);
		process.exit(1);
	}		

	/****
	 *
	 */
	public testMongoClient() {		

		// process thick: connect
		return this.connect()
		
		// process thick: set Admin DB
		.then( () => this.selectAdminDB() )

		// process thick: list databases
		.then( () => this.listDatabases() )

		// process thick: get current db roles
		.then( () => this.getCurrentDBRoles() )

		// process thick: eval roles
		.then( (roles:string[]) => this.evalRoles(roles) )

		// process thick:
		.then( ( roles:string[] ) => {
			this.currentRoles = roles 
			return console.log("*** Current undefined roles ", this.currentRoles )
		})

		// process thick: clsoe conenction
		.then( () => this.closeConnection() )

		// process thick: return to caller
		.then( () => Promise.resolve() )

		.catch( (err:any) => this.defaultErrorMessage(err) );	
	
	}

	/****
	 *
	 */
	public addUser() {

	}

	/****
	 *
	 */
	public modifyUser() {}
}


