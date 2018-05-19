import dotenv from "dotenv";
import fs from "fs";
import moment from "moment-timezone";
import randomString from "random-string";

/****
 * Import interfaces and types for database host priorities array
 */
import { TDBP_local, TDBP_mlab} from "../shared/types";
import { IDatabasePriority } from "../shared/interfaces";
import { isEmail } from "../util";

/****
 * Note: Use equality operator (==) to cast dotenv strings to boolean (your settings file)
 */
if (fs.existsSync(".env")) {   
    dotenv.config({ path: ".env" });
}

const isString = (str:string):boolean => {
	return (!str || str && typeof str === 'string');
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

/**
 * SITE NAME
 */
export const SITE_NAME = process.env["SITE_URL"];

/**
 * DEFAULT SITE URL
 */
export const SITE_URL = `${EXPRESS_SERVER_MODE}://${SITE_NAME}:${PORT}/`;

/**
 * Timezone
 */
export const TIME_ZONE = String(process.env["TIME_ZONE"]);

/**
 * Date Format
 */
export const DATE_FORMAT = String(process.env["DATE_FORMAT"]);

/**
 * Time format
 */
export const TIME_FORMAT = String(process.env["TIME_FORMAT"]);

/**
 * Security
 */
 export const RANDOMIZE_PASSWORD_ENCRYPTION = process.env["RANDOMIZE_PASSWORD_ENCRYPTION"] == 'true';
 export const CRYPTO_HASH_ALGORITHM= process.env["CRYPTO_HASH_ALGORITHM"];

 const cryptoKey:string = randomString({
 	length: 32,
  	numeric: true,
  	letters: true,
  	special: false,
  	exclude: ['a', 'b', '1']
});

export const CRYPTO_IV_ENCRYPTION_KEY = cryptoKey;
export const CRYPTO_IV_VECTOR_LENGTH= Number(process.env["CRYPTO_IV_VECTOR_LENGTH"]);


 if(!CRYPTO_HASH_ALGORITHM || (CRYPTO_HASH_ALGORITHM && !isString(CRYPTO_HASH_ALGORITHM))) {
 	console.error("APP SECURITY: No password algorithm has been defined for CRYPTO Module.");
	process.exit(1);
 }

/**
 * DB NAMES (!)
 */
export const DB_USERS_DATABASE_NAME = process.env["DB_USERS_DATABASE_NAME"] || 'users';
export const DB_PRODUCT_DATABASE_NAME = process.env["DB_PRODUCT_DATABASE_NAME"] || 'products';


if(!moment.tz.zone (TIME_ZONE) ) {
	console.error("TIME ZONE: Your timezone does not exist. Please consult moment-timezone documentation, then update your environmental files");
	process.exit(1);
}

/***
 * System Account
 */
export const SET_SYSTEM_ADMIN_ACCOUNT = process.env["SET_SYSTEM_ADMIN_ACCOUNT"] == 'true';
export const SYSTEM_ADMIN_FIRST_NAME = process.env["SYSTEM_ADMIN_FIRST_NAME"];
export const SYSTEM_ADMIN_LAST_NAME = process.env["SYSTEM_ADMIN_LAST_NAME"];
export const SYSTEM_ADMIN_EMAIL = process.env["SYSTEM_ADMIN_EMAIL"];
export const SYSTEM_ADMIN_USER = process.env["SYSTEM_ADMIN_USER"];
export const SYSTEM_ADMIN_PASSWORD = process.env["SYSTEM_ADMIN_PASSWORD"];

if(SET_SYSTEM_ADMIN_ACCOUNT) {

	const sAccount:any[] = [
			{ value: SYSTEM_ADMIN_FIRST_NAME , txt: ' System Admin Account property first name' },
			{ value: SYSTEM_ADMIN_LAST_NAME, txt: '  System Admin Account property last name' },
			{ value: SYSTEM_ADMIN_EMAIL, txt:  ' System Admin Account property email address' },
			{ value: SYSTEM_ADMIN_USER, txt:  ' System Admin Account property user' },
			{ value: SYSTEM_ADMIN_PASSWORD, txt:  ' System Admin Account property password' }		
	];

	sAccount.forEach( ({ value, txt }) => {		
		if(!value || (value && typeof value != 'string')) {
			console.error(`DB Configuration: ${txt} is missing! Pleasse add one`);
			process.exit(1);	
		}
	});
}

/***
 * LOCAL MONGODB SERVER
 */
export const USE_LOCAL_MONGODB_SERVER = process.env["USE_LOCAL_MONGODB_SERVER"] == 'true';
export const DB_CONFIG_HOST = process.env["DB_CONFIG_HOST"];
export const DB_CONFIG_PORT = process.env["DB_CONFIG_PORT"];
export const DB_CONFIG_USER = process.env["DB_CONFIG_USER"];
export const DB_CONFIG_PASSWORD = process.env["DB_CONFIG_PASSWORD"];
export const DB_CONFIG_DATABASE = process.env["DB_CONFIG_DATABASE"];
export const DB_MAX_POOL_SIZE = process.env["DB_MAX_POOL_SIZE"];
export const DB_MAX_POOL_SIZE_ADMIN_CONN=process.env["DB_MAX_POOL_SIZE_ADMIN_CONN"];

if( typeof USE_LOCAL_MONGODB_SERVER === 'boolean' ) {	
	

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
 * Ssytem DB Accounts
 */
export const SYSTEM_DB_USERS_ADMIN_USER = process.env["SYSTEM_DB_USERS_ADMIN_USER"];
export const SYSTEM_DB_USERS_ADMIN_PASSWORD = process.env["SYSTEM_DB_USERS_ADMIN_PASSWORD"] || "";
export const SYSTEM_DB_USERS_READONLY_USER = process.env["SYSTEM_DB_USERS_READONLY_USER"];
export const SYSTEM_DB_USERS_READONLY_PASSWORD = process.env["SYSTEM_DB_USERS_READONLY_PASSWORD"] || "";

export const SYSTEM_DB_PRODUCTS_ADMIN_USER = process.env["SYSTEM_DB_PRODUCTS_ADMIN_USER"];
export const SYSTEM_DB_PRODUCTS_ADMIN_PASSWORD = process.env["SYSTEM_DB_PRODUCTS_ADMIN_PASSWORD"] || "";
export const SYSTEM_DB_PRODUCTS_READONLY_USER = process.env["SYSTEM_DB_PRODUCTS_READONLY_USER"];
export const SYSTEM_DB_PRODUCTS_READONLY_PASSWORD = process.env["SYSTEM_DB_PRODUCTS_READONLY_PASSWORD"] || "";

export const DB_SYSTEM_USERS:any= [
	{
		user: SYSTEM_ADMIN_USER, 
		password: SYSTEM_ADMIN_PASSWORD,
		host: DB_CONFIG_HOST,		
		db: 'admin', 
		port: DB_CONFIG_PORT,
		type: 1 
	},
	{ 
		user: SYSTEM_DB_USERS_ADMIN_USER, 
		password: SYSTEM_DB_USERS_ADMIN_PASSWORD,
		host: DB_CONFIG_HOST,		
		db: DB_USERS_DATABASE_NAME, 
		port: DB_CONFIG_PORT,
		type: 2
	},

	{ 
		user: SYSTEM_DB_USERS_READONLY_USER, 
		password: SYSTEM_DB_USERS_READONLY_PASSWORD,
		host: DB_CONFIG_HOST,		
		db: DB_USERS_DATABASE_NAME, 
		port: DB_CONFIG_PORT,
		type: 3 
	},
	{ 
		user: SYSTEM_DB_PRODUCTS_ADMIN_USER, 
		password: SYSTEM_DB_PRODUCTS_ADMIN_PASSWORD,
		host: DB_CONFIG_HOST,		
		db :DB_PRODUCT_DATABASE_NAME, 
		port: DB_CONFIG_PORT,
		type: 2 
	},
	{ 
		user: SYSTEM_DB_PRODUCTS_READONLY_USER, 
		password: SYSTEM_DB_PRODUCTS_READONLY_PASSWORD,
		host: DB_CONFIG_HOST,		
		db: DB_USERS_DATABASE_NAME, 
		port: DB_CONFIG_PORT,
		type: 3
	}
];	

/***
 * Required DB Accounts Admin Database
 */
export const requiredAccountsAdminDatabase:any = [
	{	user: SYSTEM_ADMIN_USER, 
		password: SYSTEM_ADMIN_PASSWORD, 
		db: 'admin', 
		type: 1 
	}
];

/***
 * Required DB Accounts Users Database
 */
export const requiredAccountsUsersDatabase:any = [
	{ 	user: SYSTEM_DB_USERS_ADMIN_USER,	
		password: SYSTEM_DB_USERS_ADMIN_PASSWORD,
		db: DB_USERS_DATABASE_NAME, 
		type: 2
	},
	{	user: SYSTEM_DB_USERS_READONLY_USER, 
		password: SYSTEM_DB_USERS_READONLY_PASSWORD,
		db: DB_USERS_DATABASE_NAME, 
		type: 3 
	}
];

/***
 * Required DB Accounts Producs Database
 */
export const requiredAccountsProductsDatabase:any = [
	{ 
		user: SYSTEM_DB_PRODUCTS_ADMIN_USER,
		password: SYSTEM_DB_PRODUCTS_ADMIN_PASSWORD,
		db :DB_PRODUCT_DATABASE_NAME, 
		type: 2 
	},
	{ 	user: SYSTEM_DB_PRODUCTS_READONLY_USER, 
		password: SYSTEM_DB_PRODUCTS_READONLY_PASSWORD,
		db: DB_USERS_DATABASE_NAME, 
		type: 3
	}
];

export const REQUIRED_USERS_PER_DATABASE:any = [
	{ accounts: requiredAccountsAdminDatabase, dbName: "admin" },
	{ accounts: requiredAccountsUsersDatabase, dbName: DB_USERS_DATABASE_NAME },
	{ accounts: requiredAccountsProductsDatabase, dbName: DB_PRODUCT_DATABASE_NAME }
];

const dbAccounts:any[] = [
		{ value: SYSTEM_DB_USERS_ADMIN_USER , txt: ' DB USERS Admin account ' },
		{ value: SYSTEM_DB_USERS_READONLY_USER, txt: '  DB USERS readonly account ' },
		{ value: SYSTEM_DB_PRODUCTS_ADMIN_USER, txt:  ' DB PRODUCTS Admin account ' },
		{ value: SYSTEM_DB_PRODUCTS_READONLY_USER, txt:  ' DB PRODUCTS readonly account ' }		
];

dbAccounts.forEach( ({ value, txt }) => {		
	if(!value || (value && typeof value != 'string')) {
		console.error(`DB System Account: ${txt} is missing! Pleasse add one`);
		process.exit(1);	
	}
});

/***
 * Public Directory Management
 */
export const SERVE_PUBLIC_RESOURCES = process.env["SERVE_PUBLIC_RESOURCES"] == 'true';
export const PUBLIC_ROOT_DIR:string = process.env["PUBLIC_ROOT_DIR"] || './public/';
export const PUBLIC_ASSETS_DIR:string = process.env["PUBLIC_ASSETS_DIR"] || './assets/';
export const PUBLIC_IMAGES_DIR:string = process.env["PUBLIC_IMAGES_DIR"] || './images/';
export const PUBLIC_STYLES_DIR:string = process.env["PUBLIC_STYLES_DIR"] || './styles';
export const PUBLIC_ASSETS_DIRS:string[] = process.env["PUBLIC_ASSETS_DIRS"].split(",");
export const PUBLIC_STYLES_DIRS:string[] = process.env["PUBLIC_STYLES_DIRS"].split(",");
export const PUBLIC_USER_DIR:string = process.env["PUBLIC_USER_DIR"] || "./users/";
export const PUBLIC_USER_SUBDIRECTORIES:string[]=process.env["PUBLIC_USER_SUBDIRECTORIES"].split(",");



console.log("==> Puyblic Root Dir ", PUBLIC_ROOT_DIR)

if(!PUBLIC_ROOT_DIR || typeof PUBLIC_ROOT_DIR != 'string') {
	console.error("APP DIR: Please configure your public root directory in your environmental file.");
	process.exit(1);
}

if(!PUBLIC_ASSETS_DIR || typeof PUBLIC_ASSETS_DIR != 'string') {
	console.error("APP DIR: Please configure your public assets directory in your environmental file.");
	process.exit(1);
}

if(!PUBLIC_IMAGES_DIR || typeof PUBLIC_IMAGES_DIR != 'string') {
	console.error("APP DIR: Please configure public images directory in your environmental file.");
	process.exit(1);
}

if(!PUBLIC_STYLES_DIR || typeof PUBLIC_STYLES_DIR != 'string') {
	console.error("APP DIR: Please configure public styles directory in your environmental file.");
	process.exit(1);
}

const assetsDirs:string[] = PUBLIC_ASSETS_DIRS;
if(assetsDirs && !Array.isArray(assetsDirs)) {
	console.error("APP DIR: Please reconfigure your assets sub directories in your environmental file.");
	process.exit(1);
} 

const stylesDirs:string[] = PUBLIC_STYLES_DIRS;
if(stylesDirs && !Array.isArray(stylesDirs)) {
	console.error("APP DIR: Please reconfigure your styles sub directories in your environmental file.");
	process.exit(1);
} 

if(!isString(PUBLIC_USER_DIR)) {
	console.error("APP PUBLIC USERS DIR: Please specify your public users directory in your environmental file.");
	process.exit(1);	
}

const subUsersDirs:string[] = PUBLIC_USER_SUBDIRECTORIES;
if(subUsersDirs && !Array.isArray(subUsersDirs)) {
	console.error("APP DIR: Please reconfigure your user sub directories in your environmental file.");
	process.exit(1);
} 



/***
 * Private Directory Management
 */
export const CREATE_DATASTORE = process.env["CREATE_DATASTORE"] == 'true';
export const PRIVATE_ROOT_DIR = process.env["PRIVATE_ROOT_DIR"] || './private/';
export const PRIVATE_USERS_DIR = process.env["PRIVATE_USERS_DIR"] || './users/';
export const PRIVATE_DATA_DIR:string = process.env["PEIVATE_DATA_DIR"] || './datastore';

if(typeof CREATE_DATASTORE != 'boolean' ) {
	console.error("APP DATASTORE: Please configure your datastore varriable in your environmental file as either TRUE or FALSE");
	process.exit(1);
} else {
	if(PRIVATE_DATA_DIR && !isString(PRIVATE_DATA_DIR)) {
		console.error("APP DATASTORE: Please configure private data directory in your environmental file.");
		process.exit(1);
	}
}

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
export const USE_MLAB_DB_HOST:boolean = process.env["USE_MLAB_DB_HOST"] == 'true';
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

/****
 * Export Array of DB Hosts: specifies priority of db hosts
 */
const _dbPriorities:IDatabasePriority[] = [
	
	// local MongoDB instance
	TDBP_local,

	// Remote MLAB Host
	TDBP_mlab
];

// Update DB Hosts Prorioty Array  with application settings
const dbPriorities:IDatabasePriority[] = _dbPriorities.map( (priority:IDatabasePriority) => {
	if(priority.type===1) priority.use = USE_LOCAL_MONGODB_SERVER;
	if(priority.type===2) priority.use = USE_MLAB_DB_HOST;
	return priority;
});

/*****
 * Ensure that we have only one DB Host active
 */
const vHosts:IDatabasePriority[] = dbPriorities.filter ( host => host.use === true );
if(vHosts.length > 1) {
	console.error(`DB Host Priority: This application can use only a single MongoDB Host. Please check your environemntal file (.env or .prod`);
	process.exit(1);	
}

export const DB_HOSTS_PRIORITY = dbPriorities;

/*****
 * User (profile) Resources
 */
export const DEFAULT_USER_THUMBNAIL = process.env["DEFAULT_USER_THUMBNAIL"];
export const MAX_LENGTH_USER_LOGINS_EVENTS = Number(process.env["MAX_LENGTH_USER_LOGINS_EVENTS"]);
export const MAX_LENGTH_USER_DEVICES_ARRAY = Number(process.env["MAX_LENGTH_USER_DEVICES_ARRAY"]);
export const USE_DEFAULT_USER_PASSWORD = process.env["USE_DEFAULT_USER_PASSWORD"] == 'true';
export const DEFAULT_PASSWORD_SYSTEM_USER = process.env["DEFAULT_PASSWORD_SYSTEM_USER"];
export const DEFAULT_PASSWORD_USER =  process.env["DEFAULT_PASSWORD_USER"];
export const USER_PASSWORD_SALT_ROUNDS = Number(process.env["USER_PASSWORD_SALT_ROUNDS"]);

// #TODO: extend with file load test
if( !isString(DEFAULT_USER_THUMBNAIL)) {
	console.error(`User Resources: Please add a default user image to your .env or .prod file. Assign the image to DEFAULT_USER_THUMBNAIL setting and store it in your PUBLIC_IMAGES_DIR`);
	process.exit(1);	
}

if( !Number.isInteger(MAX_LENGTH_USER_LOGINS_EVENTS)) {
	console.error(`User Resources: Please set MAX_LENGTH_USER_LOGINS_EVENTS as an integer with a minimum value of 1`);
	process.exit(1);	
}

if( !Number.isInteger(MAX_LENGTH_USER_DEVICES_ARRAY)) {
	console.error(`User Resources: Please set MAX_LENGTH_USER_DEVICES_ARRAY as an integer with a minimum value of 1`);
	process.exit(1);
}

if( typeof(USE_DEFAULT_USER_PASSWORD) != 'boolean') {
	console.error(`User Resources: Please set boolean value for USE_DEFAULT_USER_PASSWORD param/`);
	process.exit(1);
}

if( !isString(DEFAULT_PASSWORD_SYSTEM_USER) || !isString(DEFAULT_PASSWORD_USER)) {
	console.error(`User Resources: Please set passwords for automated user generation`);
	process.exit(1);
}

if(isNaN(USER_PASSWORD_SALT_ROUNDS) || !Number.isInteger(USER_PASSWORD_SALT_ROUNDS)) {
	console.error(`Security: Please set BCrypt salt rounds as an integer.`);
	process.exit(1);
}

/*****
 * Password Policies
 */
export const PASSWORD_MIN_LENGTH = Number(process.env["PASSWORD_MIN_LENGTH"]);
export const PASSWORD_MAX_LENGTH = Number(process.env["PASSWORD_MAX_LENGTH"]);
export const PASSWORD_HAS_UPPERCASE = process.env["PASSWORD_HAS_UPPERCASE"] == 'true';
export const PASSWORD_HAS_LOWERCASE = process.env["PASSWORD_HAS_LOWERCASE"] == 'true';
export const PASSWORD_HAS_NUMBER = process.env["PASSWORD_HAS_SPECIAL_CHAR"] == 'true';
export const PASSWORD_HAS_SPECIAL_CHAR = process.env["PASSWORD_HAS_SPECIAL_CHAR"] == 'true';

if( !Number.isInteger(PASSWORD_MIN_LENGTH)) {
	console.error(`Password Policy: Please set PASSWORD_MINIMUM_LENGTTH as an integer with a minimum value of 1`);
	process.exit(1);
}

/*******
 * Person Sub Types
 */
export const PERSON_SUBTYPE_SYSTEM_USER = process.env["PERSON_SUBTYPE_SYSTEM_USER"];
export const PERSON_SUBTYPE_USER = process.env["PERSON_SUBTYPE_USER"];
export const PERSON_SUBTYPE_CLIENT = process.env["PERSON_SUBTYPE_CLIENT"];
export const PERSON_SUBTYPE_CUSTOMER = process.env["PERSON_SUBTYPE_CUSTOMER"];

export const PERSON_SUBTYPES:string[] = [
	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER
];

export const USE_PERSON_SUBTYPE_USER = process.env["USE_PERSON_SUBTYPE_USER"] == 'true';
export const USE_PERSON_SUBTYPE_CLIENT = process.env["USE_PERSON_SUBTYPE_CLIENT"] == 'true';
export const USE_PERSON_SUBTYPE_CUSTOMER = process.env["USE_PERSON_SUBTYPE_CUSTOMER"] == 'true';

/***
 * DB Population
 */
export const GENERATE_SAMPLE_DATA = process.env["GENERATE_SAMPLE_DATA"] == 'true';
export const POPULATE_LOCAL_DATASTORE = process.env["POPULATE_LOCAL_DATASTORE"] == 'true';
export const POPULATE_LOCAL_DATABASE  = process.env["POPULATE_LOCAL_DATABASE"] == 'true';
export const POPULATE_REMOTE_DATABASE  = process.env["POPULATE_REMOTE_DATABASE"] == 'true';
export const DB_POPULATE_SAFETY_FIRST = process.env["DB_POPULATE_SAFETY_FIRST"] == 'true';
export const DB_POPULATE_TEST_COLLECTIONS = process.env["DB_POPULATE_TEST_COLLECTIONS"].split(',');
export const DB_POPULATE_ADMINS =  Number(process.env["DB_POPULATE_ADMINS"]);
export const DB_POPULATE_POWER_USERS =  Number(process.env["DB_POPULATE_POWER_USERS"]);
export const DB_POPULATE_AUTHORS = Number(process.env["DB_POPULATE_AUTHORS"]);
export const DB_POPULATE_USERS =  Number(process.env["DB_POPULATE_USERS"]);
export const DB_POPULATION_LOCALE = process.env["DB_POPULATION_LOCALE"];

export const DB_CREATE_USERS = process.env["DB_CREATE_USERS"];
export const DB_SYSTEM_USERS_COLLECTION_NAME = process.env["DB_SYSTEM_USERS_COLLECTION_NAME"] || "users";
export const DB_USERS_COLLECTION_NAME = process.env["DB_USERS_COLLECTION_NAME"] || "users";
export const DB_CREATE_CLIENTS = process.env["DB_CREATE_CLIENTS"];
export const DB_CLIENTS_COLLECTION_NAME = process.env["DB_CLIENTS_COLLECTION_NAME"] || "clients";
export const DB_CREATE_CUSTOMERS = process.env["DB_CREATE_CUSTOMERS"] || "customers";
export const DB_CUSTOMERS_COLLECTION_NAME = process.env["DB_CUSTOMERS_COLLECTION_NAME"];
export const DB_POPULATE_DEFAULT_CLIENTS= Number(process.env["DB_POPULATE_DEFAULT_CLIENTS"]);
export const DB_POPULATE_DEFAULT_CUSTOMERS= Number(process.env["DB_POPULATE_DEFAULT_CUSTOMERS"]);

if(GENERATE_SAMPLE_DATA) {

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
export const ENABLE_GOOGLE_AUTHENTICATION = process.env["ENABLE_GOOGLE_AUTHENTICATION"] == 'true';
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
 * facebook Authentication
 */
export const ENABLE_FACEBOOK_AUTHENTICATION = process.env["ENABLE_FACEBOOK_AUTHENTICATION"] == 'true';
export const FACEBOOK_ID =  process.env["FACEBOOK_ID"];
export const FACEBOOK_SECRET= process.env["FACEBOOK_SECRET"];
export const FACEBOOK_CALLBACK_URL = process.env["FACEBOOK_CALLBACK_URL"];

if(ENABLE_FACEBOOK_AUTHENTICATION) {

}

/***
 * Local Authentication
 */
export const ENABLE_LOCAL_AUTHENTICATION = process.env["ENABLE_LOCAL_AUTHENTICATION"] == 'true';
export const LOCAL_AUTH_REQUIRE_PASSWORD_CONFIRMATION = process.env["LOCAL_AUTH_REQUIRE_PASSWORD_CONFIRMATION"] == 'true';
export const LOCAL_AUTH_REQUIRE_MIDDLE_NAME = process.env["LOCAL_AUTH_REQUIRE_MIDDLE_NAME"] == 'true';
export const LOCAL_AUTH_FORM_MAX_LENGTH_FIRST_NAME = parseInt(process.env["LOCAL_AUTH_FORM_MAX_LENGTH_FIRST_NAME"]);
export const LOCAL_AUTH_FORM_MAX_LENGTH_MIDDLE_NAME = parseInt(process.env["LOCAL_AUTH_FORM_MAX_LENGTH_MIDDLE_NAME"]);
export const LOCAL_AUTH_FORM_MAX_LENGTH_LAST_NAME = parseInt(process.env["LOCAL_AUTH_FORM_MAX_LENGTH_LAST_NAME"]);

export const LOCAL_AUTH_CONFIG = {
	enable: ENABLE_LOCAL_AUTHENTICATION,
	requirePasswordConfirmation: LOCAL_AUTH_REQUIRE_PASSWORD_CONFIRMATION,
	requireMiddleName: LOCAL_AUTH_REQUIRE_MIDDLE_NAME,
	validation: {
		maxLengthFirstName: LOCAL_AUTH_FORM_MAX_LENGTH_FIRST_NAME,
		maxLengthMiddleName: LOCAL_AUTH_FORM_MAX_LENGTH_MIDDLE_NAME,
		maxLengthLastName: LOCAL_AUTH_FORM_MAX_LENGTH_LAST_NAME
	}
}

if(	!Number.isInteger(LOCAL_AUTH_FORM_MAX_LENGTH_FIRST_NAME) || 
	!Number.isInteger(LOCAL_AUTH_FORM_MAX_LENGTH_MIDDLE_NAME) ||
	!Number.isInteger(LOCAL_AUTH_FORM_MAX_LENGTH_LAST_NAME) 
) {
	console.error("Local user Authentication: please check your validation settings for user application form ");
	process.exit(1);
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

if(EXPRESS_SERVER_MODE=='https') {

	/***
	 * Test for SSL certificates in development mode
	 */
	if(ENVIRONMENT=='dev') {

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

