import dotenv from "dotenv";
import fs from "fs";
import {isEmail} from "../util";

if (fs.existsSync(".env")) {   
    dotenv.config({ path: ".env" });
}

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

/***
 * Express server instance runs either in http or https
 */
export const EXPRESS_SERVER_MODE = process.env["EXPRESS_SERVER_MODE"];

/**
 * Express Server Port Number
 */
export const PORT = process.env["PORT"];

/**
 * PORT WEB CLIENT
 */
export const CLIENT_PORT = process.env["CLIENT_PORT"];

/**
 *PORT ADMIN CLIENT
 */
export const ADMIN_PORT = process.env["ADMIN_PORT"];

/***
 * paths To SSL Certificates
 */
export const PATH_TO_DEV_PRIVATE_KEY:string = process.env["PATH_TO_DEV_PRIVATE_KEY"];
export const PATH_TO_DEV_CERTIFICATE:string = process.env["PATH_TO_DEV_CERTIFICATE"];
export const PATH_TO_PROD_PRIVATE_KEY:string = process.env["PATH_TO_PROD_PRIVATE_KEY"];
export const PATH_TO_PROD_CERTIFICATE:string = process.env["PATH_TO_PROD_CERTIFICATE"];

/***
 * LOCAL MONGODB SERVER
 */
export const USE_LOCAL_MONGODB_SERVER = Boolean(process.env["USE_LOCAL_MONGODB_SERVER"]);
export const DB_CONFIG_HOST = process.env["DB_CONFIG_HOST"];
export const DB_CONFIG_PORT = process.env["DB_CONFIG_PORT"];
export const DB_CONFIG_USER = process.env["DB_CONFIG_USER"];
export const DB_CONFIG_PASSWORD = process.env["DB_CONFIG_PASSWORD"];
export const DB_CONFIG_DATABASE = process.env["DB_CONFIG_DATABASE"];
export const DB_MAX_POOL_SIZE = process.env["DB_MAX_POOL_SIZE"];

if(USE_LOCAL_MONGODB_SERVER) {	

	if(!DB_CONFIG_HOST || (DB_CONFIG_HOST && typeof DB_CONFIG_HOST!='string')) {
		console.error("Local Database: Please specify DB <host> name in your environemntal file (.env or .prod)! ");
		process.exit(1);
	}

	const port:number = parseInt(DB_CONFIG_PORT);
	if(!Number.isInteger(port) || Number.isInteger(port) && port<=0) {
		console.error("Local Database: Please specify DB <port> in your environemntal file (.env or .prod)! ");
		process.exit(1);
	}

	if(!DB_CONFIG_USER || (DB_CONFIG_USER && typeof DB_CONFIG_USER!='string')) {
		console.error("Local Database: Please specify DB <user> in your environemntal file (.env or .prod)! ");
		process.exit(1);
	}

	if(!DB_CONFIG_PASSWORD || (DB_CONFIG_PASSWORD && typeof DB_CONFIG_PASSWORD!='string')) {
		console.error("Local Database: Please specify DB <password> in your environemntal file (.env or .prod)! ");
		process.exit(1);
	}

	if(!DB_CONFIG_PASSWORD || (DB_CONFIG_DATABASE && typeof DB_CONFIG_DATABASE!='string')) {
		console.error("Local Database: Please specify DB <name> in your environemntal file (.env or .prod)! ");
		process.exit(1);
	}

	const poolSize:number = parseInt(DB_MAX_POOL_SIZE);
	if(!Number.isInteger(poolSize) || Number.isInteger(poolSize) && poolSize<=0) {
		console.error("Local Database: Please specify <PoolSize> in your environemntal file (.env or .prod)! ");
		process.exit(1);
	}
}

/***
 * MLAB Configuration
 */
export const USE_MLAB_DB_HOST:boolean = Boolean(process.env["USE_MLAB_DB_HOST"]);
export const MLAB_API_KEY:string = process.env["MLAB_API_KEY"];
export const MLAB_DATABASE:string = process.env["MLAB_DATABASE"];
export const MLAB_API_URL:string = process.env["MLAB_API_URL"];

if(USE_MLAB_DB_HOST) {

	const mGroups:any[] = [
			{ value: MLAB_API_KEY , txt: 'API Key MLAB' },
			{ value: MLAB_DATABASE, txt: 'Name remote database on MLAB' },
			{ value: MLAB_API_URL, txt:  'Remote API URL for mlab.com' }	
	];

	mGroups.forEach( ({ value, txt }) => {		
		if(!value || (value && typeof value != 'string')) {
			console.error(`DB Configuration: ${txt} is missing! Pleasse add one`);
			process.exit(1);	
		}
	});
}


