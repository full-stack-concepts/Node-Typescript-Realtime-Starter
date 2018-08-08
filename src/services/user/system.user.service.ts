// #TODO: select fucntions to move to super class as protected functions

import Promise from "bluebird";
import { Observable} from "rxjs/Observable";
import { Subscription} from "rxjs/Subscription";
const uuidv1 = require("uuid/v1");


import { UserOperations } from "./user.ops.service";
import { systemUserReadModel, SystemUserModel } from "../../shared/models";
import { IUser, ISystemUser, IRawThumbnail, IEncryption, ILoginRequest, ILoginTracker } from "../../shared/interfaces";
import { TSYSTEMUSER } from "../../shared/types";

/***
 * Services
 */
import { proxyService } from "../state/proxy.service";
import { WebToken } from "./token.service";

/***
 * Loggers
 */
import { errorController } from "../../controllers";

import  {
	SET_SYSTEM_ADMIN_ACCOUNT,
	SYSTEM_ADMIN_FIRST_NAME,
	SYSTEM_ADMIN_LAST_NAME,
	SYSTEM_ADMIN_EMAIL,
	SYSTEM_ADMIN_PASSWORD	
} from "../../util/secrets";

/****
 * Import Environmental settings for user Sub Types
 */
import {
	USE_PERSON_SUBTYPE_USER,
	USE_PERSON_SUBTYPE_CLIENT,
	USE_PERSON_SUBTYPE_CUSTOMER,
	PERSON_SUBTYPE_SYSTEM_USER
} from "../../util/secrets";

import {
	cloneArray,	
	FormValidation,
	createPrivateUserDirectory,
	storeUserImage,
	capitalizeString,
	constructProfileFullName,
	constructProfileSortName,
	constructUserCredentials
} from "../../util";


export class SystemUserService extends UserOperations {

	private systemUser:ISystemUser;
	private password:string=SYSTEM_ADMIN_PASSWORD;
	private userEmail:string= SYSTEM_ADMIN_EMAIL;
	private firstName:string = SYSTEM_ADMIN_FIRST_NAME;
	private lastName:string = SYSTEM_ADMIN_LAST_NAME;	

	/***
	 * Ops state
	 */
	private live:boolean=false;

	/***
	 * Services
	 */
	private proxyService:any = proxyService;

	/***
	 * id of new system user
	 */
	private userID:string;

	constructor() {		
		super();
		this.configureSubscribers();
	}

	private configureSubscribers():void {

		/****
		 * Subscriber: Bootstrap Manager signals system user
		 */
		proxyService.systemUser$.subscribe( (state:boolean) => {
			return this.createSystemUser() 
			.then( () => Promise.resolve() );
		});		

		/****
		 * Subscriber: wait until Bootstrap Signals UserDB is live
		 */
		proxyService.userDBLive$.subscribe( (state:boolean) => this.live = state );	
	}	

	/***
	 * User Core && Security settings
	 */		
	private configureDefaultUserProfile(
		u:any, 
		firstName:string,
		middleName:string,
		lastName:string,
		email:string,
		hash:string,
		method:number,
		userRole:number
	) {	

		const form:any = {
			firstName:firstName,
			middleName:middleName,
			lastName:lastName,
			email:email.toLowerCase(),
		}

		let err:Error;
		return new Promise( (resolve, reject) => {
			try {			

				let encrypt:IEncryption = { method, hash};

				// Profile Core Identifiers		
				u = this.setCoreIdentifiers(u, form, userRole);

				// Profile Security And Account
				u = this.setSecurity(u, form, userRole, encrypt, true);

				// Profile Thumbnnail
				u = this.setExternalThumbnail(u, false);		

				// Profile Personalia
				u = this.setPersonalia(u, form);

				// Profile display names 	
				u = this.setDisplayNames(u, form);

				// user credentials: userName && url 
				u = this.setCredentials(u);	   
			}
			catch(e) { err = e; }
			finally { if(err) {reject({errorID:12010,err});} else { resolve(u); } }		

		});		
	}		

	private insertDefaultSystemUser(){

		const u:ISystemUser = TSYSTEMUSER;

		return Promise.resolve(u)	

		// process thick: encrypt password
		.then( (u:any) => this.encryptPassword(u, this.password) )

		// process thick: set core and security features
		.then( ( {user, encrypt}:any) => this.configureDefaultUserProfile(

				// default user object
				user, 

				// furstname
				this.firstName, 

				// middle name
				"", 

				// last name
				this.lastName, 

				// primary email address
				this.userEmail, 
				
				// encrypted password
				encrypt.hash, 
				
				// encryption method
				encrypt.method, 
				
				// assigned user role
				1
			)
		)	

		// process thick: set default priviliges for System Admin Account
		.then( (u:ISystemUser) => this.setDefaultPriviliges(u) )	

		// process thick: insert userinto DB
		.then( (u:ISystemUser) => this.insertUser(PERSON_SUBTYPE_SYSTEM_USER, u) )

		// process thick: create user directory && fetch user image
		.then( (u:ISystemUser) => {
		
			// set user ID for further processing		
			this.userID = u._id;		

			return Promise.join<any>(

				/***
				 * User Thumbnail Image
				 */
				this.fetchUserImage(u),

				/***
				 * User Directory
				 */
				createPrivateUserDirectory (u.core.userName)

			).spread ( (thumbnail:IRawThumbnail, userDirectory:any) => Promise.resolve({user:u, thumbnail:thumbnail}) )
		})		

		// process thick: eval thumbnail object
		.then( (settings:any) => this.evalThumbnailObjectThenSetPath(settings))

		// proces thick: store user image
		.then( ({ user, thumbnail}:any) => storeUserImage( thumbnail, user.core.userName) )	

		// process thick: return to caller
		.then( (res:any) => Promise.resolve() )

		// catch error
		.catch( (err:Error) => Promise.reject(err) );
	}	

