// TODO Rewrite this class with JS Proxy
// TODO Add policy support for dynamic password validation

import {
	PASSWORD_MIN_LENGTTH,
	PASSWORD_HAS_UPPERCASE,
	PASSWORD_HAS_LOWERCASE,
	PASSWORD_HAS_NUMBER,
	PASSWORD_HAS_SPECIAL_CHAR
} from "./secrets";

export class FormValidation {

	public static testPassword(pw:string) {	

		console.log("*** Validate password ", pw);

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
		const hasRequiredMinLength:boolean = (pw.length >= PASSWORD_MIN_LENGTTH);	
		(PASSWORD_MIN_LENGTTH)?tests.push(hasRequiredMinLength):null;	
	
		return tests.every( (v:boolean) => v === true )			
		
	}
}