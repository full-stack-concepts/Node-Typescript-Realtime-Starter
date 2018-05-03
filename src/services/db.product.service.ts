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

export class DBProductService {

	/***
	 * Proxy Service
	 */
	private proxyService:any;	
	/***
	 * Instance of Mongoose CLient
	 */
	private db:any;

	/***
	 * Product Database
	 */
	private productDB:any

	/***
	 * System UserID 
	 */
	private systemUserID:mongoose.Types.ObjectId;	

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
	 * Set up connectoin with MoongoDB Admin DB
	 */
	private connect() {		
		return Promise.resolve();
	}

	private constructProductConnectionString():string {	
		return "";
	}		

	private defaultErrorMessage(err:any):void {
		console.error("Local Database : Could not connect to Product Databse. Please check your configuration.");
		console.error(err);
		process.exit(1);
	}			
}


