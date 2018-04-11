import mongoose from "mongoose";
import Promise from "bluebird";
mongoose.Promise = global.Promise;

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

const constructConnectionString = ():string => {
	return `mongodb://${c.user}:${c.password}@${c.host}:${c.port}/${c.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	
}

/******************
 * Before connecting create a DB Admin with your mongo interface
 * db.createUser({user: DB_CONFIG_USER, pwd: DB_CONFIG_PASSWORD, roles: [{role: "dbOwner", db: DB_CONFIG_DATABASE}]});
 *
 */
class Database {

	public live:boolean=false;

 	get isLive():boolean { 
 		return this.live; 
 	}

	defaultErrorMessage():void {
		console.error("Local Database : Could not connect to local instance of MONGODB or authentication failed.");
	}

	init() {
		
		/****
		 * Return if local MongoDB instance is 
		 * not configured in environmental file (.env or .prod)
		 */
		if(!USE_LOCAL_MONGODB_SERVER) return;
		
		// connection string
		let connStr:string =constructConnectionString();			

		// connect to AP Database
		mongoose.connect( connStr, err => {		

			console.log(" ==> Local DB User Authenticated")	

			// $TODO: add morgan logging 
			if(err) {

				this.defaultErrorMessage();

			} else {

				const db:any = mongoose.connection;			

				// listen for connection errors
				db.on('error', err =>  console.error( "Local Database ", err) );
				
				// return db connection
				db.on('open', () => { 
					console.log("Local DB is now Live! "); 
					return db;	
				});
			}
		});
	}
}

export const db = new Database();


