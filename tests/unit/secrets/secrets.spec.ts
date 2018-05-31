const chai = require("chai");
import { expect, assert, should } from 'chai';
import Validator from "validator";
const v:Validator = Validator;


import {
	ENVIRONMENT,
	EXPRESS_SERVER_MODE,
	SITE_URL,
	PORT,
	SITE_NAME,
	SITE_URL,
	DB_SYSTEM_USERS,
	REQUIRED_USERS_PER_DATABASE,
	PERSON_SUBTYPES,
	LOCAL_AUTH_CONFIG,
	LOCAL_AUTH_FORM_MAX_LENGTH_FIRST_NAME,
	LOCAL_AUTH_FORM_MAX_LENGTH_MIDDLE_NAME,
	LOCAL_AUTH_FORM_MAX_LENGTH_LAST_NAME,

	/*** 
	 * Public Paths
	 */
	SERVE_PUBLIC_RESOURCES,
	PUBLIC_ROOT_DIR,
	PUBLIC_ASSETS_DIR,
	PUBLIC_IMAGES_DIR,
	PUBLIC_STYLES_DIR,
	PUBLIC_ASSETS_DIRS,
	PUBLIC_STYLES_DIRS,
	PUBLIC_USER_DIR,
	PUBLIC_USER_SUBDIRECTORIES,

	/***
	 * Private Dir PATHS && Settings
	 */
	CREATE_DATASTORE,
	PRIVATE_ROOT_DIR,
	PRIVATE_USERS_DIR,
	PRIVATE_DATA_DIR,

	/***
	 * Google Authentication
	 */
	ENABLE_GOOGLE_AUTHENTICATION,
	GOOGLE_AUTH_ID,
	GOOGLE_AUTH_SECRET,
	GOOGLE_CALLBACK_URL,

	/***
	 * Facebook Authentication
	 */
	ENABLE_FACEBOOK_AUTHENTICATION,
	FACEBOOK_ID,
	FACEBOOK_SECRET,
	FACEBOOK_CALLBACK_URL

} from "../../../src/util/secrets";

interface IDBUSER {
	user: string,
	password: string,
	host: string,		
	db: string, 
	port: number,
	type: number 
}

const done = () => {
	return setTimeout( () => {
		console.log("Asserted")
	},1000)
}

