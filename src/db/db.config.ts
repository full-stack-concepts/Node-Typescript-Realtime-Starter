import mongoose from "mongoose";
import Promise from "bluebird";
mongoose.Promise = global.Promise;

import {
	USE_LOCAL_MONGODB_SERVER,
	DB_CONFIG_HOST,
	DB_CONFIG_PORT,
	DB_CONFIG_USER,
	DB_CONFIG_PASSWORD,
	DB_CONFIG_DATABASE
} from "../util/secrets";

const constructConnectionString = ():string => {
	return `mongodb://${DB_CONFIG_USER}:${DB_CONFIG_PASSWORD}@${DB_CONFIG_HOST}:${DB_CONFIG_PORT}/${DB_CONFIG_DATABASE}?maxPoolSize=100`;	
}

/******************
 * Before connecting create a DB Admin with your mongo interface
 * db.createUser({user: DB_CONFIG_USER, pwd: DB_CONFIG_PASSWORD, roles: [{role: "dbOwner", db: DB_CONFIG_DATABASE}]});
 *
 */
class Database {

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
				db.on('open', () => { console.log("Local DB is now Live! "); return db;	});
			}
		});
	}
}

export const db = new Database();


