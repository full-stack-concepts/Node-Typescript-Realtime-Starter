import Promise from "bluebird";
const uuidv1 = require("uuid/v1");
import validator from "validator";


import { 
	cloneArray, deepCloneObject, isURL, isEmail, capitalizeString, 
	constructProfileFullName, constructProfileSortName, constructClientCredentials,
	FormValidation
} from "../../util";

import { UserOperations } from "./user.ops.service";
import { IUser, IClient, ICustomer, ICustomerApplication, ILoginRequest, IEncryption, ILoginTracker, IFindUser, IDeleteUser} from "../../shared/interfaces";
import { TCUSTOMER } from "../../shared/types";
import { WebToken} from "./token.service";

import {		
	LOCAL_AUTH_CONFIG,
	PERSON_SUBTYPE_CUSTOMER
} from "../../util/secrets";

/***
 * Import Actions
 */
import {
	CREATE_WEBTOKEN
} from "../../controllers/actions";

import { 
	customerModel
} from "../../shared/models";

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

		form.email.toLowerCase();
		
		const valid = tests.length;

		if(!valid ) {
			return Promise.resolve();
		} else {
			return Promise.reject(tests[0]);
		}
	}

	private customerProfile(customer:any, form:ICustomerApplication, encrypt:IEncryption) {

		if(customer) return Promise.resolve(customer);

		let newUser:IClient = deepCloneObject(TCUSTOMER);

		// assign default user role for client
		const userRole:number=15;

		// Profile Core Identifiers		
		newUser = this.setCoreIdentifiers(newUser, form, userRole);

		// Profile Security And Account
		newUser = this.setSecurity(newUser, form, userRole, encrypt, false);

		// Profile Thumbnnail
		newUser = this.setExternalThumbnail(newUser, false);		

		// Profile Personalia
		newUser = this.setPersonalia(newUser, form);

		// Profile display names 	
		newUser = this.setDisplayNames(newUser, form);

		// user credentials: userName && url 
		newUser = this.setCredentials(newUser);	

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

	public loginCustomer(login:ILoginRequest) {

		return this.testUserEmail(login.email)

		// process thick:
		.then( () => this.testPassword(login.password) )

		// process thick: test for account
		.then( () => this.testForAccountType(login.email))// process thick: validate password

		.then( (customer:ICustomer) => 	this.validateUserPassword(customer, login.password) )

		// process thick:
		.then( (customer:ICustomer) => {			
			customer = this.addLogin(customer);
			return Promise.resolve(customer);
		})

		// process thick: create login
		.then( (customer:ICustomer) => {

			let login:ILoginTracker = this.authenticationTracker();
			let logins:ILoginTracker[] = this.updateLoginsArray(customer, login);
		
			return Promise.resolve({customer, logins});
		})

		// process thick: update user object
		.then( ({customer, logins}:any) => {		
			return this.updateUser(
				{ 'core.email': login.email },
				{ $set: 
					{'logins': logins}
				},
				PERSON_SUBTYPE_CUSTOMER
			);			
		})		

		// process thick: create authenticatoin token
		.then( (customer:ICustomer) => WebToken.createWebToken( customer.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:Error) => Promise.reject(err) );	
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
		.then( (person:IUser|IClient|ICustomer|undefined) => this.encryptPassword(person, form.password) )

		.then( ({customer, encrypt}:any) => this.customerProfile(customer, form, encrypt) )

		// process thick: build user object
		.then( (user:ICustomer) => this.newCustomer(user) )	
		
		/*** 
		 * process thick: create webtoken
		 */
		.then( (customer:ICustomer) => WebToken.createWebToken( customer.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:Error) => Promise.reject(err) );	
	}

	/***
	 * Find client by ID
	 * @email:string
	 * @url:string
	 * @identifier: uuid-string
	 */
	public findSingleCustomer(request:IFindUser) {

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

		return customerModel.findOne({ [field]:[ID]})
		.then( (customer:ICustomer) => {
			delete customer._id;
			return Promise.resolve( customer ) 
		})
		.catch( (err:Error) => Promise.reject(err));
	}

	/***
	 * Delete user By ID
	 * @emal:string
	 * @url:string
	 * @identifier:string
	 */
	public deleteSingleCustomer(request:IDeleteUser) {
		
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

		return customerModel.remove({ [field]:[ID]})
		.then( () => Promise.resolve() )
		.catch( (err:Error) => Promise.reject(err));

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
			.catch( (err:Error) => Promise.reject(err) );
	}

	public loginCustomer( login:ILoginRequest ) {
		let instance:any = new CustomerService();
		return instance.loginCustomer(login)
			.then( (token:string) => Promise.resolve(token) )
			.catch( (err:Error) => Promise.reject(err) );
	}

	public findSingleCustomer( find:IFindUser ) {
		let instance:any = new CustomerService();
		return instance.findSingleCustomer(find)
			.then( (customer:ICustomer) => Promise.resolve(customer) )
			.catch( (err:Error) => Promise.reject(err) );
	}

	public deleteSingleCustomer( request:IDeleteUser ) {
		let instance:any = new CustomerService();
		return instance.deleteSingleCustomer(request)
			.then( () => Promise.resolve() )
			.catch( (err:Error) => Promise.reject(err) );
	}
}

export const customerService:CustomerService = new CustomerService();