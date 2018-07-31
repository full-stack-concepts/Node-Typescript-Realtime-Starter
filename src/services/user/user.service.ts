import path from "path";
import fs from "fs-extra";
import Promise from "bluebird";
import fetch from "node-fetch";
import fileType from "file-type";
import validator from "validator";

import { Subscription } from "rxjs/subscription";
import { serviceManager } from "../services.manager";
import { WebToken} from "./token.service";

const uuidv1 = require("uuid/v1");

const join = Promise.join;
Promise.promisifyAll(fs);
Promise.promisifyAll(fileType);

import {errorController} from "../../controllers";

/***
 * Import Actions
 */
import {
	CREATE_WEBTOKEN
} from "../../controllers/actions";

import { 
	IUser, IClient, ICustomer, IGoogleUser, ILoginRequest, IDatabasePriority, IRawThumbnail, ILoginTracker, IUserApplication, IEncryption, IFindUser, IDeleteUser, IChangePassword
} from "../../shared/interfaces";

import { 
	TUSER, TCLIENT, TCUSTOMER,TI_RAW_THUMBNAIL
} from "../../shared/types";

import { UserOperations } from "./user.ops.service";

import { 
	userModel
} from "../../shared/models";

import { 
	FormValidation, deepCloneObject, cloneArray, capitalizeString, createUserSubDirectories, constructUserCredentials,
	constructProfileFullName,constructProfileSortName, createPublicUserDirectory, isEmail, isURL,
	pathToDefaultUserThumbnail, pathToUserThumbnail, storeUserImage, validateInfrastructure, validateUserIntegrity	
} from "../../util";

/*****
 * Provider functions
 */
import {	
	updateUserForAuthenticationProvider
} from "../../util";

import {		
	LOCAL_AUTH_CONFIG,
	PERSON_SUBTYPE_USER
} from "../../util/secrets";

interface IModelSetting {
	model:any,
	type: string,
	collection:string
}

interface IFileType {
	ext: string,
	mime: string
}

interface IAUserDirectory {
	dirCreated?: boolean, 
	err?:any
}

interface IAUserCreated {
	userCreated?:boolean,
	result?:any,
	err?: any
}

interface IUserActions {
	imgResult?: IRawThumbnail,
	dirResult?: IAUserDirectory,
	insertResult?: IAUserCreated
}


export class UserService extends UserOperations {

	
	private gmail:string;		
	private serializedUser:string;

	constructor() {
		super();		
	}	
	
	/***
	 * Find third party authenticated user by email
	 */
	private findUserByEmail() {		
		let query = { 'core.email': this.gmail };		
		return userModel.remoteFindOneOnly(query, 'users')	
		.then(  (user:IUser) => { return Promise.resolve(user); })
		.catch( (err:Error)    => { return Promise.reject(err); })	
	}		

	private getDefaultThumbnail():IRawThumbnail {
		let rawThumbnail:IRawThumbnail = deepCloneObject(TI_RAW_THUMBNAIL);
    	return rawThumbnail;   	
	}		

