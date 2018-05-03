// #TODO: select fucntions to move to super class as protected functions

import Promise from "bluebird";
import mongoose from "mongoose";

import { UserOperations } from "./user.ops.service";
import { SystemUserModel } from "../shared/models";
import { IUser, ISystemUser, IRawThumbnail } from "../shared/interfaces";
import { TSYSTEMUSER } from "../shared/types";

/***
 * Services
 */
import { proxyService } from "./proxy.service";
import { serviceManager } from "../services";


import  {
	SET_SYSTEM_ADMIN_ACCOUNT,
	SYSTEM_ADMIN_FIRST_NAME,
	SYSTEM_ADMIN_LAST_NAME,
	SYSTEM_ADMIN_EMAIL,
	SYSTEM_ADMIN_PASSWORD,
	PERSON_SUBTYPE_SYSTEM_USER
} from "../util/secrets";

/****
 * Import Environmental settings for user Sub Types
 */
import {
	USE_PERSON_SUBTYPE_USER,
	USE_PERSON_SUBTYPE_CLIENT,
	USE_PERSON_SUBTYPE_CUSTOMER
} from "../util/secrets";

import {
	encryptPassword,
	FormValidation,
	createPrivateUserDirectory,
	storeUserImage
} from "../util";

export class SystemUserService extends UserOperations {

	private systemUser:ISystemUser;
	private password:string=SYSTEM_ADMIN_PASSWORD;
	private userEmail:string=SYSTEM_ADMIN_EMAIL;
	private firstName:string = SYSTEM_ADMIN_FIRST_NAME;
	private lastName:string = SYSTEM_ADMIN_LAST_NAME;

	/***
	 * Services
	 */
	private proxyService:any = proxyService;

	/***
	 * id of new system user
	 */
	private userID:mongoose.Types.ObjectId;

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
	}		

	private insertDefaultSystemUser(){

		const u:ISystemUser = TSYSTEMUSER;

		// process thick: encrypt password
		return this.encryptPassword(this.password)

		// process thick: set core and security features
		.then( (hash:string) => this.configureDefaultUserProfile(u, this.firstName, "", this.lastName, this.userEmail, hash, 1))

		// process thick: set default priviliges for System Admin Account
		.then( (u:ISystemUser) => this.setDefaultPriviliges(u) )	

		// process thick: insert userinto DB
		.then( (u:ISystemUser) => this.insertUser(PERSON_SUBTYPE_SYSTEM_USER, u) )

		// process thick: create user directory && fetch user image
		.then( (u:ISystemUser) => {

			console.log(u);
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
		.then( ({ user, thumbnail}) => storeUserImage( thumbnail, user.core.userName) )

		// process thick: create db user => forward ID 
		.then( () => this.proxyService.dbUser$.next(this.userID) )

		// process thick: return to caller
		.then( (res) => Promise.resolve() )

		// catch error
		.catch( (err:any) => Promise.reject(err) );
	}	

	// #TODO: split this function per subtype
	private setDefaultPriviliges(u:ISystemUser):ISystemUser{	

		/***
		 * DB Management Roles
		 */	
		u.priviliges.manageOpRole = true,
		u.priviliges.mongostatRole = true,
		u.priviliges.dropSystemViewsAnyDatabase = true;		

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
		

	/***
	 * Create SystemUser From fron enviromental settings file (.env or .prod)
	 */
	private createSystemUser() {

		console.log("*** Create System User")
	
		/***
		 * Return if this operation is not required
		 */
		if(!SET_SYSTEM_ADMIN_ACCOUNT) return Promise.resolve();			

		// process thick: test data
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
			return this.findUser( PERSON_SUBTYPE_SYSTEM_USER, this.userEmail); 
		})		

		// process thick: return to caller with user or create new system user
		
		.then( (u:any) => {				
			if(u) {
				return Promise.resolve(u);
			} else {
				return this.insertDefaultSystemUser();
			}
		})
		

		// process thick: return to caller
		.then( (user:ISystemUser) => Promise.resolve(user) ) 		
		
		/***
		 * Critical error: call process exit
		 */
		.catch( (err:any) => {
			console.error("*** Criticial error: Sytem User from environmental settings file could not be generated. Please select your settings.");
			console.error("*** Crititical error: ", err );			
			process.exit(1);
		});
	}

}