import Promise from "bluebird";
const uuidv1 = require("uuid/v1");
import validator from "validator";


import { 
	cloneArray, deepCloneObject, isURL, isEmail, capitalizeString, 
	constructProfileFullName, constructProfileSortName, constructClientCredentials,
	FormValidation, decryptPassword
} from "../../util";

import { UserOperations } from "./user.ops.service";
import { IUser, IClient, ICustomer, IClientApplication, ILoginRequest, IEncryption, ILoginTracker } from "../../shared/interfaces";
import { TCLIENT } from "../../shared/types";
import { WebToken} from "./token.service";

import {		
	LOCAL_AUTH_CONFIG
} from "../../util/secrets";

/***
 * Import Actions
 */
import {
	CREATE_WEBTOKEN
} from "../../controllers/actions";

export class ClientService extends UserOperations {

	constructor() {
		super();
	}

	private validateApplicationForm(form:IClientApplication) {	

		const v = validator;
		let tests:number[]=[];

		// first name
		if(!FormValidation.firstName(form.firstName)) tests.push(1); 		
		
		// middle name
		if(LOCAL_AUTH_CONFIG.requireMiddleName) { if(!FormValidation.middleName(form.middleName)) {tests.push(2); } }
		
		// last name
		if(!FormValidation.lastName(form.lastName)) tests.push(3); 			
		
		// email
		if(!FormValidation.isEmail(form.email)) tests.push(4);

		// password
		if(!FormValidation.testPassword(form.password)) tests.push(5);

		// password confirmatoin
		if(LOCAL_AUTH_CONFIG.requirePasswordConfirmation) {
			if(!FormValidation.testPassword(form.confirmPassword)) tests.push(6);
			if(form.confirmPassword && form.password != form.confirmPassword) tests.push(7);
		}	 
		const valid = tests.length;

		if(!valid ) {
			return Promise.resolve();
		} else {
			return Promise.reject(tests[0]);
		}
	}

	private clientProfile(form:IClientApplication, hash:string, method:number) {

		let newUser:IClient = deepCloneObject(TCLIENT);

		/***
		 * Core
		 */
		newUser.core.identifier = uuidv1();
		newUser.core.email = form.email;

		/*** 
		 * Security and account Type
		 */
		newUser.password.value = hash;
		newUser.password.method = method;				
		newUser.security.accountType = 10;			
		newUser.security.isAccountVerified = true;
		newUser.core.role = 10;
		newUser.password.value = hash;
		newUser.security.isPasswordEncrypted = false; 
		newUser.accounts.localID = form.email;

		// thumbnail
		newUser.configuration.hasExternalThumbnailUrl = false;

		/*** 
		 * Profile Personalia
		 */
		newUser.profile.personalia.givenName = capitalizeString(form.firstName);
		if(LOCAL_AUTH_CONFIG.requireMiddleName) {
			newUser.profile.personalia.middleName = capitalizeString(form.middleName);
		}
		newUser.profile.personalia.familyName = capitalizeString(form.lastName) || "";  	

		/****
		 * format display names 
		 */ 	
		let n:any = {
			givenName:form.firstName, 
			middleName:form.middleName,
			familyName:form.lastName
		}
		newUser.profile.displayNames.fullName = constructProfileFullName(n);
		newUser.profile.displayNames.sortName = constructProfileSortName(n);

		/****
		 * user credentials: userName && url 
		 */
		constructClientCredentials( newUser, (credentials:any) => {
			newUser.core.userName = credentials.userName;
			newUser.core.url = credentials.url;  
		});		

		return Promise.resolve(newUser);
	}


	/***
	 * Test Account Type 
	 * Expected type value : 5
	 */
	private testAccountType(user:IUser) {
		if(user.core.role != 10 || user.security.accountType != 10) {
			return Promise.resolve(user);
		} else {
			return Promise.reject("<errorNumber>");
		}
	}

	/***
	 *
	 */
	private addLogin(client:IClient):IClient {

		let login:ILoginTracker = this.authenticationTracker();
		let _logins:ILoginTracker[]=[];
		
		if( client.logins && Array.isArray(client.logins)) _logins = cloneArray(client.logins);						
		_logins.push(login);
		client.logins=_logins;		
		return client;
	}

	/***
	 * 
	 */
	private validatePassword(user:IClient, {method, hash, data}:IEncryption):Promise<IClient> {
		return decryptPassword(method, hash, data)
		.then( () => Promise.resolve(user) )
		.catch( () => Promise.reject('errorNumber10'));
	}

	public registerClient(form:IClientApplication) {

		/***
		 * Validate application Form
		 */
		return this.validateApplicationForm(form)

		/****
		 * Test for account type
		 * => as we have defined multiple person types
		 */
		.then( () => this.testForAccountType(form.email) )

		/****
		 * 
		 */
		.then( (person:IUser|IClient|ICustomer|undefined) => {	

			if(!person) {							
				
				// process thick: ancrypt password
				return this.encryptPassword(form.password)

				// process thick: build user object
				.then( ({hash, method}:any) => this.clientProfile(form, hash, method) )

				// process thick: build client object
				.then( (client:IClient) => this.newClient(client) ); 
				
			} else {			
				return Promise.reject('<errorNumber>');
			}
		})	

		/*** 
		 * process thick: create webtoken
		 */
		.then( (client:IClient) => WebToken.createWebToken( client.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:any) => {		
			Promise.reject(err);
		});	
	}

	public loginClient(login:ILoginRequest) {

		return this.testUserEmail(login.email)

		// process thick:
		.then( () => this.testPassword(login.password) )

		// process thick: test for account
		.then( () => this.testForAccountType(login.email))// process thick: validate password

		.then( (client:IClient) => {					
			let decrypt:IEncryption = {hash: client.password.value, method: client.password.method,  data:login.password };			
			return this.validatePassword(client, decrypt);
		})

		// process thick:
		.then( (client:IClient) => {			
			client = this.addLogin(client);
			return Promise.resolve(client);
		})

		// process thick: save user object
		.then( (client:IClient) => this.updateUser (client) )

		// process thick: create authenticatoin token
		.then( (client:IClient) => WebToken.createWebToken( client.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:any) => Promise.reject(err) );	

	}
}

/****
 * Public Interface for User Actions Controller
 */
class ActionService {

	public registerClient( application:IClientApplication ) {
		let instance:any = new ClientService();
		return instance.registerClient(application)
			.then( (user:IUser) => Promise.resolve(user) )
			.catch( (err:any) => Promise.reject(err) );
	}

	public loginClient( login:ILoginRequest ) {
		let instance:any = new ClientService();
		return instance.loginClient(login)
			.then( (token:string) => Promise.resolve(token) )
			.catch( (err:any) => Promise.reject(err) );
	}
}

export const clientService:any = new ActionService();