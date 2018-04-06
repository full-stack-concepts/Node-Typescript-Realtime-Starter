import path from "path";
import Promise from "bluebird";
import axios from "../util/axios";

import { IUser, IGoogleUser} from "../shared/interfaces";
import { TUSER } from "../shared/types";
import { UserModel } from "../shared/models"
import { deepCloneObject, capitalizeString } from "../util";
import { constructUserCredentials } from "./user.util";


class UserService {

	private user:IUser;
	private newUser:IUser;
	private gmail:string;

	constructor() {}	

	private grabEmailFromGoogleProfile(data:any):Promise<void> {
		this.gmail = data.profile.emails[0].value;
		return Promise.resolve();
	}

	/***
	 * Find third party authenticated user by email
	 */
	private findUserByEmail():Promise<void> {		
		let query = { 'core.email': this.gmail };
		return UserModel.remoteFindOneOnly(query, 'users')	
		.then(  (user:IUser) => { 
			this.user = user;
			Promise.resolve(); 
		})
		.catch( (err:any)    => { Promise.reject(err); })	
	}

	private createProfileFromGoogleData(data:IGoogleUser):Promise<IUser> {

		let newUser:IUser = deepCloneObject(TUSER),
			p:any = deepCloneObject(data.profile),
			errType:number;

		/****
		 * Test if google user is a person and not a business
		 */
		if( p._json 
			&& p._json.objectType 
			&& p._json.objectType.length 
			&& typeof p._json.objectType === 'string'
		) {
			newUser.security.accountType = 1;
		} else {
			errType = 1110; // user has to a natural person
		}		

		/****
		 * Test for rhumbnail or image
		 */
  		if (p.photos && p.photos.length) {
    		newUser.profile.images.thumbnail = p.photos[0].value;
    		newUser.userConfiguration.isThumbnailSet = true;
  		}

  		/****
  		 * Test for public googleID
  		 */
  		if(p.id && typeof p.id === 'string') {
  			newUser.accounts.googleID = p.id;
  		} else {
  			errType =  1111; // no public gogole ID was provided
  		}

  		/****
  		 * test for given and family name
  		 * email address  	
  		 */
  		if(p.name) {
  			newUser.profile.personalia.firstName = capitalizeString(p.name.givenName) || "";
  			newUser.profile.personalia.lastName = capitalizeString(p.name.familyName) || "";  			
  		} else {
  			errType = 1112; // user remains nameless
  		}  		
  		if(p.emails && p.emails.length) {
  			newUser.core.email = p.emails[0].value;
  		} else {
  			errType = 1113; // no email account was provided
  		}  	

  		/****  	
  		 * gender
  		 */	
  		if(p._json && p._json.gender && typeof p._json.gender === 'string') {
  			if(p._json.gender === 'male') { newUser.profile.gender = 1; } 
  			else if(p._json.gender === 'female') { newUser.profile.gender = 2; } 
  			else { newUser.profile.gender = 0; }
  		} else {
  			newUser.profile.gender = 0;
  		}

  		/****
  		 * Google Plus user
  		 */
  		if(p._json && p._json.url && p._json.url.length && typeof p._json.url === 'string') {
  			newUser.profile.social.googleplus = p._json.url;
  		}  		

  		/****
  		 * Verified Google Account
  		 */
  		if(p._json && p._json.verified && p._json.verified.length && typeof p._json.verified === 'boolean' ) {
  			newUser.security.isAccountVerified = p._json.verified;
  		}

		return new Promise( (resolve, reject) => {
			this.newUser = newUser;
			(errType) ? reject(errType): resolve();		
		});
	}

	private formatProfileFromGoogleData(data:IGoogleUser):Promise<void> {

		let p:any = deepCloneObject(this.newUser.profile.personalia);

		/** format display names */ 
		this.newUser.profile.displayNames.fullName = `${p.firstName} ${p.lastName}`;
		this.newUser.profile.displayNames.sortName = `${p.firstName} ${p.lastName}`;

		/** user credentials: userName && url */
		constructUserCredentials( this.newUser, (credentials:any) => {
			this.newUser.core.userName = credentials.userName;
			this.newUser.core.url = credentials.url;
		});		

		/** set default user role: 3 orwhatever you like */
		this.newUser.core.role = 3;	
		
		return Promise.resolve();
	}

	private createNewUser():Promise<void> {

		return UserModel.remoteCreateUser( this.newUser)
		.then( user => {			
			console.log(user)
			/*
			#todo: proceed with chain to invoke creation of webtoken
			this.currentUser = user;
			return Promise.resolve( user ) 
			*/
		})
		.catch( (err) => {
			return Promise.reject(err);
		});	

	}

	public authenticateGoogleUser(data:IGoogleUser, done:Function) {

		// process thick: test for email address
		this.grabEmailFromGoogleProfile(data)

		// process thick: test for user
		.then( () => this.findUserByEmail() )

		// process thick: eval user
		.then( () => {
			if(this.user) return done({err:null, user: this.user}); 
			if(!this.user) return this.createNewUser();
		})

		// process thick: create user profile
		this.createProfileFromGoogleData(data)

		// preocess thick: format profile
		.then( () => this.formatProfileFromGoogleData(data) )

		return done({
			test: "google-user"
		});
	}
}


export const u:any = {

	test(data:any, done:Function) {
		let instance:any = new UserService();
		instance.test( data, (result:any) => { return done(result); });	
	},

	authenticateGoogleUser(data:IGoogleUser, done:Function) {
		console.log("==> authenticate google user")
		let instance:any = new UserService();
		instance.authenticateGoogleUser( data, (result:any) => { return done(result); });	
	}


}