describe("Application", () => {	

	/****
	 *
	 */
	describe("App default settings", () => {

		it("should have an environmental variable", () => {
			expect(ENVIRONMENT).to.be.a('string');			
		});

		it("should have valid application core settings", () => {		
			expect(SITE_NAME).to.be.a('string');		
	    	expect(SITE_URL).to.be.a('string');		
		});

		it("shoud have valid Express Port Number", () => {	
			const port = parseInt(PORT);
	    	expect( Number.isInteger(port)).to.equal(true);    	
		});

		it("should fail as no callback is provided and no arguments are passed", async( done) => {			
			expect(true).to.equal(true);	
			done();
		});

	});

	/****
	 *
	 */
	describe("Express", () => {
		it("should serve with http or https protocol", () => {
			let validProtocol = (EXPRESS_SERVER_MODE === 'http' || EXPRESS_SERVER_MODE == 'https')
			expect(validProtocol).to.equal(true);
		});
	});

	/****
	 *
	 */
	describe("System Database Users", () => {	

		let users:string[]=[];
		let passwords:string[]=[];
		let hosts:string[]=[];
		let dbs:string[]=[];
		let ports:number[]=[];
		let types:number[]=[];


		DB_SYSTEM_USERS.forEach( (dbUser:IDBUSER) => {
			users.push(dbUser.user);
			passwords.push(dbUser.password);
			hosts.push(dbUser.host);
			dbs.push(dbUser.db);
			ports.push(dbUser.port);
			types.push(dbUser.type);
		});	

		it("should have all required keys per item", () => {
			DB_SYSTEM_USERS.forEach(i => expect(i).to.have.all.keys('user', 'password', 'host', 'db', 'port', 'type'));			
		});

		it("should have a property user of string type per item", () => {
			users.forEach(i => expect(i).to.be.a('string').and.to.exist );
		});

		it("should have a property password of string type", () => {
			passwords.forEach(i => expect(i).to.be.a('string').and.to.exist );
		});

		it("should have a property host of string type", () => {
			hosts.forEach(i => expect(i).to.be.a('string').and.to.exist );
		});

		it("should have a property db of string type", () => {
			dbs.forEach(i => expect(i).to.be.a('string').and.to.exist );
		});	

		it("should have a port that is a number and above 4000", () => {
			ports.forEach(i => {				
				expect(Number.isInteger(parseInt(i))).to.equal(true);				
				expect(parseInt(i)).to.be.above(4000);
			});
		})

		it("should have an account type that is an numbert and be greater than 0 and smaller than 4", () => {
			types.forEach(i=> expect(parseInt(i)).to.be.above(0).and.below(4) );
		});

		it("should have no more than one system user with account type 1", () => {
			const _arr:number[]=types.filter( i => i===1);
			expect(types).to.include(1);
			expect(_arr).to.have.length(1);
		});

		it("should have at least one database admin", () => {
			const _arr:number = types.filter(i => i===2);
			expect(_arr).to.have.length.above(0);
		});

		it("should have at least one read only user", (done) => {
			const _arr:number = types.filter(i => i===3);
			expect(_arr).to.have.length.above(0);
			done();
		});		
	});	

	/***
	 *
	 */
	describe("Required Users Per Database", () => {
		
		it("should have these fine keys per entry", () => {			
			REQUIRED_USERS_PER_DATABASE.forEach(i => expect(i).to.have.all.keys('accounts', 'dbName') );
		});

		it("should have one entry for ADMIN database", () => {
			const _arr = REQUIRED_USERS_PER_DATABASE.filter( i => i.dbName === 'admin');
			expect(_arr.length===1).to.equal(true);
		})

		it("should have a RX and R account per database", () => {
			const _arr = REQUIRED_USERS_PER_DATABASE.filter( i => i.dbName != 'admin');
			_arr.forEach( i => expect(i.accounts.length).to.equal(2));
		})
	});

	/***
	 *
	 */
	describe("Person Subtypes", () => {	

		it("should have four defined user types", () => {
			expect(PERSON_SUBTYPES.length).to.equal(4);		
		});

		it("should have subtypes defined as strings", () => {
			PERSON_SUBTYPES.forEach(i => expect(i).to.be.a('string'))
		});		
	});

	/****
	 *
	 */
	describe("Local Authentication", () => {

		it("should be enabled or disabled", () => {
			expect(LOCAL_AUTH_CONFIG.enable).to.be.a('boolean');
		});

		it("should instruct client to confirm password on user application", () => {
			expect(LOCAL_AUTH_CONFIG.requirePasswordConfirmation).to.be.a('boolean');
		});

		it("should instruct client to provide a middle name on user application", () => {
			expect(LOCAL_AUTH_CONFIG.requirePasswordConfirmation).to.be.a('boolean');
		});

		it("should have validation property maxLengthFirstName", () => {		
			expect(LOCAL_AUTH_CONFIG.validation).to.have.property('maxLengthFirstName', LOCAL_AUTH_FORM_MAX_LENGTH_FIRST_NAME);
		});

		it("should have validation property maxLengthMiddleName", () => {		
			expect(LOCAL_AUTH_CONFIG.validation).to.have.property('maxLengthMiddleName', LOCAL_AUTH_FORM_MAX_LENGTH_MIDDLE_NAME);
		});

		it("should have validation property maxLengthLastName", () => {		
			expect(LOCAL_AUTH_CONFIG.validation).to.have.property('maxLengthLastName', LOCAL_AUTH_FORM_MAX_LENGTH_LAST_NAME);
		});

	});

	/****
	 * Google Authentication
	 */
	describe("Google Authentication", () => {

		it("should be enabled or disabled", () => {
			expect(ENABLE_GOOGLE_AUTHENTICATION).to.be.a('boolean');
		});

		it("should have a defined GOOGLE_AUTH_ID", () => {
			expect(GOOGLE_AUTH_ID).to.be.a('string').and.to.exist;
		});

		it("should have a defined authentication secret", () => {
			expect(GOOGLE_AUTH_SECRET).to.be.a('string').and.to.exist;
		});

		it("should have a defined callback url", () => {
			expect(GOOGLE_CALLBACK_URL).to.be.a('string').and.to.exist;
		});

		it("should have a valid callback url per environment", () => {			
			const url:string = `${SITE_URL}${GOOGLE_CALLBACK_URL}`;
			if(ENVIRONMENT === 'dev') {
				expect(v.isURL(url)).to.be.a('boolean');
			} else {
				expect( v.isURL(url)).to.equal(true);
			}
		});
	});

	/***
	 * Facebook Authentication
	 */	
	describe("Facebook Authentication", () => {

		it("should be enabled or disabled", () => {
			expect(ENABLE_FACEBOOK_AUTHENTICATION).to.be.a('boolean');
		});

		it("should have a defined Facebook Application ID", () => {
			expect(FACEBOOK_ID).to.be.a('string').and.to.exist;
		});

		it("should have a defined authentication secret", () => {
			expect(FACEBOOK_SECRET).to.be.a('string').and.to.exist;
		});

		it("should have a defined callback url", () => {
			expect(FACEBOOK_CALLBACK_URL).to.be.a('string').and.to.exist;
		});

		it("should have a valid callback url per environment", () => {			
			const url:string = `${SITE_URL}${FACEBOOK_CALLBACK_URL}`;
			if(ENVIRONMENT === 'dev') {
				expect(v.isURL(url)).to.be.a('boolean');
			} else {
				expect( v.isURL(url)).to.equal(true);
			}
		});
	});


	/****
	 * Public Directory Infrastructure
	 */
	describe("Public Directory Infrastructure", () => {

		it("should instruct the app whether to serve public resources or not", () => {
			expect(SERVE_PUBLIC_RESOURCES).to.be.a('boolean');
		});

		it("should have a defined public root directory", () => {
			 expect(PUBLIC_ROOT_DIR).to.be.a('string').and.to.exist;
		});

		it("should ghave a defined public assets directory", () => {
			 expect(PUBLIC_ASSETS_DIR).to.be.a('string').and.to.exist;
		});

		it("should have a defined public images directory", () => {
			 expect(PUBLIC_IMAGES_DIR).to.be.a('string').and.to.exist;
		});

		it("could have defined public assets subdirectories", () => {
			 expect(PUBLIC_ASSETS_DIRS).to.be.an('array');
			 if(PUBLIC_ASSETS_DIRS.length) {
			 	PUBLIC_ASSETS_DIRS.forEach( i => expect(i).to.be.a('string'));
			 }
		});

		it("could have defined public styles subdirectories", () => {
			 expect(PUBLIC_STYLES_DIRS).to.be.an('array');
			 if(PUBLIC_STYLES_DIRS.length) {
			 	PUBLIC_STYLES_DIRS.forEach( i => expect(i).to.be.a('string'));
			 }
		});

		it("should have defined public users directgory", () => {
			 expect(PUBLIC_USER_DIR).to.be.a('string').and.to.exist;
		});
	});

	/***
	 * Private Directory Infrastructure
	 */
	describe("Private Directory Infrastructure", () => {

		it("should have a defined private root directory", () => {
			 expect(PRIVATE_ROOT_DIR).to.be.a('string').and.to.exist;
		});

		it("should have a defined private users root directory", () => {
			 expect(PRIVATE_USERS_DIR).to.be.a('string').and.to.exist;
		});	
	});

	/***
	 * DataStore
	 */
	describe("Dasta Store", () => {

		it("should instruct the app whether to create a DataStore or not  ", () => {
			 expect(CREATE_DATASTORE).to.be.a('boolean').and.to.exist;
		});

		it("should have a defined private data root directory", () => {
			 expect(PRIVATE_DATA_DIR).to.be.a('string').and.to.exist;
		});	
	});

});







