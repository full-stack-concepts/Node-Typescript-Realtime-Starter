import mongoose from "mongoose";
import Promise from "bluebird";
mongoose.Promise = global.Promise;

import { 
	Observable, 
	BehaviorSubject
} from "rxjs";

import {
	USE_LOCAL_MONGODB_SERVER,
	DB_CONFIG_HOST,
	DB_CONFIG_PORT,
	DB_CONFIG_USER,
	DB_CONFIG_PASSWORD,
	DB_CONFIG_DATABASE,
	DB_MAX_POOL_SIZE
} from "../util/secrets";

import { 
	IConnection 
} from "../shared/interfaces";

import {
	proxyService
} from "../services";

/****
 * Connection Settings Object
 */
const c:IConnection = {
	host: DB_CONFIG_HOST, 
	user: DB_CONFIG_USER,
	password: DB_CONFIG_PASSWORD,
	port: DB_CONFIG_PORT,
	db: DB_CONFIG_DATABASE
}



/******************
 * Before connecting create a DB Admin with your mongo interface
 * db.createUser({user: DB_CONFIG_USER, pwd: DB_CONFIG_PASSWORD, roles: [{role: "dbOwner", db: DB_CONFIG_DATABASE}]});
 *
 */
export class DatabaseService {

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
		 * Configure Subscribers
		 */
		this.configureSubscribers();
	}

	private constructConnectionString():string {
		return `mongodb://${c.user}:${c.password}@${c.host}:${c.port}/${c.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	
	}

	private defaultErrorMessage():void {
		console.error("Local Database : Could not connect to local instance of MONGODB or authentication failed.");
	}

	private connect() {

		// mongoose connection string
		const connStr:string = this.constructConnectionString();	

		return mongoose.connect( connStr, (err:any) => {

			if(err) {
				console.log(err)
				this.defaultErrorMessage();			
			} else {

				console.log("**** LOCAL DB LIVE")

				/****
				 * Propagate NativeConnnection
				 */
				const db:any = mongoose.connection;	
				proxyService.setLocalDBInstance(db);			

				// listen for connection errors
				db.on('error', (err:any) =>  console.error( "Local Database ", err) );
				
				// on open event
				db.on('open', () => {});

				Promise.resolve();
			}


		});

	}

	private configureSubscribers():void {

		this.proxyService.db$.subscribe( (state:boolean) => this._live = state );		

	}

}