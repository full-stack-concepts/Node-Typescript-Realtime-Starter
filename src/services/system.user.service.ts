// #TODO: select fucntions to move to super class as protected functions

import Promise from "bluebird";

import { UserOperations } from "./user.ops.service";
import { proxyService } from "./proxy.service";
import { SystemUserModel } from "../shared/models";
import { IUser, ISystemUser} from "../shared/interfaces";
import { TSYSTEMUSER } from "../shared/types";

import  {
	SET_SYSTEM_ADMIN_ACCOUNT,
	SYSTEM_ADMIN_FIRST_NAME,
	SYSTEM_ADMIN_LAST_NAME,
	SYSTEM_ADMIN_EMAIL,
	SYSTEM_ADMIN_PASSWORD,
	PERSON_SUBTYPE_SYSTEM_USER
} from "../util/secrets";

import {
	encryptPassword,
	FormValidation
} from "../util";

export class SystemUserService extends UserOperations {

	private systemUser:ISystemUser;
	private password:string=SYSTEM_ADMIN_PASSWORD;
	private userEmail:string=SYSTEM_ADMIN_EMAIL;
	private firstName:string = SYSTEM_ADMIN_FIRST_NAME;
	private lastName:string = SYSTEM_ADMIN_LAST_NAME;

	private proxyService:any = proxyService;

	constructor() {		
		super();
		this.configureSubscribers();
	}

	private configureSubscribers():void {

		/****
		 *
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

		// process thick: create user
		.then( (u:ISystemUser) => this.createUser(PERSON_SUBTYPE_SYSTEM_USER, u) )

		// catch error
		.catch( (err:any) => Promise.reject(err) );

	}

	private setDefaultPriviliges(u:ISystemUser):ISystemUser{

		/***
		 * DB Management Roles
		 */
		u.manageOpRole = true,
		u.mongostatRole = true,
		u.dropSystemViewsAnyDatabase = true;

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
		u.priviliges.users.create = true;
		u.priviliges.users.read = true;
		u.priviliges.users.update = true;
		u.priviliges.users.delete = true;

		/***
		 * Collection roles: clients
		 */
		u.priviliges.clients.create = true;
		u.priviliges.clients.read = true;
		u.priviliges.clients.update = true;
		u.priviliges.clients.delete = true;


		/***
		 * Collection roles: customers
		 */
		u.priviliges.customers.create = true;
		u.priviliges.customers.read = true;
		u.priviliges.customers.update = true;
		u.priviliges.customers.delete = true;

		return u;
	}
		

	/***
	 * Create SystemUser From fron enviromental settings file (.env or .prod)
	 */
	private createSystemUser() {
	
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