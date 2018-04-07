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

console.log("==> Test for Array ",  DB_POPULATE_TEST_COLLECTIONS )

if(DB_POPULATE) {

	if(typeof DB_POPULATE_SAFETY_FIRST != 'boolean') {
		console.error("Database Population: Please configure boolean DB_POPULATE_SAFETY_FIRST. overwrite existing DB data?");
		process.exit(1);
	}

	if(!DB_POPULATE_TEST_COLLECTIONS || !Array.isArray(DB_POPULATE_TEST_COLLECTIONS) ) {
		console.error("Database Population: Please configure DB_POPULATE_TEST_COLLECTIONS array: specify to test for which DB collections");
		process.exit(1);
	}

	const userGroups:any[] = [
		{ value: DB_POPULATE_ADMINS, name: 'admins' },
		{ value: DB_POPULATE_POWER_USERS, name: 'power users' },
		{ value: DB_POPULATE_AUTHORS, name: 'authors' },
		{ value: DB_POPULATE_USERS, name: 'users' }		
	];

	userGroups.forEach( ({ value, name}) => {		
		if(!Number.isInteger(value) || Number.isInteger(value) && value<=0) {
			console.error(`Database Population: Please specify amount of ${name} to be created!`);
			process.exit(1);	
		}
	});
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

