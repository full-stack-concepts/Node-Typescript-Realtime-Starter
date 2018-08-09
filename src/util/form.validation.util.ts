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

		let tests:any = [];	

		/*****
		 * password string has at least one capital
		 */
		const hasUpperCase:boolean = /[A-Z]/.test(pw);
		(PASSWORD_HAS_UPPERCASE)?tests.push({'category': 'hasUpperCase', 'value': hasUpperCase }):null;

		/*****
		 * password string has at least one lower case character
		 */
		const hasLowerCase:boolean = /[a-z]/.test(pw);
		(PASSWORD_HAS_LOWERCASE)?tests.push({'category': 'hasLowerCase', 'value': hasLowerCase }):null;

		/*****
		 * password string contains at least one number
		 */
		const hasNumbers:boolean = /\d/.test(pw);
		(PASSWORD_HAS_NUMBER)?tests.push({'category': 'hasNumbers', 'value': hasNumbers}):null;

		/*****
		 * password string has at least one special character
		 */
		const hasSpecialChars:boolean = /[-!$%^&*#@()_+|~=`{}\[\]:";'<>?,.\/]/.test(pw);
		(PASSWORD_HAS_SPECIAL_CHAR)?tests.push({'category': 'hasSpecialChars', 'value': hasSpecialChars}):null;

		/*****
		 * password string has required minlength
		 */
		const hasRequiredMinLength:boolean = (pw.length >= PASSWORD_MIN_LENGTH);	
		(PASSWORD_MIN_LENGTH)?tests.push({'category': 'hasRequiredMinLength', 'value': hasRequiredMinLength}):null;	

		/*****
		 * Password does not exceed max length
		 */
		const doesNotExceedMaxLength:boolean = (pw.length <= PASSWORD_MAX_LENGTH);	
		(PASSWORD_MIN_LENGTH)?tests.push({'category': 'doesNotExceedMaxLength', 'value': doesNotExceedMaxLength }):null;	
		

		let valid:boolean=true;
		Object.keys(tests).forEach( (k:string) => { if(!tests[k].value) valid=false;});

		return valid;			
		
	}

	public static isEmail(str:string):boolean {
		if(!str || str && typeof str != 'string') return false;	
		let emailRegEx:RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return emailRegEx.test(str);		
	}

	public static isString(str:string):boolean {
		return (!str || str && typeof str === 'string');
   	} 

   	public static isInteger(n:number):boolean {
		if(!n) n=0;
		return Number.isInteger(n);
	}

	public static isFloat(n:any):boolean {
		return !n &&  validator.isFloat(n.toString());
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
   		return (n>=min);
   	}

   	public static maxValue(n:number, max:number):boolean {   		   		
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

const getKeys = (obj:Object) => {
	return Object.keys(obj)
}

const addTypeError = (e:any, testField:any, type:any) => {
	e.push({ field: testField, message: 'Wrong Datatype', requiredType: type });
	return e;
}

export const validateFormObject = (form:any, validationObject:any) => {

	/*
	console.log("*****************************************************")
	console.log("Form: ", form)
	console.log("Validation ", validationObject)
	*/
	
	let formFields:string[] = getKeys(form);
	let testFields:string[] = getKeys(validationObject.fields);
	let e:any[] = [];	
	
	// loop form fields and validate
	testFields.map( (testField:string) => {

		let rules = validationObject.fields[testField];		

		/***
		 * Loop through rules
		 */
		Object.entries(rules).forEach( (entry:any) => {

			let rule = entry[0]; 
			let value = form[testField];		

			/***
		 	 * Test if form field is required
		     */
			if(rule === 'required' && rules[rule]) {			
				if(	!formFields.includes(testField) || !FormValidation.required(formFields[testField]) ) {					
					e.push({ field: testField, message: 'Field is required', type: rule });
				}
			}

			/***
			 * Test Datatype
			 */
			if(rule === 'type' && rules[rule] && formFields.includes(testField)) {

				let type:string = rules[rule];				
				
				switch(type) {

					// type: string
					case 'string': if(!FormValidation.isString(value)) e = addTypeError(e, testField, type);					
						break;

					// type: integer
					case 'int': if(!FormValidation.isInteger(value)) e = addTypeError(e, testField, type);
						break;

					// type: boolean
					case 'boolean': if(!FormValidation.isBoolean(value)) e = addTypeError(e, testField, type);
						break;

					// type: float
					case 'float': if(!FormValidation.isFloat(value)) e = addTypeError(e, testField, type);	
						break;

					// type: email
					case 'email': if(!FormValidation.isEmail(value)) e = addTypeError(e, testField, type);
						break;

					// type: url
					case 'url': if(!FormValidation.isURL(value)) e = addTypeError(e, testField, type);						
						break;
				};
			}


			/***
			 * Test minlength
			 */
			let requirement = rules[rule];		
			if(rule === 'minlength' && requirement && formFields.includes(testField)) {	
				if(	!FormValidation.minLength( value, requirement) ) {					
					e.push({ field: testField, message: `Minimum length of ${requirement} is required`, type: rule });
				}

			}

			/***
			 * Test maxlength
			 */
			if(rule === 'maxlength' && requirement && formFields.includes(testField)) {	
				if(	!FormValidation.maxLength( value, requirement) ) {					
					e.push({ field: testField, message: `Value exceeds maximum length of ${requirement} `, type: rule });
				}
			}

			/***
			 * Test minvalue
			 */
			if(rule === 'minvalue' && requirement && formFields.includes(testField)) {				
				if(	!FormValidation.minValue(value, requirement) ) {					
					e.push({ field: testField, message: `Minimum value of ${requirement} is required`, type: rule });
				}
			}

			/***
			 * Test maxvalue
			 */
			if(rule === 'maxvalue' && requirement && formFields.includes(testField)) {					
				if(	!FormValidation.maxValue(value, requirement) ) {					
					e.push({ field: testField, message: `Maximum value is ${requirement}`, type: rule });
				}
			}			
		});

	});

	/***
	 * Return error array
	 */
	console.log(e)
	return e;
}







