import faker from "faker";
import { Observable, Subscription } from "rxjs";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/take";
import "rxjs/add/operator/map";

import { deepCloneObject} from "../../util";
import { IUser, IClient, ICustomer} from "../../shared/interfaces"; 
import { TUSER, TCLIENT, TCUSTOMER } from "../../shared/types";
import { constructUserCredentials } from "../../util";

import { DEFAULT_PASSWORD_USER } from "../../util/secrets";

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
	
} from "../../util/data.functions.util";

/****
 * Import Type Guards
 */
import {		
	isOfPersonType,
	isOfUserType,
	isOfClientType,
	isOfCustomerType
	
} from "../../shared/interfaces";

export class DataUtilitiesService {

	/***
	 * Data Factory: user security
	 */
	public fakeUserSecurity (user:IUser|IClient|ICustomer):IUser|IClient|ICustomer {

		/*************************************************************************************
		 * User Security
		 * @security.accountType: 5 => default user
		 * @securtity.isAccoutnVerified: default value:false
		 * @core.role: mirror for @security.acountType
		 */
		 user.security.accountType = 5; // default user
		 user.security.isAccountVerified = false;
		 user.security.isPasswordEncrypted = false;
		 user.core.role = 5;

		 /***
		  * Set user password
		  */
		 user.password.value = DEFAULT_PASSWORD_USER;

		 return user;
	}

	/***
	 * Data Factory: user personalia and identifiers
	 */
	public fakeUserPersonalia (user:IUser|IClient|ICustomer):IUser|IClient|ICustomer {

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
		let givenName:string = firstName().trim(),
			familyName:string = lastName().trim(),
		 	credentials:any= gimmieCredentials(givenName, familyName),
		 	url:string = credentials.url,
		 	userName:string = credentials.userName,
		 	email:string = constructEmail(givenName,familyName).trim().toLowerCase(),
		 	identifier:string = String(createIdentifier() ),
		 	_avatar:string = String( avatar().trim() ),
		 	_thumbnail:string = String( avatar().trim() );

		/***
		 * Core Details
		 */
		user.core.email = email;
		user.core.userName = userName;
		user.core.url = url;	
		user.core.identifier = identifier;

		/***
		 * Web Token Identifiers
		 */
		user.accounts.localID = email;

		/***
		 * Profile personalia && displayNames
		 */
		 user.profile.personalia.givenName = givenName;
		 user.profile.personalia.middleName = '';
		 user.profile.personalia.familyName = familyName;
		 user.profile.displayNames.fullName = constructFullName(givenName, familyName);
		 user.profile.displayNames.sortName = constructFullName(givenName, familyName).toLowerCase();

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
	public fakeUserAddressAndLocation (user:IUser|IClient|ICustomer):IUser|IClient|ICustomer {

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
			user.configuration.isAddressSet =true;
		}
		if(isOfClientType(user)) {
			user.configuration.isAddressSet =true;
		}
		if(isOfCustomerType(user)) {
			user.configuration.isAddressSet = true;
		}

		return user;
	}

