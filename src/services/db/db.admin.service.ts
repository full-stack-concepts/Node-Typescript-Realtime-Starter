import Promise from "bluebird";
const MongoDB = require("mongodb");

import {

	/***
	 * SuperAdmin Credentials
	 */
	SYSTEM_ADMIN_USER,
	SYSTEM_ADMIN_PASSWORD,

	DB_SYSTEM_USERS,	
	REQUIRED_USERS_PER_DATABASE,

	/***
	 * MongoDB settings: db names
	 */
	DB_USERS_DATABASE_NAME,
	DB_PRODUCT_DATABASE_NAME,	

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

} from "../../util/secrets";

import { ISystemUser, IConnection } from "../../shared/interfaces";
import { proxyService } from "../../services";
import { SystemUserModel } from "../../shared/models";

/****
 * Default Connection Settings Object
 */
const a:IConnection = {
	host: DB_CONFIG_HOST, 
	user: DB_CONFIG_USER,
	password: DB_CONFIG_PASSWORD,
	port: DB_CONFIG_PORT,
	db: "admin"
}

const MongoClient = MongoDB.MongoClient;
Promise.promisifyAll(MongoDB);
Promise.promisifyAll(MongoClient);


interface IDB_GET_ROLE_OPTION {
	rolesInfo: number,
	showPriviliges: boolean,
	showBuiltinRoles: boolean;
}

interface IndexSignature {
  [key: string]: any;
}

export class DBAdminService implements IndexSignature {

	 [key: string]: any;

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
	 * Required databases
	 */
	private requiredDatabases:string[] = [
		DB_USERS_DATABASE_NAME,
		DB_PRODUCT_DATABASE_NAME
	];	

