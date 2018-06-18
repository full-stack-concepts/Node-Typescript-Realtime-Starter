import Promise from "bluebird";
const uuidv1 = require("uuid/v1");
import validator from "validator";


import { 
	cloneArray, deepCloneObject, isURL, isEmail, capitalizeString, 
	constructProfileFullName, constructProfileSortName, constructClientCredentials,
	FormValidation
} from "../../util";

import { UserOperations } from "./user.ops.service";
import { IUser, IClient, ICustomer, IClientApplication, ILoginRequest, IEncryption, ILoginTracker, IFindUser, IDeleteUser } from "../../shared/interfaces";
import { TCLIENT } from "../../shared/types";
import { WebToken} from "./token.service";

import {		
	LOCAL_AUTH_CONFIG,
	PERSON_SUBTYPE_CLIENT
} from "../../util/secrets";

/***
 * Import Actions
 */
import {
	CREATE_WEBTOKEN
} from "../../controllers/actions";

import { 
	clientModel
} from "../../shared/models";

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
		
		form.email.toLowerCase();

		const valid = tests.length;

		if(!valid ) {
			return Promise.resolve();
		} else {
			return Promise.reject(tests[0]);
		}
	}

	private clientProfile(client: any, form:IClientApplication, encrypt:IEncryption) {

		if(client) {
			return Promise.resolve(client);
		}

		// clone default client type
		let newUser:IClient = deepCloneObject(TCLIENT);

		// assign default user role for client
		const userRole:number=10;

		// Profile Core Identifiers		
		newUser = this.setCoreIdentifiers(newUser, form, userRole);

		// Profile Security And Account
		newUser = this.setSecurity(newUser, form, userRole, encrypt, false);

		// Profile Thumbnnail
		newUser = this.setExternalThumbnail(newUser, false);		

		// Profile Personalia
		newUser = this.setPersonalia(newUser, form);

		// Profile display names 		 */ 	
		newUser = this.setDisplayNames(newUser, form);

		// user credentials: userName && url 
		newUser = this.setCredentials(newUser);	
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
		.then( (person:IUser|IClient|ICustomer|undefined) => this.encryptPassword(person, form.password) )

		.then( ({client, encrypt}:any) => this.clientProfile(client, form, encrypt) )

		// process thick: build user object
		.then( (client:IUser|IClient|ICustomer) =>  this.newClient(client) )			

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

		.then( (client:IClient) => this.validateUserPassword(client, login.password) )	


		// process thick: create login
		.then( (client:IClient) => {

			let login:ILoginTracker = this.authenticationTracker();
			let logins:ILoginTracker[] = this.updateLoginsArray(client, login);
		
			return Promise.resolve({client, logins});
		})

		// process thick: update client object
		.then( ({client, logins}:any) => {	
			return this.updateUser(
				{ 'core.email': login.email },
				{ $set: 
					{'logins': logins}
				},
				PERSON_SUBTYPE_CLIENT
			);			
		})	

		// process thick: create authenticatoin token
		.then( (client:IClient) => WebToken.createWebToken( client.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:any) => Promise.reject(err) );	
	}

	/***
	 * Find client by ID
	 * @email:string
	 * @url:string
	 * @identifier: uuid-string
	 */
	public findSingleClient(request:IFindUser) {

		// loop through find object and return first key with value
		type key = keyof IFindUser;
		let keys:string[] = Object.keys(request);
		let ID:string;
		let field:string;
		
		keys.forEach( (key:any) => {			
			if(request[key]) {
				field = `core.${key}`;
				ID= request[key];
			}
		});
		if(!field || !ID) return Promise.reject('<errorNumber>');

		return clientModel.findOne({ [field]:[ID]})
		.then( (client:IClient) => {
			delete client._id;
			return Promise.resolve( client ) 
		})
		.catch( (err:any) => Promise.reject(err));
	}

	/***
	 * Delete user By ID
	 * @emal:string
	 * @url:string
	 * @identifier:string
	 */
	public deleteSingleClient(request:IDeleteUser) {
		
		type key = keyof IDeleteUser;
		let keys:string[] = Object.keys(request);
		let ID:string;
		let field:string;

		keys.forEach( (key:any) => {			
			if(request[key]) {
				field = `core.${key}`;
				ID = request[key];
			}
		});
		if(!field || !ID) return Promise.reject('<errorNumber>');

		return clientModel.remove({ [field]:[ID]})
		.then( () => Promise.resolve() )
		.catch( (err:any) => Promise.reject(err));

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

	public findSingleClient( find:IFindUser ) {
		let instance:any = new ClientService();
		return instance.findSingleClient(find)
			.then( (client:IClient) => Promise.resolve(client) )
			.catch( (err:any) => Promise.reject(err) );
	}

	public deleteSingleClient( request:IDeleteUser ) {
		let instance:any = new ClientService();
		return instance.deleteSingleClient(request)
			.then( () => Promise.resolve() )
			.catch( (err:any) => Promise.reject(err) );
	}
}

export const clientService:any = new ActionService();