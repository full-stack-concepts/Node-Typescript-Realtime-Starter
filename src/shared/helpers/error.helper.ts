import { IError } from "../interfaces";

class ErrorMessagesHelper {	

	static returnUnspecifiedError():IError {
		return this.getType('9999');
	}

	static buildErrorMessage (errorNumber:number, done:Function):IError {		

		let error:IError;

		// extract numbers from string
		let errorType = errorNumber.match(/\d/g);		
		errorType = String(errorType);

		if(!errorType || (errorType && typeof errorType != "string") || (errorType && errorType.length < 4) ) {
			error = this.returnUnspecifiedError();		
		} else {
			error = this.getType(errorType);
		}

		return done(error);	
	}

	static getType(errorType:string):IError {	
		console.log('==> processing error ', errorType);
		let error:IError;
		switch(type) {			

			// default error message
			default: error = { type: 9999, message: 'An unexpected error has occured. The issue has been logged and will be investigated by our engineers.'}; break;
		}

		return;
	}	

}





