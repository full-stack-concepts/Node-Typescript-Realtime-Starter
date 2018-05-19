import Promise from "bluebird";
const uuidv1 = require("uuid/v1");
import validator from "validator";


import { 
	cloneArray, deepCloneObject, isURL, isEmail, capitalizeString, 
	constructProfileFullName, constructProfileSortName, constructClientCredentials,
	FormValidation, decryptPassword
} from "../../util";

import { UserOperations } from "./user.ops.service";
import { IUser, IClient, ICustomer, ICustomerApplication, ILoginRequest, IEncryption, ILoginTracker } from "../../shared/interfaces";
import { TCUSTOMER } from "../../shared/types";
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

export class CustomerService extends UserOperations {

	constructor() {
		super();
	}

	private validateApplicationForm(form:ICustomerApplication) {		

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

	private customerProfile(form:ICustomerApplication, hash:string, method:number) {

		let newUser:IClient = deepCloneObject(TCUSTOMER);

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
		newUser.security.accountType = 15;			
		newUser.security.isAccountVerified = true;
		newUser.core.role = 15;
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
	 *
	 */
	private addLogin(customer:ICustomer):ICustomer {

		let login:ILoginTracker = this.authenticationTracker();
		let _logins:ILoginTracker[]=[];
		
		if( customer.logins && Array.isArray(customer.logins)) _logins = cloneArray(customer.logins);						
		_logins.push(login);
		customer.logins=_logins;		
		return customer;
	}

	/***
	 * 
	 */
	private validatePassword(customer:ICustomer, {method, hash, data}:IEncryption):Promise<ICustomer> {
		return decryptPassword(method, hash, data)
		.then( () => Promise.resolve(customer) )
		.catch( () => Promise.reject('errorNumber10'));
	}

	public loginCustomer(login:ILoginRequest) {

		return this.testUserEmail(login.email)

		// process thick:
		.then( () => this.testPassword(login.password) )

		// process thick: test for account
		.then( () => this.testForAccountType(login.email))// process thick: validate password

		.then( (customer:ICustomer) => {					
			let decrypt:IEncryption = {hash: customer.password.value, method: customer.password.method,  data:login.password };			
			return this.validatePassword(customer, decrypt);
		})

		// process thick:
		.then( (customer:ICustomer) => {			
			customer = this.addLogin(customer);
			return Promise.resolve(customer);
		})

		// process thick: save user object
		.then( (customer:ICustomer) => this.updateUser (customer) )

		// process thick: create authenticatoin token
		.then( (customer:ICustomer) => WebToken.createWebToken( customer.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:any) => Promise.reject(err) );	
	}

	public registerCustomer(form:ICustomerApplication) {

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
				.then( ({hash, method}:any) => this.customerProfile(form, hash, method) )

				// process thick: build client object
				.then( (customer:ICustomer) => this.newCustomer(customer) ); 
				
			} else {			
				return Promise.reject('<errorNumber>');
			}
		})	

		/*** 
		 * process thick: create webtoken
		 */
		.then( (customer:ICustomer) => WebToken.createWebToken( customer.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:any) => {		
			Promise.reject(err);
		});	

	}
}

/****
 * Public Interface for User Actions Controller
 */
class ActionService {

	public registerCustomer( application:ICustomerApplication ) {
		let instance:any = new CustomerService();
		return instance.registerCustomer(application)
			.then( (customer:ICustomer) => Promise.resolve(customer) )
			.catch( (err:any) => Promise.reject(err) );
	}

	public loginCustomer( login:ILoginRequest ) {
		let instance:any = new CustomerService();
		return instance.loginCustomer(login)
			.then( (token:string) => Promise.resolve(token) )
			.catch( (err:any) => Promise.reject(err) );
	}
}

export const customerService:any = new CustomerService();