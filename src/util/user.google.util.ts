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

export const grabEmailFromGoogleProfile = (profile:any):Promise<string> => {        

    console.log(profile)

    let email:string, err:any
    try { email = profile.emails[0].value;} 
    catch(e) {err = e;  }
    finally {       
        console.log(email)
        console.log(err)
        if(err) {
            return Promise.reject('errorGoogle1000');
        } else {
            return Promise.resolve(email);
        }
    }
}

/****
 * Create User Profile from Google Authentication Response
 */
export const extractGoogleProfile = (profile:any) => {

	let newUser:IUser = deepCloneObject(TUSER),
		p:any = deepCloneObject(profile),
		errType:number;

    /****
     * Test if Profile contains essential params
     */
    if( !p.hasOwnProperty('id') || (p.id && typeof p.id != 'string') )

    // invalid Google Profile
    {
        errType = 1031; 

    } else {

        // create 'personal' identifier, a UUID timestamp
        newUser.core.identifier = uuidv1();

        // configure security and account Type
        newUser.security.accountType = 5;           
        newUser.security.isAccountVerified = true; 
        newUser.core.role = 5;

        // update user configuration
        newUser.configuration.isGoogleUser = true;
        newUser.profile.social.facebook = p.url || "";

        // set public facebook ID
        newUser.accounts.googleID = p.id;

        // set raw profile
        newUser.profileRaw = p._raw;

        /***
         * Set user password
         */
         newUser.password = generatePassword().toString();
         newUser.security.isPasswordEncrypted = false; 
    }   

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
	   newUser.profile.images.externalThumbnailUrl = p.photos[0].value;
       newUser.configuration.hasExternalThumbnailUrl = true;
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
        newUser.configuration.isGooglePlusUser = true;
	}  		

	/****
	 * Verified Google Account
	 */
	if(p._json && p._json.verified && p._json.verified.length && typeof p._json.verified === 'boolean' ) {
		newUser.security.isAccountVerified = p._json.verified;
	}

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

