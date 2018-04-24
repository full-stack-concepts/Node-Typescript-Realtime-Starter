const uuidv1 = require("uuid/v1");

import { IUser } from "../shared/interfaces";
import { TUSER } from "../shared/types";
import {
    deepCloneObject,
    capitalizeString,
    constructUserCredentials,
    constructProfileFullName,
    constructProfileSortName,
    generatePassword
} from "../util";

export const grabEmailFromGoogleProfile = (data:any) => {        
    let email:string = data.profile.emails[0].value;
    return Promise.resolve(email);
}


/****
 * Create User Profile from Google Authentication Response
 */
export const createProfileFromGoogleData = (profile:any) => {

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
  		 * test for given and family name and email address  	
  		 */
  		if(p.name) {
  			newUser.profile.personalia.givenName = capitalizeString(p.name.givenName) || "";
  			newUser.profile.personalia.familyName = capitalizeString(p.name.familyName) || "";  			
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
			(errType) ? reject(errType): resolve(newUser);		
		});
}

export const formatProfileFromGoogleData = (newUser:IUser) => {

    let err:any;

    try {

        let p:any = deepCloneObject(newUser.profile.personalia);

        /** format display names */ 
        newUser.profile.displayNames.fullName = `${p.givenName} ${p.familyName}`;
        newUser.profile.displayNames.sortName = `${p.givenName} ${p.familyName}`;

        /** user credentials: userName && url */
        constructUserCredentials( newUser, (credentials:any) => {
            newUser.core.userName = credentials.userName;
            newUser.core.url = credentials.url;
        });   

        /** set default user role: 3 orw hatever you like */
        this.newUser.core.role = 3; 

    } 

    catch (e) { err=e; }
    
    finally {
        if(err) {
            return Promise.reject(1034);
        } else {
            return Promise.resolve(newUser);
        }
    }   
}