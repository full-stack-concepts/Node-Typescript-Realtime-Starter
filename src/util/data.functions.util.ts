import faker from "faker";
import { capitalizeString } from "../util";
import passwordGenerator from "generate-password";

import { 
	USE_DEFAULT_USER_PASSWORD,
	DEFAULT_PASSWORD_USER,
	PASSWORD_MIN_LENGTH
} from "./secrets";


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

export const genderPrefix = ():string => {
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

export const jobType = ():string => {
	return faker.name.jobType();
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

export const companyName = ():string => {
	return faker.company.companyName();
}

export const companySuffix = ():string => {
	return faker.company.companySuffix();
}

export const companySlogan = ():string=> {
	return faker.company.catchPhrase();
}

export const companySubSlogan = ():string => {
	return faker.company.bs();
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

export const streetPrefix = ():string => {
	return faker.address.streetPrefix();
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
	if(USE_DEFAULT_USER_PASSWORD) {
		return DEFAULT_PASSWORD_USER;
	} else {		
		return passwordGenerator.generate({
			length: PASSWORD_MIN_LENGTH,
			numbers:true
		});
	}
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

export function getRandomArbitrary(min:number, max:number):number {
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

export const sliceMe = (str:string, pos:number) => {
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

export const constructCompanyEmail = (companyName:string):string => {
	let email:string = `${companyName}@${emailProvider()}`;
	return email.replace(" ", "_")
}

export const constructCompanyWebsite = (companyName:string):string => {
	let website:string = `https://${companyName}.com`;
	return website.replace(" ", "_");
}

export const constructCompanyFacebookAccount = (companyName:string):string => {
	let account:string = `https://facebook.com/company/${companyName}`;
	return account.replace(" ", "_");
}

export const constructCompanyTwitterAccount = (companyName:string):string => {
	let account:string = `https://twitter.com/company/${companyName}`;
	return account.replace(" ", "_");
}