	// #TODO: split this function per subtype
	private setDefaultPriviliges(u:ISystemUser):ISystemUser{			

		/***
		 * Collection roles: System users
		 */		
		u.priviliges.systemUsers.create = true;
		u.priviliges.systemUsers.read = true;
		u.priviliges.systemUsers.update = true;
		u.priviliges.systemUsers.delete = true;		

		/***
		 * Collection roles: users
		 */		
		if(USE_PERSON_SUBTYPE_USER) {
			u.priviliges.users.create = true;
			u.priviliges.users.read = true;
			u.priviliges.users.update = true;
			u.priviliges.users.delete = true;

		/***
		 * Delete users object
		 */
		} else {
			delete u.priviliges.users;
		}

		/***
		 * Collection roles: clients
		 */		
		if(USE_PERSON_SUBTYPE_CLIENT) {
			u.priviliges.clients.create = true;
			u.priviliges.clients.read = true;
			u.priviliges.clients.update = true;
			u.priviliges.clients.delete = true;
		
		/***
		 * Delete clients object
		 */
		} else {
			delete u.priviliges.clients;
		}

		/***
		 * Collection roles: customers
		 */		
		if(USE_PERSON_SUBTYPE_CUSTOMER) {
			u.priviliges.customers.create = true;
			u.priviliges.customers.read = true;
			u.priviliges.customers.update = true;
			u.priviliges.customers.delete = true;
		
		/***
		 * Delete users object
		 */
		} else {
			delete u.priviliges.customers;
		}			

		return u;
	}	

	private waitUntilLive() {
		return new Promise ( (resolve, reject) => {			
			const source$:Observable<number> = Observable.interval(35).take(100);
			const sub$:Subscription = source$.subscribe(		
				x => { if(this.live) { sub$.unsubscribe(); resolve(); } }
			);
		});
	}		

	/***
	 * Create SystemUser From fron enviromental settings file (.env or .prod)
	 */
	public createSystemUser() {
	
		/***
		 * Return if this operation is not required
		 */
		if(!SET_SYSTEM_ADMIN_ACCOUNT) return Promise.resolve();			

		// process thick: wait until DB Users is Live
		return this.waitUntilLive()

		// process thick: 
		.then( () => {
			return Promise.join<any>(
				this.testUserEmail(this.userEmail),
				this.testPassword(this.password),
				this.testFirstName({ 
					value: this.firstName,
					required:true,
					minLength:null,
					maxLength:20
				}),
				this.testLastName({
					value:this.lastName,
					required:true,
					minLength:null,
					maxLength:50
				})			

			// process thick: test for user
			).spread( (
				isEmail:boolean, 
				isPassword:boolean, 
				hasFirstName:boolean, 
				hasLastName:boolean
			) => { 							
				return this.findUserByEmail( PERSON_SUBTYPE_SYSTEM_USER, this.userEmail); 
			})		
		})

		// process thick: return to caller with user or create new system user		
		.then( (u:any) => {				
			if(u) {			
				return Promise.resolve(u);
			} else {
				return this.insertDefaultSystemUser();
			}
		})		

		// process thick: return to caller and log event
		.then( (user:ISystemUser) => {

			// log event Express Controller ready			
			return Promise.resolve(user) 
		}) 		
		
		/***
		 * Critical error: call process exit
		 */		
		.catch( ({errorID, err}:any) => {		

			console.error("*** Criticial error: Sytem User from environmental settings file could not be generated. Please select your settings.");
			console.error("*** Crititical error: ", errorID, err );	
			if(!errorID) errorID= 12000;		
			errorController.log(errorID, err);
			process.exit(1);
		});		
	}

	public loginSystemUser(login:ILoginRequest) {

		// process thick: validate email
		return this.testUserEmail(login.email)

		// process thick:
		.then( () => this.testPassword(login.password))

		// process thick: test for account
		.then( () => this.findUserByEmail( PERSON_SUBTYPE_SYSTEM_USER, login.email) )

		// process thick: validate password
		.then( (user:ISystemUser) => this.validateUserPassword(user, login.password) )

		// process thick: add login
		.then( (user:ISystemUser) => {

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
				PERSON_SUBTYPE_SYSTEM_USER
			);			
		})

		// process thick: create authenticatoin token
		.then( (user:ISystemUser) =>  WebToken.createWebToken( user.accounts) )

		// process thick: return to caller so webtoken can be created
		.then( ( token:string) => Promise.resolve(token) ) 

		.catch( (err:Error) => Promise.reject(err) );	
	}
}

/****
 * Public Interface for User Actions Controller
 */
class ActionService {

	public loginSystemUser( login:ILoginRequest ) {
		let instance:any = new SystemUserService();
		return instance.loginSystemUser(login)
			.then( (token:string) => Promise.resolve(token) )
			.catch( (err:Error) => Promise.reject(err) );
	}

}

export const systemUserService:any = new ActionService();

/****
 * Export for Bootstrap Controller
 */
export const createSystemUser = () => {
	const instance:any = new SystemUserService();
	return instance.createSystemUser()
	.then( () => Promise.resolve() );	
}