/***
 * DB Population
 */
export const DB_POPULATE = process.env["DB_POPULATE"];
export const DB_POPULATE_SAFETY_FIRST = Boolean(process.env["DB_POPULATE_SAFETY_FIRST"]);
export const DB_POPULATE_TEST_COLLECTIONS = process.env["DB_POPULATE_TEST_COLLECTIONS"].split(',');
export const DB_POPULATE_ADMINS =  Number(process.env["DB_POPULATE_ADMINS"]);
export const DB_POPULATE_POWER_USERS =  Number(process.env["DB_POPULATE_POWER_USERS"]);
export const DB_POPULATE_AUTHORS = Number(process.env["DB_POPULATE_AUTHORS"]);
export const DB_POPULATE_USERS =  Number(process.env["DB_POPULATE_USERS"]);
export const DB_POPULATION_LOCALE = process.env["DB_POPULATION_LOCALE"];

export const DB_CREATE_USERS = process.env["DB_CREATE_USERS"];
export const DB_USERS_COLLECTION_NAME = process.env["DB_USERS_COLLECTION_NAME"];
export const DB_CREATE_CLIENTS = process.env["DB_CREATE_CLIENTS"];
export const DB_CLIENTS_COLLECTION_NAME = process.env["DB_CLIENTS_COLLECTION_NAME"];
export const DB_CREATE_CUSTOMERS = process.env["DB_CREATE_CUSTOMERS"];
export const DB_CUSTOMERS_COLLECTION_NAME = process.env["DB_CUSTOMERS_COLLECTION_NAME"];
export const DB_POPULATE_DEFAULT_CLIENTS= Number(process.env["DB_POPULATE_DEFAULT_CLIENTS"]);
export const DB_POPULATE_DEFAULT_CUSTOMERS= Number(process.env["DB_POPULATE_DEFAULT_CUSTOMERS"]);

const isString = (str:string):boolean => {
	return (!str || str && typeof str === 'string');
} 

if(DB_POPULATE) {

	if(typeof DB_POPULATE_SAFETY_FIRST != 'boolean') {
		console.error("DB Data Genersator: Please configure boolean DB_POPULATE_SAFETY_FIRST. overwrite existing DB data?");
		process.exit(1);
	}

	if(!DB_POPULATE_TEST_COLLECTIONS || !Array.isArray(DB_POPULATE_TEST_COLLECTIONS) ) {
		console.error("DB Data Genersator: Please configure DB_POPULATE_TEST_COLLECTIONS array: specify to test for which DB collections");
		process.exit(1);
	}

	if(!isString(DB_USERS_COLLECTION_NAME) || !isString(DB_CLIENTS_COLLECTION_NAME) || !isString(DB_CUSTOMERS_COLLECTION_NAME)) {
		console.log("DB Data Genersator: please provide collection names for each data Type (users, and/or clients and/or customers)")
		process.exit(1)
	}

	const userGroups:any[] = [
		{ value: DB_POPULATE_ADMINS, name: 'admins' },
		{ value: DB_POPULATE_POWER_USERS, name: 'power users' },
		{ value: DB_POPULATE_AUTHORS, name: 'authors' },
		{ value: DB_POPULATE_USERS, name: 'users' },		
		{ value: DB_POPULATE_DEFAULT_CLIENTS, name: 'default clients' },
		{ value: DB_POPULATE_DEFAULT_CUSTOMERS, name: 'default customers' }
	];

	userGroups.forEach( ({ value, name}) => {		
		if(!Number.isInteger(value) || Number.isInteger(value) && value<=0) {
			console.error(`Database Population: Please specify amount of ${name} to be created!`);
			process.exit(1);	
		}
	});
}

/***
 * Test for faker langiage locale, defaults to en_US
 */
let locale:string = process.env["DB_POPULATION_LOCALE"];
console.log( "****** locale ", locale)
if( !locale || (locale && typeof locale != 'string') ) {
	locale = 'en_US';
}


/***
 * SuperAdmin Credentials
 */
export const SUPERADMIN_FIRST_NAME:string = process.env["SUPERADMIN_FIRST_NAME"];
export const SUPERADMIN_LAST_NAME:string = process.env["SUPERADMIN_LAST_NAME"];
export const SUPERADMIN_EMAIL:string = process.env["SUPERADMIN_EMAIL"];
export const SUPERADMIN_PASSWORD:string = process.env["SUPERADMIN_PASSWORD"];

