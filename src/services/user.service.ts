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
	private findUserByEmail():Promise<IUser> {		
		let query = { 'core.email': this.gmail };		
		return UserModel.remoteFindOneOnly(query, 'users')	
		.then(  (user:IUser) => { return Promise.resolve(user); })
		.catch( (err:any)    => { return Promise.reject(err); })	
	}

	private createProfileFromGoogleData(profile:any):Promise<IUser> {

		let newUser:IUser = deepCloneObject(TUSER),
			p:any = deepCloneObject(profile),
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
			errType = 1030; // user has to a natural person
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
  			errType =  1031; // no public gogole ID was provided
  		}

  		/****
  		 * test for given and family name
  		 * email address  	
  		 */
  		if(p.name) {
  			newUser.profile.personalia.firstName = capitalizeString(p.name.givenName) || "";
  			newUser.profile.personalia.lastName = capitalizeString(p.name.familyName) || "";  			
  		} else {
  			errType = 1032; // user remains nameless
  		}  		
  		if(p.emails && p.emails.length) {
  			newUser.core.email = p.emails[0].value;
  		} else {
  			errType = 1033; // no email account was provided
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

	private formatProfileFromGoogleData():Promise<void> {

		let err:any;

		try {

			let p:any = deepCloneObject(this.newUser.profile.personalia);

			/** format display names */ 
			this.newUser.profile.displayNames.fullName = `${p.firstName} ${p.lastName}`;
			this.newUser.profile.displayNames.sortName = `${p.firstName} ${p.lastName}`;

			/** user credentials: userName && url */
			constructUserCredentials( this.newUser, (credentials:any) => {
				this.newUser.core.userName = credentials.userName;
				this.newUser.core.url = credentials.url;
			});		

			/** set default user role: 3 orw hatever you like */
			this.newUser.core.role = 3;	

		} 
		catch (e) { err=e; }
		finally {
			if(err) {
				return Promise.reject(1034);
			} else {
				return Promise.resolve();
			}
		}		
	}

	private createNewUser(profile:any):Promise<any> {
		
		// process thick: create user profile
		return this.createProfileFromGoogleData(profile)

		// process thick: format profile
		.then( () => this.formatProfileFromGoogleData() )

		// process thick: save new user
		.then( () => {
			return UserModel.remoteCreateUser( this.newUser)
			.then( user => {					
				// assign new user to user container => #TODO create seperate container for profile
				this.user = this.newUser;
				return Promise.resolve();
			})
			.catch( err => { return Promise.reject(8010); });	
		});		
	}

	private cloneAndRemoveDatabaseID() {			

		let user:IUser = deepCloneObject(this.user);
		if(user && user["_id"] ) delete user._id;		
		return user;
	}

	public authenticateGoogleUser(data:IGoogleUser, done:Function) {

		// process thick: test for email address
		this.grabEmailFromGoogleProfile(data)

		// process thick: test for user
		.then( () => this.findUserByEmail() )

		// process thick: eval user	
		.then( user => {						
			if(!user) {
				return this.createNewUser( data.profile);
			} else {
				return this.user = user;			
			}
		})		

		// prcoess thick: clone user for serialization and remove db ID
		.then( () => this.cloneAndRemoveDatabaseID() )

		// process thick: return to passport
		.then( user => { return done(null, user); })		

		// catch errors
		.catch( err => { return done(err); });		
	}
}


export const u:any = {	

	authenticateGoogleUser(data:IGoogleUser, done:Function) {	
		let instance:any = new UserService();
		instance.authenticateGoogleUser( data, (err:any, user:IUser) => { return done(err, user); });	
	}


}

