import Promise from "bluebird";
const MongoDB = require("mongodb");

import {

	/***
	 * SuperAdmin Credentials
	 */
	SYSTEM_ADMIN_USER,
	SYSTEM_ADMIN_PASSWORD,

	/***
	 * MongoDB settings: db names
	 */
	DB_USERS_DATABASE_NAME,
	DB_PRODUCT_DATABASE_NAME,

	/***
	 * Ssytem DB Accounts
	 */
	SYSTEM_DB_USERS_ADMIN_USER,
	SYSTEM_DB_USERS_ADMIN_PASSWORD,
	SYSTEM_DB_USERS_READONLY_USER,
	SYSTEM_DB_USERS_READONLY_PASSWORD,

	SYSTEM_DB_PRODUCTS_ADMIN_USER,
	SYSTEM_DB_PRODUCTS_ADMIN_PASSWORD,
	SYSTEM_DB_PRODUCTS_READONLY_USER,
	SYSTEM_DB_PRODUCTS_READONLY_PASSWORD,

	/***
	 * MongoDB connection settings
	 */
	USE_LOCAL_MONGODB_SERVER,
	DB_CONFIG_HOST,
	DB_CONFIG_PORT,
	DB_CONFIG_USER,
	DB_CONFIG_PASSWORD,
	DB_CONFIG_DATABASE,
	DB_MAX_POOL_SIZE,
	DB_MAX_POOL_SIZE_ADMIN_CONN,

	/***
	 * Usage of pre-defined user-subtype collections
	 */
	USE_PERSON_SUBTYPE_USER,
	USE_PERSON_SUBTYPE_CLIENT,
	USE_PERSON_SUBTYPE_CUSTOMER

} from "../util/secrets";

import { ISystemUser, IConnection } from "../shared/interfaces";
import { proxyService } from "../services";
import { SystemUserModel } from "../shared/models";

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

export class DBAdminService {

	/***
	 * Proxy Service
	 */
	private proxyService:any;

	/***
	 * Instance of MongoDB CLient
	 */
	private client:any;
	private isClientTested:boolean=false;

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
	private systemUserID:string;

	/***
	 * required roles
	 */ 
	private requiredRoles:string[] = [
		'manageOpRole',
		'mongostatRole',
		'dropSystemViewsAnyDatabase'
	];

	/***
	 * required databases
	 */
	private requiredDatabases:string[] = [
		DB_USERS_DATABASE_NAME
	];