const SA:any[] = [
	{ value: SUPERADMIN_FIRST_NAME, name: 'first name' },
	{ value: SUPERADMIN_LAST_NAME, name: 'last name' },
	{ value: SUPERADMIN_EMAIL, name: 'email' },
	{ value: SUPERADMIN_PASSWORD, name: 'password' }		
];

SA.forEach(({value, name}) => {
	if(!value || value && typeof value != 'string') {
		console.error(`Super Admin: Please specify value for super admin ${name} field!!`);
		process.exit(1);
	}
});

if(!isEmail(SUPERADMIN_EMAIL)) {
	console.error(`Super Admin: Please specify value for Super Admin Email field!!`);
	process.exit(1);
}

/***
 * Google Auth
 */
export const ENABLE_GOOGLE_AUTHENTICATION = process.env["ENABLE_GOOGLE_AUTHENTICATION"];
export const GOOGLE_AUTH_ID = process.env["GOOGLE_AUTH_ID"];
export const GOOGLE_AUTH_SECRET = process.env["GOOGLE_AUTH_SECRET"];
export const GOOGLE_CALLBACK_URL = process.env["GOOGLE_CALLBACK_URL"];

if(ENABLE_GOOGLE_AUTHENTICATION) {	

	if(GOOGLE_AUTH_ID && typeof(GOOGLE_AUTH_ID)!='string') {
		console.error("User Authentication: Google Auth has been enabled but no Auth ID was provided");
		process.exit(1);
	}

	if(GOOGLE_AUTH_SECRET && typeof(GOOGLE_AUTH_SECRET)!='string') {
		console.error("User Authentication: Google Auth has been enabled but no Secret was provided");
		process.exit(1);
	}

	if(GOOGLE_CALLBACK_URL && typeof(GOOGLE_CALLBACK_URL)!='string') {
		console.error("User Authentication: Google Auth has been enabled but no callback url was provided");
		process.exit(1);
	}
}
  
/***
 * Definitions for User Authentication Response
 */
export const STORE_WEBTOKEN_AS_COOKIE = process.env["STORE_WEBTOKEN_AS_COOKIE"];
export const WEBTOKEN_COOKIE = process.env["WEBTOKEN_COOKIE"];
export const SEND_TOKEN_RESPONSE = process.env["SEND_TOKEN_RESPONSE"];


if(STORE_WEBTOKEN_AS_COOKIE) {

	if(!WEBTOKEN_COOKIE || (WEBTOKEN_COOKIE && typeof(WEBTOKEN_COOKIE)!='string')) {
		console.error("User authentication: please define a COOKIE SECRET for your webtoken cookie in your .env file");
		process.exit(1);
	}
}

/***
 * Checks before bootstrapping application
 */
if(!EXPRESS_SERVER_MODE) {
	console.error("Express Server mode is either http or https. Please pick your mode!");
    process.exit(1);
}

if(EXPRESS_SERVER_MODE==='https') {

	/***
	 * Test for SSL certificates in development mode
	 */
	if(ENVIRONMENT==='dev') {

		if(!PATH_TO_DEV_PRIVATE_KEY || !PATH_TO_DEV_CERTIFICATE ) {
			console.error("SSL configuration: Either Private key or certificate file is missing");
			process.exit(1);
		}

		if(PATH_TO_DEV_PRIVATE_KEY && typeof(PATH_TO_DEV_PRIVATE_KEY)!='string') {
			console.error("SSL configuration: Private key has invalid format");
			process.exit(1);
		}

		if(PATH_TO_DEV_CERTIFICATE && typeof(PATH_TO_DEV_CERTIFICATE)!='string') {
			console.error("SSL configuration: Private key has invalid format");
			process.exit(1);
		}

	} else {

		if(!PATH_TO_PROD_PRIVATE_KEY || !PATH_TO_PROD_CERTIFICATE ) {
			console.error("SSL configuration: Either Private key or certificate file is missing");
			process.exit(1);
		}

		if(PATH_TO_PROD_PRIVATE_KEY && typeof(PATH_TO_PROD_PRIVATE_KEY)!='string') {
			console.error("SSL configuration: Private key has invalid format");
			process.exit(1);
		}

		if(PATH_TO_PROD_CERTIFICATE && typeof(PATH_TO_PROD_CERTIFICATE)!='string') {
			console.error("SSL configuration: Private key has invalid format");
			process.exit(1);
		}
	}
}

