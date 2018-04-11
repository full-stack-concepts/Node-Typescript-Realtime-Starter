import faker from "faker";
import { Observable, Subscription } from "rxjs";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/take";
import "rxjs/add/operator/map";

import { deepCloneObject} from "../util";
import { IUser } from "../shared/interfaces";
import { TUSER } from "../shared/types";
import { capitalizeString } from "../util";
import { constructUserCredentials } from "../util";

interface ISetting {
	type:string,
	amount:number
}


/****
 * Data Generate functions : Person
 */
export const gender = ():number => {
	let bool:boolean = faker.random.boolean();
	if( bool) {
		return 1;	// male
	} else {
		return 2;	// female
	}
}

export const genderPredix = ():string => {
	return faker.name.prefix();
}

/****
 * Data Generate functions : name
 */
export const firstName = ():string => {
	return faker.name.firstName();
}

export const lastName = ():string => {
	return faker.name.lastName();
}

export const givenName = ():string => {
	return faker.name.findName();
}

/****
 * Data Generate functions : job
 */
export const jobTitle = ():string => {
	return faker.name.jobTitle();
}

export const jobArea = ():string => {
	return faker.name.jobArea();
}

export const jobDescription = ():string => {
	return faker.name.jobDescriptor();
}

/****
 * Data generate functions: phone
 */
export const phoneNumber = ():string => {
	return faker.phone.phoneNumber();
}

export const phoneFormats = ():string => {
	return faker.phone.phoneFormats();
}

export const phoneNumberFormat = ():string => {
	return faker.phone.phoneNumberFormat();
}

/****
 * Data generate functions: company
 */
export const companySuffixes = ():any[] => {
	return faker.company.suffixes();
}

export const companyname = ():string => {
	return faker.company.companyName();
}

export const companySuffix = ():string => {
	return faker.company.companySuffix();
}

export const companySlogan = ():string=> {
	return faker.company.catchPhrase();
}

/****
 * Data generate functions: address
 */
export const city = ():string => {
	return faker.address.city();
}

export const zipCode = ():string  => {
	return faker.address.zipCode();
}

export const cityPrefix = ():string => {
	return  faker.address.cityPrefix();
}

export const streetName = ():string => {
	return faker.address.streetName();
}

export const houseNumber = ():number => {
	return Math.random()*101|0;
}

export const streetAddress = ():string => {
	return faker.address.streetAddress();
}

export const streetSuffix = ():string => {
	return faker.address.streetSuffix();
}

export const streetSuffix = ():string => {
	return faker.address.streetSuffix();
}

export const county = ():string => {
	return faker.address.county();
}

export const country = ():string => {
	return faker.address.country()
}

export const countryCode = ():string => {
	return faker.address.countryCode();
}
export const state = ():string => {
	return faker.address.state();
}

export const stateAbbr = ():string => {
	return faker.address.stateAbbr();
}

export const addressLine1 = ():string => {
	return `${streetName()} ${houseNumber()} ${streetPrefix()}`;
}

export const addressLine2 = ():string => {
	return `${zipCode()} ${city()}`;
}

export const addressLine3 = ():string => {
	return `${state()} ${country()}`;
}

/****
 * Data generate functions: system
 */
export const latitude = ():number => {
	return Number(faker.address.latitude());
}

export const longitude = ():number => {
	return Number(faker.address.longitude());
} 

/****
 * Data generate functions: Imaging
 */
export const image = ():string => {
	return faker.image.image();
}

export const avatar = ():string => {
	return faker.image.avatar();
}

export const imageURL = ():string => {
	return faker.image.imageUrl();
}

export const mimeType = ():string => {
	return faker.system.mimeType();
}

export const randomImage = ():string => {
	return faker.random.image();
}

/****
 * Data generate functions: system
 */
export const word = ():string => {
	return faker.random.word();
}


export const createIdentifier = ():string => {
	return faker.random.uuid().toString();
}

export const generatePassword = ():string => {
	return faker.internet.password();
}

export const protocol = ():string => {
	return faker.internet.protocol();
}

export const url = ():string => {
	return faker.internet.url();
}

export const domainName = ():string => {
	return faker.internet.domainName();
}

export const domainSuffix = ():string => {
	return faker.internet.domainSuffix();	
}

export const domainWord = ():string => {
	return faker.internet.domainWord();
}

export const ipType = ():string => {

	let bool:boolean = faker.random.boolean(),
		type:string;

	(bool)?type='ipv4':type='ipv6';
	return type;
}

export const ipAddress = ():string => {
	return faker.internet.ip();
}

export const ip6Address = ():string => {
	return faker.internet.ipv6();
}

export const userAgent = ():string => {
	return faker.internet.userAgent();
}

export const color = ():string => {
	return faker.internet.color();
}

export const macAddress = ():string => {
	return faker.internet.mac();
}

function getRandomArbitrary(min:number, max:number):number {
	return Math.floor(Math.random() * (max - min) + min);
}

