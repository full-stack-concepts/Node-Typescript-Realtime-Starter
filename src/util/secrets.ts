import dotenv from "dotenv";
import fs from "fs";

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

if(USE_MLAB_DB_HOST) {
	if(!MLAB_API_KEY || (MLAB_API_KEY && typeof MLAB_API_KEY != 'string')) {
		console.error("DB Configuration: API Key MLAB is missing! Pleasse add one");
		process.exit(1);
	}

	if(!MLAB_DATABASE || (MLAB_DATABASE && typeof MLAB_DATABASE != 'string')) {
		console.error("DB Configuration: Name remote database is missing. Please add one");
		process.exit(1);
	}
}

/***
 * Google Auth
 */
export const ENABLE_GOOGLE_AUTHENTICATION:boolean = Boolean(process.env["ENABLE_GOOGLE_AUTHENTICATION"]);
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