	/*****************************************************************************************
	 * Data Factory: device
	 */
	public fakeUserDevice ( user:IUser|IClient|ICustomer):IUser|IClient|ICustomer {

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

	public fakeDataFor ( user:any) {
	
		/**********************
		 * User Securiy
		 */
		 user = this.fakeUserSecurity( user );

		/**********************
		 * User Personalia
		 */
		 user = this.fakeUserPersonalia( user );	

		 /**********************
		 * User Address
		 */
		 user = this.fakeUserAddressAndLocation( user );

		/**********************
		 * User Device
		 */
		 user = this.fakeUserDevice( user );

		// console.log("==> populate this user ", user);

		return user;
	}

	/****
	 * Create either user, client or customer
	 * @category:string
	 * @count:number
	 * 
	 */
	public createUserType (category:string, count:number) {	

		console.log( "*** Category: ", category)	
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
	    			user = this.fakeDataFor(user);

	    			// add sub user to collection
	    			users[x]=user;	    			

				} else if(category === "clients") {

					// clone default client
					client=deepCloneObject(TCLIENT);    			
					
					// format user with unique data
	    			client = this.fakeDataFor(client);

	    			// add sub user to collection
	    			clients[x]=client;	    			

				} else if(category === "customers") {

					// clone default customer
					customer=deepCloneObject(TCUSTOMER);    			
					
					// format with unique data
	    			customer = this.fakeDataFor(customer);

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

	public formatUserSubType ({ category, amount, data }:any) {	
		/****
		 * Format user Sub Type
		 */		
		return new Promise( (resolve, reject) => {
			switch( category) {
				case 'superadmin':		resolve( this.createSuperAdmin( category, data ) );		break;
				case 'admin': 			resolve( this.createAdmin( category, data) ); 			break;
				case 'poweruser': 		resolve( this.createPowerUser( category, data )); 		break;
				case 'author': 			resolve( this.createAuthor( category, data) ); 			break;
				case 'user': 			resolve( this.createUser( category, data ));  			break;			
				case 'defaultClient':	resolve( this.createDefaultClient( category, data)); 	break;
				case 'defaultCustomer': resolve( this.createDefaultCustomer( category, data)); 	break;
			}
		});		
	}


	public createSuperAdmin ( category:string, users:IUser[] ) {

		users.forEach ( u => {
			
			// set role for this user type
			u.core.role = u.security.accountType  = 1;
			// #TODO: set specific access roles and policies for this group
		});

		return Promise.resolve({ [category]: users });
	}

	public createAdmin ( category:string, users:IUser[]) {

		users.forEach ( u => {
			// set role for this user type
			u.core.role = u.security.accountType  = 2;
			// #TODO: set specific access roles and policies for this group
		});
		
		return Promise.resolve({ [category]: users });
	}

	public createPowerUser ( category:string, users:IUser[]) {

		users.forEach ( u => {
			// set role for this user type
			u.core.role = u.security.accountType  = 3;
			// #TODO: set specific access roles and policies for this group
		});
		
		return Promise.resolve({ [category]: users});
	}

	public createAuthor ( category:string, users:IUser[] ) {

		users.forEach ( u => {
			// set role for this user type
			u.core.role = u.security.accountType  = 4;
			// #TODO: set specific access roles and policies for this group
		});

		return Promise.resolve({ [category]: users});
	}

	public createUser ( category:string, users:IUser[] ) {

		users.forEach ( u => {
			// set role for this user type
			u.core.role = u.security.accountType  = 5;
			// #TODO: set specific access roles and policies for this group
		});

		return Promise.resolve({ [category]: users });
	}

	public createDefaultClient ( category:string, users:IClient[] ) {

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
				u.company.communication.companyEmail = constructCompanyEmail( cName ).toLowerCase();
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

	public createDefaultCustomer ( category:string, users:ICustomer[] ) {

		users.forEach ( u => {		

			// set role for this user type		
			u.core.role = u.security.accountType  = 20;

			// #TODO: set specific access roles and policies for this group		
		});
		
		return Promise.resolve({ [category]: users });
	}
}

/****
 * Public Interface for Data Actions Controller
 */

class ActionService {

	public createUserType(category:string, amount:number) {
		let instance:any = new DataUtilitiesService();
		return instance.createUserType(category,amount)
			.then( (users:any) => Promise.resolve(users) )
			.catch((err:any) => Promise.reject(err) );
	}	

	public formatUserSubType(collection:any) {
		let instance:any = new DataUtilitiesService();
		return instance.formatUserSubType(collection)
			.then( (result:any) => Promise.resolve(result) )
			.catch((err:any) => Promise.reject(err) );
	}	
}


export const dataUtilitiesService:ActionService = new ActionService();

