export const creditCardNumber = ():string => {
	return `${getRandomArbitrary(2000, 8000)}-${getRandomArbitrary(2000, 8000)}-${getRandomArbitrary(2000, 8000)}-${getRandomArbitrary(2000, 8000)}`;	
}

export const birthDay = ():string => {
	return `${getRandomArbitrary(1930, 2000)}-${getRandomArbitrary(1, 12)}-${getRandomArbitrary(1, 31)}`;	
}


export const emailProvider = ():string => {

	let n:number = getRandomArbitrary(0, 8), 
		p:string;

	switch(n) {
		case 1: p='gmail.com'; break;
		case 2: p='yahoo.com'; break;
		case 3: p='outlook.com'; break;
		case 4: p='gmx.com'; break;
		case 5: p='zoho.com'; break;
		case 6: p='icloud.com'; break;
		case 7: p='aolmail.com'; break;
		case 8: p='elude.com'; break;
		default: p='flintstones.org'; break;
	}
	return p;
}


/*************************************************
 * Data generator  utiluty functions
 */

export const constructFullName = (firstName:string, lastName:string):string => {
	return `${capitalizeString(firstName)} ${capitalizeString(lastName)}`;
}

const sliceMe = (str:string, pos:number) => {
    return str.slice(0, pos).trim().toLowerCase();
}

/****
 * #TODO: set configuration options for this policy
 */
export const gimmieCredentials = (fName:string, lName:string):any => {   

    let uPolicy:any = {
        'firstName': sliceMe( fName, 4),
        'lastName': sliceMe( lName , 5),
        'number': faker.random.number()
    }

    return {
    	userName: `${uPolicy.firstName}${uPolicy.lastName}${uPolicy.number}`,
    	url: `${uPolicy.firstName}_${uPolicy.lastName}_${uPolicy.number}`
    }
}

export const constructEmail = (fName:string, lName:string):string => {
	return `${fName}.${lName}@${emailProvider()}`;
}

/***
 * Data Factory: user security
 */
const fakeUserSecurity = (user:IUser):IUser => {

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
const fakeUserPersonalia = (user:IUser):IUser => {

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
const fakeUserAddressAndLocation = (user:IUser):IUser => {

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
		

	// and finally confirm that address has been configured
	user.userConfiguration.isAddressSet =true;

	return user;
}

/***
 * Data Factory: device
 */
const fakeUserDevice = (user:IUser):IUser => {

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

const fakeDataFor = (user:IUser):IUser => {
	
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

export const createDefaultUser = (count:number) => {	
	
	let users:IUser[] = [],
		user:IUser;

	return new Promise( (resolve, reject) => {

		const source$:Observable<number> = Observable.interval(10).take(count);
		const sub$:Subscription = source$.subscribe(		

			x => {
				// clone default user	    					
	    		user=deepCloneObject(TUSER);    			    	

	    		// format user with unique data
	    		user = fakeDataFor(user);

	    		// add user to collection
	    		users[x]=user;

	    		// return at end of sequence
	    		if (x=== (count-1)) return;	    
			},

			// error handler
			err => console.error(err),

			// On sequence end unsubscribe and resolve users array			
			() => { 
				sub$.unsubscribe(); 								
				resolve(users); 
			}
		);
	}); 
}   


export const formatUserSubType = ({ type, amount, data }:any) => {

	console.log("==> Incoming collection: ", type, amount, data.length)
	
	return new Promise( (resolve, reject) => {
		switch( type) {
			case 'superadmin':	resolve( createSuperAdmin( type, data ) ); break;
			case 'admin': 		resolve( createAdmin( type, data) ); break;
			case 'poweruser': 	resolve( createPowerUser( type, data )); break;
			case 'author': 		resolve( createAuthor( type, data) ); break;
			case 'user': 		resolve( createUser( type, data ));  break;
		}
	});		
}


export const createSuperAdmin = ( type, users:IUser[] ) => {

	users.forEach ( u => {
		
		// set role for this user type
		u.core.role = u.security.accountType  = 1;
		// #TODO: set specific access roles and policies for this group
	});

	return Promise.resolve({ [type]: users });
}

export const createAdmin = ( type, users:IUser[]) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 2;
		// #TODO: set specific access roles and policies for this group
	});
	
	return Promise.resolve({ [type]: users });
}

export const createPowerUser = ( type, users:IUser[]) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 3;
		// #TODO: set specific access roles and policies for this group
	});
	
	return Promise.resolve({ [type]: users});
}

export const createAuthor = ( type, users:IUser[] ) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 4;
		// #TODO: set specific access roles and policies for this group
	});

	return Promise.resolve({ [type]: users);
}

export const createUser = ( type, users:IUser[] ) => {

	users.forEach ( u => {
		// set role for this user type
		u.core.role = u.security.accountType  = 5;
		// #TODO: set specific access roles and policies for this group
	});

	return Promise.resolve({ [type]: users });
}