import faker from "faker";
import { Observable, Subscription } from "rxjs";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/take";
import "rxjs/add/operator/map";

import { deepCloneObject} from "../util";
import { IUser, IClient, ICustomer} from "../shared/interfaces"; 
import { TUSER, TCLIENT, TCUSTOMER } from "../shared/types";
import { constructUserCredentials } from "../util";

/****
 * Import Data Geenrator Functions
 */
import {

	/* Person */
	gender, genderPrefix, firstName, lastName, givenName, constructFullName, gimmieCredentials, constructEmail, jobTitle, jobArea, jobDescription, jobType, phoneNumber, phoneFormats, phoneNumberFormat, birthDay,
	
	/* Company */
	companyName, companySuffix,  companySuffixes, companySlogan, companySubSlogan, constructCompanyEmail, constructCompanyWebsite, constructCompanyFacebookAccount,
	constructCompanyTwitterAccount,

	/* Address */
	city, zipCode, cityPrefix, streetName, houseNumber, streetAddress, streetSuffix, streetPrefix, county, country, countryCode, 
	state, stateAbbr, addressLine1, addressLine2, addressLine3, latitude, longitude,

	/* Images */
	image, avatar, imageURL, mimeType, randomImage,

	/* System */
	word, createIdentifier, generatePassword, protocol, url, domainName, domainSuffix, domainWord, ipType,
	ipAddress, ip6Address, userAgent, color, macAddress, getRandomArbitrary, creditCardNumber, emailProvider, sliceMe
	
} from "./data.functions.util";

/****
 * Import Type Guards
 */
import {		
	isOfPersonType,
	isOfUserType,
	isOfClientType,
	isOfCustomerType
	
} from "../shared/interfaces";

/***
 * Data Factory: user security
 */
const fakeUserSecurity = (user:IUser|IClient|ICustomer):IUser|IClient|ICustomer => {

	/*************************************************************************************
	 * User Security
	 * @security.accountType: 5 => default user
	 * @securtity.isAccoutnVerified: default value:false
	 * @core.role: mirror for @security.acountType
	 */
	 user.security.accountType = 5; // default user
	 user.security.isAccountVerified = false;
	 user.core.role = 5;

	 /***
	  * Set user password
	  */
	 user.password = generatePassword().toString();

	 return user;
}

/***
 * Data Factory: user personalia and identifiers
 */
const fakeUserPersonalia = (user:IUser|IClient|ICustomer):IUser|IClient|ICustomer => {

	/*************************************************************************************
	 * Use Core Details And Personalia
	 * @fName: string
	 * @lName: string
	 * @userName:string
	 * @url:string
	 * @userName:string
	 * @email:string
	 * @identifier: string of type UUID
	 */ 
	let fName:string = firstName().trim(),
		lName:string = lastName().trim(),
	 	credentials:any= gimmieCredentials(fName, lName),
	 	url:string = credentials.url,
	 	userName:string = credentials.userName,
	 	email:string = constructEmail(fName,lName),
	 	identifier:string = String(createIdentifier() ),
	 	_avatar:string = String( avatar().trim() ),
	 	_thumbnail:string = String( avatar().trim() );

	/***
	 * Core Details
	 */
	user.core.email = email.trim().toLowerCase();
	user.core.userName = userName;
	user.core.url = url;	
	user.core.identifier = identifier;

	/***
	 * Profile personalia && displayNames
	 */
	 user.profile.personalia.firstName = fName;
	 user.profile.personalia.insertion = '';
	 user.profile.personalia.lastName = lName;
	 user.profile.displayNames.fullName = constructFullName(fName, lName);
	 user.profile.displayNames.sortName = constructFullName(fName, lName).toLowerCase();

	/***
	 * User images
	 */
	user.profile.images.avatar = _avatar;
	user.profile.images.thumbnail = _thumbnail;

	return user;
}

/***
 * Data Factory: user address & location
 */
