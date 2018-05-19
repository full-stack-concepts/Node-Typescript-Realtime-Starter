import Promise from "bluebird";
import { WebToken } from "./token.service";

const uuidv1 = require("uuid/v1");

/***
 * Import Actions
 */
import {
	CREATE_WEBTOKEN
} from "../../controllers/actions";

import { 
	deepCloneObject, isURL, isEmail, capitalizeString, 
	constructProfileFullName, constructProfileSortName, constructUserCredentials
} from "../../util";

import { UserOperations } from "./user.ops.service";
import { IUser, IClient, ICustomer} from "../../shared/interfaces";
import { TUSER } from "../../shared/types";

export class FaceBookUserService extends UserOperations {	

	constructor() {
		super();		
	}	

	/*****
	 * Facebook functions
	 */
	private grabEmailFromFacebookProfile (fProfile:any):Promise<string | number> {	
		let email:string = fProfile.emails[0].value;		
		if(email && isEmail(email) ) {
			return Promise.resolve(email)
		} else {
			return Promise.reject('<errorNumber1>');			
		}	
	}	

	private extractFacebookProfile(profile:any) {		

		let newUser:IUser = deepCloneObject(TUSER),
			p:any = deepCloneObject(profile),
			errType:number;		

		/****
		 * Test if FB Profile contains essential params
		 */
		if( !p.hasOwnProperty('id') || (p.id && typeof p.id != 'string') 
			|| (!p.profileUrl || (p.profileUrl && !isURL(p.profileUrl) ) )

		// invalid FB Profile
		) {
			errType = 1040; 

		} else {

			// create 'personal' identifier, a UUID timestamp
			newUser.core.identifier = uuidv1();

			// configure security and account Type
			newUser.security.accountType = 5;			
			newUser.security.isAccountVerified = true;
			newUser.core.role = 5;

			// update user configuration
			newUser.configuration.isFacebookUser = true;
			newUser.profile.social.facebook = p.profileUrl;

			// set public facebook ID
			newUser.accounts.facebookID = p.id;

			// set raw profile
			newUser.profileRaw = p._raw;

			/***
		  	 * Set user password
			 */
			 newUser.password.value = "";
			 newUser.security.isPasswordEncrypted = false; 
		}	

		/****
		 * Test for thumbnail or image  
		 */
			if (p.photos && p.photos.length) {
			newUser.profile.images.externalThumbnailUrl = p.photos[0].value;    	
			newUser.configuration.hasExternalThumbnailUrl = true;
			}

			/****
			 * test for given and family name 
			 */
			if(p.name) {

				// given name
				if( p.name.hasOwnProperty('givenName')) 
					newUser.profile.personalia.givenName = capitalizeString(p.name.givenName) || "";
				
				// middle name
				if( p.name.hasOwnProperty('middleName')) 
				newUser.profile.personalia.middleName = capitalizeString(p.name.middleName) || "";  		
			
			// family Name
			if( p.name.hasOwnProperty('familyName'))
					newUser.profile.personalia.familyName = capitalizeString(p.name.familyName) || "";  		

			} else {
				errType = 1042; // invalid name object
			} 

			/****
			 * Test for email address
			 */
			if(p.emails && p.emails.length) {
				newUser.core.email = p.emails[0].value;
			} else {
				errType = 1043; // no email account was provided
			}  	

			/****  	
			 * gender
			 */	
			newUser.profile.gender = 0;

		/****
		 * format display names 
		 */ 	
		newUser.profile.displayNames.fullName = constructProfileFullName(p.name);
		newUser.profile.displayNames.sortName = constructProfileSortName(p.name);
		
		/****
		 * user credentials: userName && url 
		 */
		constructUserCredentials( newUser, (credentials:any) => {
			newUser.core.userName = credentials.userName;
			newUser.core.url = credentials.url;  
		});	

		return new Promise( (resolve, reject) => {						
			(errType) ? reject(errType): resolve(newUser);		
		});	
	}

	public authenticateFacebookUser(token:string, fProfile:any) {

		/**** 
		 * process thick: test for DB Hosts
		 */
		this.testForDatabaseHosts();	

		/****
		 * process thick: grab email from facebook profile
		 * => use this to find sub suer item
		 */		
		return this.grabEmailFromFacebookProfile(fProfile)

		/****
		 * process thick: test for account type
		 * => as we have defined multiple person types
		 * ( by default person, user, client, customer)
		 * we want to identify the account type and grab the user
		 */
		.then( ( email:string ) => this.testForAccountType( email) )

		// process thick: create new user or return 
		.then( (person:IUser|IClient|ICustomer|undefined) => {		
			if(!person) {							
				// process thick: build user object
				return this.extractFacebookProfile(fProfile)
				// process thick: build user object
				.then( (user:IUser) => this.newUser(user) );  
			} else {			
				return this.validateUser( fProfile, person );		 	
			}
		})

		/**** 
		 * process thick: create webtoken
		 */
		.then( (user:IUser|IClient|ICustomer) =>  this.uaController[CREATE_WEBTOKEN]( user.accounts) )	

		// process thick: return to caller so webtoken can be created
		.then( (token:string) => Promise.resolve({token}) )

		.catch( (err:any) => {		
			Promise.reject(err);
		});	
	}
}

export const facebookUserService:any = new FaceBookUserService();