	/***
	 * required accounts
	 */
	private dbList:any;
	private dbRoles:any;
	private hasSystemAccount:boolean;
	private hasUsersAdmin:boolean;
	private hasProductsAdmin:boolean;
	private hasUsersReadOnlyUser:boolean;
	private hasProductsReadOnlyUser:boolean;

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
			if(state) this.adminDB = this.configureMongoDBClient();
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
		this.proxyService.dbUser$.subscribe( (userID:string) => {
			this.systemUserID = userID;
			this.addUser(this.systemUserID);
		});

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
			return Promise.resolve(list);
		})
		.catch( (err:any) => Promise.reject(err) );
	}

	/****
	 *
	 */
	private listDatabaseUser(user:string, database:string) {		
		return this.client.db(database).admin().command({
			usersInfo: { user: user, db: "admin"}
		})
		.then( (res:any) => {				
			if(res.users.length === 0) {
				return Promise.resolve(false);
			} else {
				return Promise.resolve(true);
			}	
		})
		.catch( (err:any) => Promise.reject(err) );
	}

	/***
	 *
	 */
	private dropUser(_userName:string) {		
		let userName:string = String(`${_userName}`);		
		return this.client.db("admin").admin().command({
			dropUser:userName.toString(),
			writeConcern: {
				w: "majority", 
				wtimeout: 5000
			}
		})
		.then( (res:any) => Promise.resolve() )
		.catch( (err:any) => Promise.reject(err) );
	}

	/****
	 *
	 */
	private createSystemAdminAccount({user, password}:any) {	

		return this.adminDB.command({ 
			createUser: user,
			pwd: password,
			roles: [ 
				{ role: "userAdminAnyDatabase", db: "admin" } 
			] 
		})
		.then( (res:any) => Promise.resolve() )
		.catch( (err:any) => Promise.reject(err) );
	}

	/****
	 *
	 */
	private createSystemDBAccount({user, password, db}:any) {

		return this.adminDB.command({
			createUser: user,
			pwd: password,
			roles: [ 
				{ role: "userAdmin", db: db }, 
				{ role: "readWrite", db: db }
			]
		})
		.then( (res:any) => Promise.resolve() )
		.catch( (err:any) => Promise.reject(err) );

	}

	/****
	 *
	 */
	private createSystemReadOnlyAccount({user, password, db}:any) {		
		return this.adminDB.command({
			createUser: user,
			pwd: password,
			roles: [ { role: "read", db: db }]
		})
		.then( (res:any) => Promise.resolve() )
		.catch( (err:any) => Promise.reject(err) );
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

	private evalUserDatabases() {		
		const userDBEntry:any = this.dbList.databases.find( ( entry:any) => entry.name === DB_USERS_DATABASE_NAME );
		if(!userDBEntry) {
			console.error("Critical Error: Database ",DB_USERS_DATABASE_NAME, " does not exist!")
			process.exit(1);
		} else {
			return Promise.resolve();
		}
	}

	private closeConnection():void {
		this.client.close();
	}	

	/***
	 * Return a list of required roles
	 */
	private evalRoles():string[] {	
		return this.requiredRoles.map( ( requiredRole:string) => {			
			if(!this.dbRoles.roles.find( (role:string) => role === requiredRole ) ) {			
				return requiredRole;
			}
		});
	}

	private defaultErrorMessage(err:any):void {
		console.error("Local Database : Could not configure MongoClient. Please check your configuration.");
		console.error(err);
		process.exit(1);
	}		

	/****
	 *
	 */
	public configureMongoDBClient() {				

		// process thick: connect
		return this.connect()		
		
		// process thick: set Admin DB
		.then( () => this.selectAdminDB() )

		.then( () => {

			return Promise.join<any>(

				//List Databases/
				this.listDatabases(),

				//  Current DB Roles
				this.getCurrentDBRoles(),

				// Test for required db users
				this.listDatabaseUser(SYSTEM_ADMIN_USER, "admin"),
				this.listDatabaseUser(SYSTEM_DB_USERS_ADMIN_USER, "admin"),
				this.listDatabaseUser(SYSTEM_DB_PRODUCTS_ADMIN_USER, "admin"),
				this.listDatabaseUser(SYSTEM_DB_USERS_READONLY_USER, "admin"),
				this.listDatabaseUser(SYSTEM_DB_PRODUCTS_READONLY_USER, "admin")				
			)
			.spread ( (
				dbList:any, 
				dbRoles:any, 			
				hasSystemAccount:boolean,
				hasUsersAdmin:boolean,
				hasProductsAdmin:boolean,
				hasUsersReadOnlyUser:boolean,
				hasProductsReadOnlyUser:boolean		
			) => {
				
				this.dbList = dbList;
				this.dbRoles = dbRoles;				

				let sAccounts=[];
				if(!hasSystemAccount) sAccounts.push({ 
					type: 1, 
					user:SYSTEM_ADMIN_USER, 
					password: SYSTEM_ADMIN_PASSWORD, 
					db: "admin"}
				);

				if(!hasUsersAdmin) sAccounts.push({
					type: 2, 
					user:SYSTEM_DB_USERS_ADMIN_USER,
					password: SYSTEM_DB_USERS_ADMIN_PASSWORD,
					db: DB_USERS_DATABASE_NAME
				}); 	

				if(!hasUsersReadOnlyUser) sAccounts.push({
					type: 3, 
					user: SYSTEM_DB_USERS_READONLY_USER,
					password: SYSTEM_DB_USERS_READONLY_PASSWORD,
					db: DB_USERS_DATABASE_NAME,
				});	

				if(!hasProductsAdmin) sAccounts.push({ 
					type: 2, 
					user:SYSTEM_DB_PRODUCTS_ADMIN_USER,
					password: SYSTEM_DB_PRODUCTS_ADMIN_PASSWORD,
					db: DB_PRODUCT_DATABASE_NAME
				});	

				if(!hasProductsReadOnlyUser) sAccounts.push({
					type: 3, 
					user:SYSTEM_DB_PRODUCTS_READONLY_USER,
					password: SYSTEM_DB_PRODUCTS_READONLY_PASSWORD,
					db: DB_PRODUCT_DATABASE_NAME
				});				

				return Promise.map( sAccounts, (account:any) => {					

					if(account.type === 1) {
						return this.createSystemAdminAccount(account);	
					}					

					else if(account.type === 2) {
						return this.createSystemDBAccount(account);							
					}

					else if(account.type === 3) {
						return this.createSystemReadOnlyAccount(account);
					}
				})
				.then( () => Promise.resolve() )
				.catch( (err:any) => Promise.reject(err) );

			});
		})

		// process thick: eval databases
		.then( () => this.evalUserDatabases() )	

		// process thick: eval roles
		.then( () => this.evalRoles() )

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
	

}


