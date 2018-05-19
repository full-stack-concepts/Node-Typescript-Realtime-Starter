// TODO Rewrite this class with JS Proxy

import urlRegex from "url-regex";
import validator from "validator";
const v = validator;

import {
	PASSWORD_MIN_LENGTH,
	PASSWORD_MAX_LENGTH,
	PASSWORD_HAS_UPPERCASE,
	PASSWORD_HAS_LOWERCASE,
	PASSWORD_HAS_NUMBER,
	PASSWORD_HAS_SPECIAL_CHAR,
	LOCAL_AUTH_CONFIG
} from "./secrets";

export class FormValidation {

	public static testPassword(pw:string) {			

		let tests:boolean[]=[];

		/*****
		 * password string has at least one capital
		 */
		const hasUpperCase:boolean = /[A-Z]/.test(pw);
		(PASSWORD_HAS_UPPERCASE)?tests.push(hasUpperCase):null;

		/*****
		 * password string has at least one lower case character
		 */
		const hasLowerCase:boolean = /[a-z]/.test(pw);
		(PASSWORD_HAS_LOWERCASE)?tests.push(hasLowerCase):null;

		/*****
		 * password string contains at least one number
		 */
		const hasNumbers:boolean = /\d/.test(pw);
		(PASSWORD_HAS_NUMBER)?tests.push(hasNumbers):null;

		/*****
		 * password string has at least one special character
		 */
		const hasSpecialChars:boolean = /[-!$%^&*#@()_+|~=`{}\[\]:";'<>?,.\/]/.test(pw);
		(PASSWORD_HAS_SPECIAL_CHAR)?tests.push(hasSpecialChars):null;

		/*****
		 * password string has required minlength
		 */
		const hasRequiredMinLength:boolean = (pw.length >= PASSWORD_MIN_LENGTH);	
		(PASSWORD_MIN_LENGTH)?tests.push(hasRequiredMinLength):null;	

		/*****
		 * Password does not exceed max length
		 */
		const doesNotExceedMaxLength:boolean = (pw.length <= PASSWORD_MAX_LENGTH);	
		(PASSWORD_MIN_LENGTH)?tests.push(doesNotExceedMaxLength):null;	

	
		return tests.every( (v:boolean) => v === true )			
		
	}

	public static isEmail(str:string):boolean {
		if(!str || str && typeof str != 'string') return false;	
		let emailRegEx:RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return emailRegEx.test(str);		
	}

	public static isString(str:string):boolean {
		return (!str || str && typeof str === 'string');
   	} 

   	public static required(value:any):boolean {   			
   		return (value !==null);
   	}

   	public static minLength(value:string, l:number):boolean {
   		if(!value) value="";   			
   		return (value.length >= l);
   	}

   	public static maxLength(value:string, l:number):boolean {
   		if(!value) value="";   				
   		return (value.length <= l);
   	}

   	public static minValue(n:number, min:number):boolean {
   		if(!n || isNaN(n)) return false;
   		return (n>=min);
   	}

   	public static maxValue(n:number, max:number):boolean {
   		if(!n || isNaN(n)) return false;   		
   		return (n<=max);
   	} 

   	public static isBoolean(v:any) {
   		if(!v) return true;
   		return (typeof v === 'boolean');
   	}

	/* <areacode> policy
	 * minlength: 6 chars
	 * maxlength: 6 chars
	 * 4 chars, 2 numbers
	 */
	public static testDutchAreacode(str:string):boolean {		
		if(!str || typeof str != 'string') return false;
		let testRegex:RegExp = /^[1-9][0-9]{3}[\s]?[A-Za-z]{2}$/;			
		return testRegex.test( str.toString() );	
	}

	public static isURL(url:string):boolean {	
		if(!url || typeof url != 'string') return false;
		return urlRegex().test( url.toString() )
	}

	public static isInteger(n:number):boolean {
		if(!n || isNaN(n)) return false;
		return Number.isInteger(n);
	}

	public static firstName(str:string) {
		return (str && v.isLength( str, { min:1, max:LOCAL_AUTH_CONFIG.validation.maxLengthFirstName }));
	}

	public static middleName(str:string) {
		return (str && v.isLength( str, { min:1, max:LOCAL_AUTH_CONFIG.validation.maxLengthMiddleName }));
	}

	public static lastName(str:string) {
		return (str && v.isLength( str, { min:1, max:LOCAL_AUTH_CONFIG.validation.maxLengthLastName }));
	}


}