	private validateApplicationForm(form:IUserApplication) {	

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
			if(form.confirmPassword) form.confirmPassword = form.password;
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

	private userProfile(user:any, form:IUserApplication, encrypt:IEncryption) {

		if(user) {
			return Promise.resolve(user);
		}

		let newUser:IUser = deepCloneObject(TUSER);
		const userRole:number=5;

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
		if(user.core.role != 5 || user.security.accountType != 5) {
			return Promise.resolve(user);
		} else {
			return Promise.reject("<errorNumber>");
		}
	}	
	

	/****
	 * 
	 */
	public registerUser(form:IUserApplication) {	

		console.log("*** (1) Register User")

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

		.then( ({user, encrypt}:any) => this.userProfile(user, form, encrypt) )

		// process thick: build user object
		.then( (user:IUser|IClient|ICustomer) => this.newUser(user) )		

		/*** 
		 * process thick: create webtoken
		 */
		.then( (user:IUser|IClient|ICustomer) => WebToken.createWebToken( user.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:any) => {		
			let errorID:number;
			if(!Number.isInteger(err)) { errorID=11000;} else {errorID=err; }
			errorController.log(errorID, err);
			return Promise.reject({errorID, message: errorController.getMessage(errorID)});
		});	
	}

	/***
	 * Login User
	 */
	public loginUser(login:ILoginRequest) {	

		// process thick: validate email
		return this.testUserEmail(login.email)

		// process thick:
		.then( () => this.testPassword(login.password) )

		// process thick: test for account
		.then( () => this.testForAccountType(login.email))

		// process thick: validate password
		.then( (user:IUser) => this.validateUserPassword(user, login.password) )	

		// process thick: create login
		.then( (user:IUser) => {

			let login:ILoginTracker = this.authenticationTracker();
			let logins:ILoginTracker[] = this.updateLoginsArray(user, login);
		
			return Promise.resolve({user, logins});
		})

		// process thick: update user object
		.then( ({user, logins}:any) => {		
			return this.updateUser(
				{ 'core.email': login.email },
				{ $set: 
					{'logins': logins}
				},
				PERSON_SUBTYPE_USER
			);			
		})

		// process thick: create authenticatoin token
		.then( (user:IUser) =>  WebToken.createWebToken( user.accounts) )

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:any) => {		
			let errorID:number;
			if(!Number.isInteger(err)) { errorID=11000;} else {errorID=err; }
			errorController.log(errorID, err);
			return Promise.reject({errorID, message: errorController.getMessage(errorID)});
		});	
	}	

	/***
	 * Find user by ID
	 * @email:string
	 * @url:string
	 * @identifier: uuid-string
	 */
	public findSingleUser(request:IFindUser) {

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

		return userModel.findOne({ [field]:[ID]})
		.then( (user:IUser) => {
			delete user._id;
			return Promise.resolve( user ) 
		})
		.catch( (err:Error) => Promise.reject(err));
	}

	/***
	 * Delete user By ID: request props
	 * @emal:string
	 * @url:string
	 * @identifier:string
	 */
	public deleteSingleUser(request:IDeleteUser) {

		return this.deleteUser('user', request)
		.then( () => Promise.resolve())
		.catch( (err:any) => {		
			let errorID:number;
			if(!Number.isInteger(err)) { errorID=11000;} else {errorID=err; }
			errorController.log(errorID, err);
			return Promise.reject({errorID, message: errorController.getMessage(errorID)});
		});	
	}

	/***
	 *
	 */
	public changePasswordUser(request:IChangePassword) {

		return this.changePassword('user', request)
		.then( () => Promise.resolve())
		.catch( (err:any) => {		
			let errorID:number;
			if(!Number.isInteger(err)) { errorID=11000;} else {errorID=err; }
			errorController.log(errorID, err);
			return Promise.reject({errorID, message: errorController.getMessage(errorID)});
		});	
	}
}

/****
 * Public Interface for User Actions Controller
 */
class ActionService {	

	public registerUser( application:IUserApplication ) {
		let instance:any = new UserService();
		return instance.registerUser(application)
			.then( (user:IUser) => Promise.resolve(user) )
			.catch( (err:Error) => Promise.reject(err) );
	}

	public loginUser( login:ILoginRequest ) {
		let instance:any = new UserService();
		return instance.loginUser(login)
			.then( (token:string) => Promise.resolve(token) )
			.catch( (err:Error) => Promise.reject(err) );
	}

	public findSingleUser( find:IFindUser ) {
		let instance:any = new UserService();
		return instance.findSingleUser(find)
			.then( (user:IUser) => Promise.resolve(user) )
			.catch( (err:Error) => Promise.reject(err) );
	}

	public deleteSingleUser( request:IDeleteUser ) {
		let instance:any = new UserService();
		return instance.deleteSingleUser(request)
			.then( () => Promise.resolve() )
			.catch( (err:Error) => Promise.reject(err) );
	}

	public changePasswordUser(request:IChangePassword) {		
		let instance:any = new UserService();
		return instance.changePasswordUser(request)
			.then( () => Promise.resolve() )
			.catch( (err:Error) => Promise.reject(err) );
	}
}

export const userService:any = new ActionService();











