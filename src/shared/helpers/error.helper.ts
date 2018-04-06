import { IError } from "../interfaces";

export class ErrorMessages {	

	static get (errorNumber:number, stack?:any, done?:Function):IError {			

		let error:IError, 
			errorType = errorNumber.toString();		

		if(!errorType || (errorType && typeof errorType != "string") || (errorType && errorType.length < 4) ) {					
			error =  this.getType('9999');
		} else {
			error = this.getType(errorType, stack);
		}

		if(done && typeof done === 'function') {
			return done(error);	
		} else {
			return error;
		}		
	}

	// #TODO: replace errors with JSON file
	static getType(errorType:string, stack?:any):IError {	
	
		let error:IError;
		switch(errorType) {		

			/***
			 * Google User Authentication
			 */
			case '1030': 
				error = { 
					dataType: 'user', 
					action: 'authentication', 
					provider: 'google',
					number: 1030, 
					message: 'Authenticated Google user is not a natural person (business or organization).'
				}; 
				break;

			case '1031':
				error = { 
					dataType: 'user', 
					action: 'authentication', 
					provider: 'google',
					number: 1031, 
					message: 'Authenticated Google user has no public ID or default Google Identifier.'
				}; 
				break;

			case '1032':
				error = { 
					dataType: 'user', 
					action: 'authentication', 
					provider: 'google',
					number: 1032, 
					message: 'No valid user name could be constructed for authenticated Google user.'
				}; 
				break;

			case '1033':
				error = { 
					dataType: 'user', 
					action: 'authentication', 
					provider: 'google',
					number: 1033, 
					message: 'No email account could be extracted from authenticated Google user\'s profile.'
				}; 
				break;

			case '1034':
				error = { 
					dataType: 'user', 
					action: 'authentication', 
					provider: 'google',
					number: 1034, 
					message: 'No email account could be extracted from authenticated Google user\'s profile.'
				}; 
				break;

			/***
			 * Google User Authentication
			 */

			case '8010':
				error = { 
					dataType: 'user', 
					action: 'save', 
					provider: 'database',
					number: 8010, 
					message: 'An error occured when saving new user',
					stack: stack
				}; 
				break

			// default error message
			case '9999':		
			default: error = { number: 9999, message: 'An unexpected error has occured. The issue has been logged and will be investigated by our engineers.'}; break;
		}

		return error;
	}	
}





