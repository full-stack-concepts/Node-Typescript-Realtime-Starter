import path from "path";
import Promise from  "bluebird";
import jsonFile from  "jsonfile";
import fs from "fs-extra";
import { Observable, BehaviorSubject } from "rxjs";
const rootPath  = require("app-root-path");

import {cloneArray} from "../util";
import {ErrorLogger} from "../controllers";

/***
 * Application Logging Settings
 */
import { 		
	LOG_SYSTEM_EVENTS, LOG_LOCALLY, LOG_REMOTE_ON_PAPERTRAIL_APP, LOGGER_PAPERTRAILAPP_HOST, LOGGER_PAPERTRAILAPP_PORT
} from "../util/secrets";

interface ErrorDefinition {		
	action?: string, 
	provider?:string,
	number?: number,
	msg?: string,
	stack?:any,
	errorType:number
}

type DefinitionsReadOnly = Readonly<ErrorDefinition[]>;

const ExitOnError = (err:Error) => {
	console.error("Critical Error Remote Logging: ", err.message)
	process.exit(1);
}

export class ErrorController {

	private errorsSubject:BehaviorSubject<ErrorDefinition[]> = new BehaviorSubject<ErrorDefinition[]>([]);
   	private errors$: Observable<ErrorDefinition[]> = this.errorsSubject.asObservable();

	constructor() {
	}

	public build() {


		let $file = path.join(rootPath.path.toString(), "src", "controllers", "errors", "error.definitions.json");
		let getDefinitions:any = Promise.promisify(jsonFile.readFile);		
	
		return getDefinitions($file)
		.then( (definitions: ErrorDefinition[]) => this.errorsSubject.next(definitions) )
		.then( () => { return Promise.resolve();})
		.catch( (err:Error) => ExitOnError(err) );	

	}	

	private getRange(number:number):DefinitionsReadOnly {			

		let definitions:any = this.errorsSubject.value;			
		let range:DefinitionsReadOnly;		
		switch(true) {
			case (number>=2000 && number<3000): range = definitions.server; break;
			case (number>=5000 && number<10000): range = definitions.uncaught; break;
			case (number>=10000 && number<=11000): range = definitions.critical; break;
			case (number>=11000 && number<12000): range = definitions.user; break;
			case (number>=12000 && number<13000): range = definitions.systemuser; break;
		}
		return range;
	}

	public getErrorDefinition(number:number) {	
		
		let types:DefinitionsReadOnly = this.getRange(number)		
		let pos = types.findIndex( (type:ErrorDefinition) => type.number === number );		
		let def:ErrorDefinition = types.splice(pos,1)[0];
		return Promise.resolve(def);
	}

	/***
	 * err:
	 */
	public analyseErrorType(err:Error):number {
		
		let errorType:number;

		enum Types {
			EvalError,		
			RangeError,
			ReferenceError,
			SyntaxError,
			TypeError,
			URIError
		};

		switch(true) {
			case (err instanceof EvalError): errorType=Types.EvalError; break;			
			case (err instanceof RangeError): errorType=Types.RangeError; break;
			case (err instanceof ReferenceError): errorType=Types.ReferenceError; break;
			case (err instanceof SyntaxError): errorType=Types.SyntaxError; break;
			case (err instanceof TypeError): errorType=Types.TypeError; break;
			case (err instanceof URIError): errorType=Types.URIError; break;
			default: errorType = 0;
		};

		return errorType;
	}

	/***
	 * @errorID: number
	 * @err: Object || any
	 */
	public log(errorID:number, err:any) {			

		if(!err || Number.isInteger(err)) err = {};

		console.log(errorID, err)	

		let types:DefinitionsReadOnly = this.getRange(errorID);			
		let def:ErrorDefinition = types.find( (type:ErrorDefinition) => type.number === errorID );

		// repair error type if necessary
		if(!err.hasOwnProperty("message")) err.message="";
		if(!err.hasOwnProperty("stack")) err.stack = "";	

		// analayse error
		def.errorType = this.analyseErrorType(err);	

		// format error massage and stack property
		// def.msg = `${def.msg}: ${err.message}`;
		def.stack = JSON.stringify(err.stack);		

		// log locally only
		if(LOG_LOCALLY) {
			ErrorLogger.error(def);
		}	

		// log locally and to remove provider
		if(LOG_REMOTE_ON_PAPERTRAIL_APP) {			
			ErrorLogger.info(def);
		}	
	}	

	public getMessage(errorID:number) {			
		let types:DefinitionsReadOnly = this.getRange(errorID);					
		let def:ErrorDefinition = types.find( (type:ErrorDefinition) => type.number === errorID );		
		return def.msg;
	}

}

export const errorController:ErrorController = new ErrorController();


