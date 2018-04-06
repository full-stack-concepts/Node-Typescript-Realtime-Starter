import { IError } from "../interfaces";

export class ErrorMessages {	

	static returnUnspecifiedError():IError {
		return this.getErrorMessage(9999);
	}

	static getErrorMessage (errorNumber:number, done?:Function):IError {		

		let error:IError, 
			errorType = errorNumber.toString();		

		if(!errorType || (errorType && typeof errorType != "string") || (errorType && errorType.length < 4) ) {		
			error = this.returnUnspecifiedError();		
		} else {
			error = this.getType(errorType);
		}

		if(done && typeof done === 'function') {
			return done(error);	
		} else {
			return error;
		}		
	}

	static getType(errorType:string):IError {	
		console.log('==> processing error ', errorType);
		let error:IError;
		switch(errorType) {			

			// default error message
			case '9999':		
			default: error = { type: 9999, message: 'An unexpected error has occured. The issue has been logged and will be investigated by our engineers.'}; break;
		}

		return error;
	}	
}