	/***
	 * required accounts
	 */
	private dbList:any;
	private dbRoles:any;	

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
		this.proxyService.userDBLive$.subscribe( (state:boolean) => {
			if(proxyService.userDB) this.db = proxyService.userDB;		
		});	
	}

	/****
	 * Set up connectoin with MoongoDB Admin DB
	 */
	private connect() {

		console.log("*** (2) Connect  with MongoDB Client ")

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
		 .catch( (err:Error) => this.defaultErrorMessage(err) );		

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

		return this.client.db('admin').admin().listDatabases()
		.then( (list:any) => Promise.resolve(list) )
		.catch( (err:Error) => Promise.reject(err) );		
	}

	/****
	 * Evaluate existance of Pre-defined Databases
	 */
	private evalDatabases(dbList:any) {

		const missingDatabases:string[] =  this.requiredDatabases.map( ( dbName:string) => {			
			if(!dbList.databases.find( (entry:any) => entry.name === dbName ) ) { return dbName; } 
		});		

		let err:boolean =  missingDatabases.every( (v:string) => v != null );		
		
		if(err) {
			console.error("CRITICAL ERROR: ensure that you have created all databases before running this application: USERS and PRODUCTS.");
			process.exit(1);
		} else {
			Promise.resolve();
		}
	}

	/****
	 * Drop Pre-defined database users
	 */
	private dropAllUsers() {
		return Promise.map( this.requiredDatabases, (dbName:string) => {			
			return this.client.db(dbName).command({
				dropAllUsersFromDatabase: 1,
				writeConcern: {
					w: "majority", 
					wtimeout: 5000
				}
			});			
		})		
		.then( (result:any) => 	Promise.resolve() )	
		.catch( (err:Error) => Promise.reject(err) );
	}

	/****
	 * Builds list of required System DB users that dont exist
	 */
	private analysePreDefinedDatabaseUsers() {

		let usersToInsert:string[]=[];

		/***
		 * Get Users Lost for each Database
		 */
		return Promise.map( REQUIRED_USERS_PER_DATABASE, ( {accounts, dbName}) => {
			return this.client.db(dbName).command({usersInfo:1})	
			.then( (users:any) => Promise.resolve({[dbName]: users}) )
		})

		/***
		 * Test Per Dabase if required account exists
		 */
		.then( ( allUsers:any) => {	

			console.log("==> Current Defined Users ")
			console.log(allUsers[2].products)

			let i:number=0;
			return Promise.map( REQUIRED_USERS_PER_DATABASE,  ({ accounts, dbName}:any) => {

				// db reqquired users
				let requiredUsers:any=[];		

				// find current users list for this db
				const currentDBUsers:any = allUsers.filter ( 
					(dbUsers:any) => dbUsers.dbName = dbName 
				)[i][dbName].users;

				// increase counter
				i++;

				// find missing users
				const test = [];
				accounts.map( ({user, password, type, db}:any) => {
					let hasAccount;				
					if(!currentDBUsers.length) {
						hasAccount=false;
					} else {
					  	hasAccount= currentDBUsers.filter( (userObj:any) => (userObj.user === user ) );
					  	if(hasAccount.length===0) hasAccount=false;
					}				

					if(!hasAccount) requiredUsers.push( {user:user, password: password, type: type, db:dbName});
				});							

				return Promise.resolve({ [dbName]: requiredUsers })
			})
			.then( (requiredUsers) => Promise.resolve(requiredUsers) )
			.catch( (err:Error) => Promise.reject(err) )
		})

		.then( (requiredUsers) => Promise.resolve(requiredUsers) )	
	}

	/***
	 * Get Database User
	 */
	private getUser(user:string, database:string) {		

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
		.catch( (err:Error) => Promise.reject(err) );
	}

	/***
	 * Drop any user
	 */
	private dropUser(_userName:string, _dbName:string) {		
		let userName:string = String(`${_userName}`);		
		return this.client.db(_dbName).admin().command({
			dropUser:userName.toString(),
			writeConcern: {
				w: "majority", 
				wtimeout: 5000
			}
		})
		.then( (res:any) => Promise.resolve() )
		.catch( (err:Error) => Promise.reject(err) );
	}

	/****
	 * MOngoDB System Account
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
		.catch( (err:Error) => Promise.reject(err) );
	}

	/****
	 * DB ReadWrite Account: usd for Mongoose Model
	 */
	private createDatabaseAdmin({user, password, db}:any) {

		console.log( "(3) ** Create DB Admin ")
		console.log(user, password, db)
	
		const _db:any = this.client.db(db);
		return _db.command({
			createUser: user,
			pwd: password,
			roles: [{role: "readWrite", db: db}]
		})
		.then( (res:any) => Promise.resolve() )
		.catch( (err:Error) => Promise.reject(err) );
	}

	/****
	 * DB ReadOnly Account: used for Mongoose Model
	 */
	private createSystemReadOnlyAccount({user, password, db}:any) {	

		const _db:any = this.client.db(db);
		return _db.command({		
			createUser: user,
			pwd: password,
			roles: [ { role: "read", db: db }]
		})
		.then( (res:any) => Promise.resolve() )
		.catch( (err:Error) => Promise.reject(err) );
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
		.catch( (err:Error) => Promise.reject(err) );
	}

	/***
	 * Evaluate required roles: if role does not exist create it
	 */
	private evalRoles() {	
	
		const roles:any =  this.requiredRoles.map( ( requiredRole:string) => {			
			if(!this.dbRoles.roles.find( (entry:any) => entry.role === requiredRole ) ) {			
				return requiredRole;
			} else {
				return;
			}
		});	

		return Promise.map( roles, (role:any) => {
			if(!role) return;
			if(role) return this[role](); 			
		})
		.then( (roles:any) => Promise.resolve(roles) )
		.catch( (err:Error) => Promise.reject(err) );
	}	

	/****
	 * Cluster Administratoin Role
	 */
	private manageOpRole() {
		return this.adminDB.command({
			createRole: "manageOpRole",
			privileges: [
       			{ resource: { cluster: true }, actions: [ "killop", "inprog" ] },
       			{ resource: { db: "", collection: "" }, actions: [ "killCursors" ] }
     		],
     		roles: []
		})
		.then( (roles:any) => Promise.resolve(roles) )
		.catch( (err:Error) => Promise.reject(err) );
	}

	/****
	 * Mongo  Statistics Role
	 */
	private mongostatRole() {
		return this.adminDB.command({
			createRole: "mongostatRole",
			privileges: [ { resource: { cluster: true }, actions: [ "serverStatus" ] } ],
     		roles: []
		})
		.then( (roles:any) => Promise.resolve(roles) )
		.catch( (err:Error) => Promise.reject(err) );
	}

	private dropSystemViewsAnyDatabase() {
		return this.adminDB.command({
			createRole: "dropSystemViewsAnyDatabase",
			privileges: [{
				actions: [ "dropCollection" ],
         		resource: { db: "", collection: "system.views" } 
         	}],
     		roles: []
		})
		.then( (roles:any) => Promise.resolve(roles) )
		.catch( (err:Error) => Promise.reject(err) );
	}	

	private closeConnection():void {
		this.client.close();
	}		

	private defaultErrorMessage(err:Error):void {
		console.error("Local Database : Could not configure MongoClient. Please check your configuration.");
		console.error(err);
		process.exit(1);
	}		

	/****
	 * Configure Databases with MongoDB Client
	 */
	public configureMongoDBClient() {	

		console.log("(1) Start MongoDB Client")	

		// process thick: connect
		return this.connect()	

		// process thick: List Databases
		.then( () => this.listDatabases() )

		// process thick: exit if a production db does not exist
		.then( (dbList:any) => this.evalDatabases(dbList))

		// process thick: drop users from production databases to prevent doublures
		.then( () => this.dropAllUsers() )
		
		// process thick: set Admin DB
		.then( () => this.selectAdminDB() )

		.then( () => {

			return Promise.join<any>(

				//  Current DB Roles
				this.getCurrentDBRoles(),

				// Test for required db users
				this.analysePreDefinedDatabaseUsers()			
			)
			.spread ( (
				// dbList:any, 
				dbRoles:any, 			
				dbUsersList:any				
			) => {
				
				// this.dbList = dbList;
				this.dbRoles = dbRoles;															

				// push all required users omtp single array
				const requiredUsers:any=[];
				let counter:number=0;
				dbUsersList.forEach( (obj:any) => {
					const firstKey:string = Object.keys(obj)[0];				
					const list:any = dbUsersList[counter][firstKey];				
					list.forEach( (entry:any) => requiredUsers.push(entry));					
					counter++;
				});

				console.log(" (2) DB REDQUIRED USERS ")
				console.log(requiredUsers)			
				
				return Promise.map( requiredUsers, (account:any) => {
					let ac:number=account.type;									
					if(ac === 1) return this.createSystemAdminAccount(account);	
					if(ac === 2) return this.createDatabaseAdmin(account);							
					if(ac === 3) return this.createSystemReadOnlyAccount(account);
				})
				.then( () => Promise.resolve() )
				.catch( (err:Error) => Promise.reject(err) );		
			});
		})		
		
		// process thick: eval roles
		.then( () => this.evalRoles() )					

		// process thick: clsoe conenction
		.then( () => this.closeConnection() )

		// process thick: return to caller
		.then( () => Promise.resolve() )
		.catch( (err:Error) => this.defaultErrorMessage(err) );
	
	}
}

/****
 * Export for Bootstrap Controller
 */
export const configureDatabases = () => {
		const instance:any = new DBAdminService();
	return instance.configureMongoDBClient()
	.then( () => Promise.resolve() )
	.catch( (err:Error) => Promise.reject(err) );	
}
