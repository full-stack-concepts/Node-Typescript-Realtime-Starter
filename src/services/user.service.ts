import path from "path";
import Promise from "bluebird";
import axios from "../util/axios";

import { IUser, IGoogleUser} from "../shared/interfaces";
import { TUSER } from "../shared/types";
import { deepCloneObject, capitalizeString } from "../util";
import { constructUserCredentials } from "./user.util";


class UserService {

	private user:IUser;
	private gmail:string;

	constructor() {}

	public test(data:any, done:any) {	

		return done({
			test: "geslaagd"
		});
	}

	private grabEmailFromGoogleProfile(data:any):Promise<void> {
		this.gmail = data.profile.emails[0].value;
		return Promise.resolve();
	}

	private findUserByEmail():Promise<void> {

		/*
		return User.remoteFindOneOnly(this.queryForID)
		.then(  user  => { return Promise.resolve(user); })
		.catch( (err, user) => {		
			return Promise.reject(err);
		})
		*/
		return Promise.resolve();

	}

	private createProfileFromGoogleData(data:IGoogleUser):Promise<IUser> {

		let user:IUser = deepCloneObject(TUSER),
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
			user.security.accountType = 1;
		} else {
			errType = 1110; // user has to a natural person
		}		

		/****
		 * Test for rhumbnail or image
		 */
  		if (p.photos && p.photos.length) {
    		user.profile.images.thumbnail = p.photos[0].value;
    		user.userConfiguration.isThumbnailSet = true;
  		}

  		/****
  		 * Test for public googleID
  		 */
  		if(p.id && typeof p.id === 'string') {
  			user.accounts.googleID = p.id;
  		} else {
  			errType =  1111; // no public gogole ID was provided
  		}

  		/****
  		 * test for given and family name
  		 * email address  	
  		 */
  		if(p.name) {
  			user.profile.personalia.firstName = capitalizeString(p.name.givenName) || "";
  			user.profile.personalia.lastName = capitalizeString(p.name.familyName) || "";  			
  		} else {
  			errType = 1112; // user remains nameless
  		}  		
  		if(p.emails && p.emails.length) {
  			user.core.email = p.emails[0].value;
  		} else {
  			errType = 1113; // no email account was provided
  		}  	

  		/****  	
  		 * gender
  		 */	
  		if(p._json && p._json.gender && typeof p._json.gender === 'string') {
  			if(p._json.gender === 'male') { user.profile.gender = 1; } 
  			else if(p._json.gender === 'female') { user.profile.gender = 2; } 
  			else { user.profile.gender = 0; }
  		} else {
  			user.profile.gender = 0;
  		}

  		/****
  		 * Google Plus user
  		 */
  		if(p._json && p._json.url && p._json.url.length && typeof p._json.url === 'string') {
  			user.profile.social.googleplus = p._json.url;
  		}  		

  		/****
  		 * Verified Google Account
  		 */
  		if(p._json && p._json.verified && p._json.verified.length && typeof p._json.verified === 'boolean' ) {
  			user.security.isAccountVerified = p._json.verified;
  		}

		console.log(user)		
		return new Promise( (resolve, reject) => {
			this.user = user;
			(errType) ? reject(errType): resolve();		
		});
	}

	private formatProfileFromGoogleData(data:IGoogleUser):Promise<IUser> {

		let p:any = deepCloneObject(this.user.profile.personalia);

		/** format display names */ 
		this.user.profile.displayNames.fullName = `${p.firstName} ${p.lastName}`;
		this.user.profile.displayNames.sortName = `${p.firstName} ${p.lastName}`;

		/** user credentials: userName && url */
		constructUserCredentials( this.user, (credentials:any) => {
			this.user.core.userName = credentials.userName;
			this.user.core.url = credentials.url;
		});		

		/** set default user role: 3 orwhatever you like */
		this.user.core.role = 3;	

		console.log(this.user)		
		return new Promise( (resolve, reject) => {
			resolve();		
		});	
	}

	public authenticateGoogleUser(data:IGoogleUser, done:Function) {

		// process thick: test for email address
		this.grabEmailFromGoogleProfile(data)

		// process thick: test for user
		this.findUserByEmail()

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

