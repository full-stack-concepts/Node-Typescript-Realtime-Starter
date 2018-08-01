const uuidv1 = require("uuid/v1");
import randomNumber from "random-number";
import moment from "moment-timezone";

import { LOCAL_AUTH_CONFIG, TIME_ZONE, DATE_FORMAT, TIME_FORMAT } from "../../util/secrets";
import { capitalizeString } from "../../util";

import { IUserApplication, IClientApplication, ICustomerApplication, IEncryption} from "../../shared/interfaces";

interface IName  {
    givenName:string,
    middleName:string,
    familyName:string
}

export class PersonProfile {	

	private constructProfileFullName ( {givenName, middleName, familyName }:IName ):string {
    	let n:string = givenName;
    	if(middleName) n+= ` ${middleName}`;
    	if(familyName) n+= ` ${familyName}`;
    	return n;
	}

	private constructProfileSortName ( {givenName, middleName, familyName }:IName ):string {   
    	return `${familyName}`;
	}

	private _randomInt = (min:number, max:number):number => {
    	return randomNumber({min, max, integer:true});
	}

	private _coreProps (uPolicy:any) {
    	return {
        	userName: `${uPolicy.givenName}${uPolicy.familyName}${uPolicy.number}`,
        	url:  `${uPolicy.givenName}_${uPolicy.familyName}_${uPolicy.number}`
    	}
	}

	private _sliceMe (obj:any, prop:string, pos:number):string {
    	return obj[prop].toString().slice(0, pos).trim().toLowerCase();
	}

	private _uPolicy (user:any) {
    	return  {
        	'givenName': this._sliceMe( user.profile.personalia, 'givenName', 4),
        	'familyName': this._sliceMe( user.profile.personalia, 'familyName', 5),
        	'number': this._randomInt(1001, 3999)
    	}
	}

	private constructCredentials (u:any) {   
    	const uPolicy:any = this._uPolicy(u);
        const credentials:any = this._coreProps(uPolicy);
    	return credentials;
	}
	
	/***
	* 
	*/
	protected setCoreIdentifiers(
		u:any, 
		form:IUserApplication | IClientApplication | ICustomerApplication, 
		userRole:number
	) {

		u.core.identifier = uuidv1();
		u.core.email = form.email;
		return u;
	}

	/***
	 * 
	 */
	protected setSecurity(
		u:any, 
		form:IUserApplication | IClientApplication | ICustomerApplication, 
		userRole:number, 
		encrypt:IEncryption,
		verified:boolean
	) {

		// password encryption method and hash value
		u.password.value = encrypt.hash;
		u.password.method = encrypt.method;	

		// confirm assigned user role
		u.security.accountType = userRole;		
		u.core.role = userRole;	

		// set account is verified to false as we await confirmation email
		u.security.isAccountVerified = verified;

		// set encrypted to true
		u.security.isPasswordEncrypted = true; 

		// assign identifier added to JSON Web Token for client
		u.accounts.localID = form.email;

		return u;
	}

	/***
	 * 
	 */
	protected setExternalThumbnail(u:any, v:boolean) {
		u.configuration.hasExternalThumbnailUrl = false;
		return u;
	}

	/***
	 *
	 */
	protected setPersonalia(
		u:any, 
		form:IUserApplication | IClientApplication | ICustomerApplication
	) {
		// given name <firstName>
		u.profile.personalia.givenName = capitalizeString(form.firstName);

		// middle name
		if(LOCAL_AUTH_CONFIG.requireMiddleName) {
			u.profile.personalia.middleName = capitalizeString(form.middleName);
		}

		// family name <lastName>
		u.profile.personalia.familyName = capitalizeString(form.lastName);

		return u;
	}

	/***
	 *
	 */
	protected setDisplayNames(
		u:any, 
		form:IUserApplication | IClientApplication | ICustomerApplication
	) {

		let n:IName = {
			givenName:form.firstName, 
			middleName:form.middleName,
			familyName:form.lastName
		}

		u.profile.displayNames.fullName = this.constructProfileFullName(n);
		u.profile.displayNames.sortName = this.constructProfileSortName(n);

		return u;
	}	

	/***
	 *
	 */
	protected setCredentials(u:any) {

		const credentials:any = this.constructCredentials(u);
		u.core.userName = credentials.userName;
		u.core.url = credentials.url;  
		return u;
	}

	protected _toLocalTime(ts:number):Date {
		
		let date:Date = new Date(ts);
		let offset = (new Date().getTimezoneOffset() / 60) * -1;
		let newDate:Date =new Date( ts + ( offset * 60 * 60 * 1000 ));
		return newDate;
	}

	/***
	 * Default DateTimeFormatter
	 */
	protected dateTimeFormatter() {

	    let ts:number = Math.round(+new Date());
	    let date:Date = this._toLocalTime(ts);
	    let isoDate:string = moment(
	    	this._toLocalTime(ts).toISOString())
	    		.tz( TIME_ZONE )
	    		.utc()
	    		.format();

	    return {
	    	ts,
	    	date, 
	    	isoDate
	    }


	}
}