const fakeUserAddressAndLocation = (user:IUser|IClient|ICustomer):IUser|IClient|ICustomer => {

	/*************************************************************************************
	 * User Address Details, location (modify as you like)
	 * @street:string	
	 * @houseNumber: string
	 * @addition:string
	 * @suffix: string
	 * @zipcode:string
	 * @city:string
	 * @county:string,
	 * @countyCode:string
	 * @country:string
	 * @countryCode:string
	 */
	let _street:string = streetName().trim(),
		_houseNumber:string = houseNumber().toString().trim(),
		_suffix:string = streetSuffix().trim(),
		_addition:string = '',
		_areaCode = zipCode().trim(),
		_city:string = city().trim(),
		_county:string = country().trim(),	
		_country:string = country().trim(),
		_countryCode:string = countryCode().trim();

	/***
	 * Address Details
	 */
	user.profile.address.street = _street;
	user.profile.address.houseNumber = _houseNumber;
	user.profile.address.suffix = _suffix;
	user.profile.address.addition = _addition;
	user.profile.address.areacode = _areaCode;
	user.profile.address.city = _city;
	user.profile.address.county = _county;	
	user.profile.address.country = _country;
	user.profile.address.countryCode = _countryCode;

	/***
	 * Geo Location
	 */
	user.profile.location.latitude = latitude();
	user.profile.location.longitude = longitude();
		

	// type assertionL and finally confirm that address has been configured
	if(isOfUserType(user)) {
		user.userConfiguration.isAddressSet =true;
	}
	if(isOfClientType(user)) {
		user.clientConfiguration.isAddressSet =true;
	}
	if(isOfCustomerType(user)) {
		user.customerConfiguration.isAddressSet = true;
	}

	return user;
}

/*****************************************************************************************
 * Data Factory: device
 */
const fakeUserDevice = ( user:IUser|IClient|ICustomer):IUser|IClient|ICustomer => {

	/*************************************************************************************
	 * User Device Details
	 * @ _location:string
	 * @ _ipType: string
	 * @ _ipAddress:string
	 * @ _userAgent: string
	 * @ _macAddress: string
	 * @ _protocol: string
	 */
	let _location:string= word().toString(),
		_ipType:string= ipType().toString(),
		_ipAddress:string= ipAddress().toString(),
		_ip6Address:string = ip6Address().toString(),
		_userAgent:string = userAgent().toString(),
		_macAddress:string = macAddress().toString(),
		_protocol:string = protocol().toString();

	/***
	 * Device details
	 */
	 user.devices = [{
	 	location: _location,
	 	ipType: _ipType,
	 	ipAddress: _ipAddress,
	 	userAgent: _userAgent,
	 	macAddress: _macAddress,
	 	protocol: _protocol
	 }];	 

	 return user;
}

const fakeDataFor = ( user:any) => {
	
	/**********************
	 * User Securiy
	 */
	 user = fakeUserSecurity( user );

	/**********************
	 * User Securiy
	 */
	 user = fakeUserPersonalia( user );

	 /**********************
	 * User Address
	 */
	 user = fakeUserAddressAndLocation( user );

	/**********************
	 * User Device
	 */
	 user = fakeUserDevice( user );

	// console.log("==> populate this user ", user);

	return user;
}

/****
 * Create either user, client or customer
 * @category:string
 * @count:number
 * 
 */
export const createUserType = (category:string, count:number) => {	

	console.log( "*** Castegory: ", category)	
	let users:IUser[]=[];
	let clients:IClient[]=[];
	let customers:ICustomer[]=[];
	let user:IUser;
	let client:IClient;
	let customer:ICustomer;

	return new Promise( (resolve, reject) => {

		const source$:Observable<number> = Observable.interval(75).take(count);
		const sub$:Subscription = source$.subscribe(		

		x => { 
			
			if(category === "users") {
			
				// clone default user	   	
				user=deepCloneObject(TUSER);    			
				
				// format user with unique data
    			user = fakeDataFor(user);

    			// add sub user to collection
    			users[x]=user;	    			

			} else if(category === "clients") {

				// clone default client
				client=deepCloneObject(TCLIENT);    			
				
				// format user with unique data
    			client = fakeDataFor(client);

    			// add sub user to collection
    			clients[x]=client;	    			

			} else if(category === "customers") {

				// clone default customer
				customer=deepCloneObject(TCUSTOMER);    			
				
				// format with unique data
    			customer = fakeDataFor(customer);

    			// add sub user type <customer> to collection
    			customers[x]=customer;
			}    		

    		// return at end of sequence
    		if (x=== (count-1)) return;	    
		},

		// error handler
		err => console.error(err),

		// On sequence end unsubscribe and resolve users array			
		() => { 
			sub$.unsubscribe(); 
			if(category === "users") {										
				resolve(users); 
			} else if(category === "clients") {
				resolve(clients); 
			} else if(category === "customers") {
				resolve(customers);
			}
		}
	);
	}); 


}   


