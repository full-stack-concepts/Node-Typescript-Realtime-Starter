const uuidv1 = require("uuid/v1");

import { IUser } from "../shared/interfaces";
import { TUSER } from "../shared/types";
import {
	deepCloneObject,
  	capitalizeString,
  	constructUserCredentials,
  	constructProfileFullName,
  	constructProfileSortName,
  	generatePassword,
  	isEmail,
  	isURL
} from "../util";

export const grabEmailFromFacebookProfile = (fProfile:any):Promise<string | number> => {	
	let email:string = fProfile.emails[0].value;		
	if(email && isEmail(email) ) {
		return Promise.resolve(email)
	} else {
		return Promise.reject('<errorNumber1>');			
	}	
}	

export const extractFacebookProfile = (profile:any) => {

	// console.log(profile)

	let newUser:IUser = deepCloneObject(TUSER),
		p:any = deepCloneObject(profile),
		errType:number;

	console.log("*** url test")
	console.log(profile.profileUrl)
	console.log(isURL(profile.profileUrl))
	

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
		 newUser.password = generatePassword().toString();
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

	console.log("*** Profile Error ", errType)


	return new Promise( (resolve, reject) => {				
		// console.log(newUser);
		(errType) ? reject(errType): resolve(newUser);		
	});	
}