export const formatUserSubType = ({ category, amount, data }:any) => {

	console.log("==> Incoming collection: ", category, amount, data.length)
	
	return new Promise( (resolve, reject) => {
		switch( category) {
			case 'superadmin':		resolve( createSuperAdmin( category, data ) );		break;
			case 'admin': 			resolve( createAdmin( category, data) ); 			break;
			case 'poweruser': 		resolve( createPowerUser( category, data )); 		break;
			case 'author': 			resolve( createAuthor( category, data) ); 			break;
			case 'user': 			resolve( createUser( category, data ));  			break;
			case 'defaultClient':	resolve( createDefaultClient( category, data)); 	break;
			case 'defaultCustomer': resolve( createDefaultCustomer( category, data)); 	break;
		}
	});		
}


export const createSuperAdmin = ( category:string, users:IUser[] ) => {

	users.forEach ( u => {
		
		// set role for this user type
		u.core.role = u.security.accountType  = 1;
		// #TODO: set specific access roles and policies for this group
	});

	return Promise.resolve({ [category]: users });
}

export const createAdmin = ( category:string, users:IUser[]) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 2;
		// #TODO: set specific access roles and policies for this group
	});
	
	return Promise.resolve({ [category]: users });
}

export const createPowerUser = ( category:string, users:IUser[]) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 3;
		// #TODO: set specific access roles and policies for this group
	});
	
	return Promise.resolve({ [category]: users});
}

export const createAuthor = ( category:string, users:IUser[] ) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 4;
		// #TODO: set specific access roles and policies for this group
	});

	return Promise.resolve({ [category]: users});
}

export const createUser = ( category:string, users:IUser[] ) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 5;
		// #TODO: set specific access roles and policies for this group
	});

	return Promise.resolve({ [category]: users });
}


export const createDefaultClient = ( category:string, users:IClient[] ) => {

	let err:any; 

	try {

		users.forEach ( u => {		

			// set role for this user type, u = client user
			u.core.role = u.security.accountType  = 10;	 

			/*** 
			 * Set client company, its address and job
			 */
			u.company.name = companyName().trim().toString();
			u.company.type = companySuffix().trim().toString();
			u.company.slogan = companySlogan().trim().toString();
			u.company.subSlogan = companySubSlogan();
			let cName = u.company.name;

			/***
			 *  Set Job At Company
			 */
			u.company.jobTitle = jobTitle();
			u.company.jobType = jobType()

			/***
			 * Set Company's address
			 */
			u.company.address.street = streetName().trim();
			u.company.address.houseNumber =  houseNumber().toString().trim();
			u.company.address.suffix  = streetSuffix().trim();
			u.company.address.addition = "";
			u.company.address.areacode = zipCode().trim(),
			u.company.address.city = city().trim();
			u.company.address.county = county().trim();
			u.company.address.country = country().trim();
			u.company.address.countryCode =  countryCode().trim();
			u.company.address.addressLine1 = addressLine1().trim();
			u.company.address.addressLine2 = addressLine2().trim();
			u.company.address.addressLine3 = addressLine3().trim();

			/***
			 * Set company's Communication profile
			 */		
			u.company.communication.companyPhone = phoneNumber().toString();
			u.company.communication.companyEmail = constructCompanyEmail( cName );
			u.company.communication.companyWebsite = constructCompanyWebsite ( cName );

			/***
			 * Set company's Socialk profile
			 */	
			u.company.social.facebook = constructCompanyFacebookAccount( cName );
			u.company.social.twitter = constructCompanyTwitterAccount( cName );
		
		});

	}

	catch(e) {
		err = e;
	}

	finally {

		if(err) {
			// #TODOK log error
		} else {
			return Promise.resolve({ [category]: users });
		}
	}	
}


export const createDefaultCustomer = ( category:string, users:ICustomer[] ) => {

	users.forEach ( u => {		

		// set role for this user type		
		u.core.role = u.security.accountType  = 20;

		// #TODO: set specific access roles and policies for this group		
	});
	
	return Promise.resolve({ [category]: users });
}