import stream from "stream";
import Transport from "winston-transport";
import {createLogger, transports, format }  from 'winston';
import Promise from  "bluebird";
import moment from "moment-timezone";
import jsonFile from  "jsonfile";
import fs from "fs-extra";
import path from "path";
import { Observable, BehaviorSubject } from "rxjs";
const rootPath  = require("app-root-path");

// Import Remote Loggers: PaperTrail
const Papertrail = require('winston-papertrail').Papertrail;

const split = require("split");

interface ILogger {
	logger:Function,
	level:string,
	transport:Function
}

/***
 * Application Logging Settings
 */
import { 		
	LOG_SYSTEM_EVENTS, LOG_LOCALLY, LOG_REMOTE_ON_PAPERTRAIL_APP, LOGGER_PAPERTRAILAPP_HOST, LOGGER_PAPERTRAILAPP_PORT
} from "../util/secrets";

import { 	
	logPaths, customLevels,
	ILogMessage,
	ApplicationLogger, ErrorLogger, HTTPLogger, HTTPLoggerStream, TestLogger, MailLogger,
	applicationLogTransport, accessLogTransport, testLogTransport, errorLogTransport, mailLogTransport 
} from "./logging";

// 
const ExitOnError = (err:Error) => {
	console.error("Critical Error Remote Logging: ", err.message)
	process.exit(1);
}

/***
 *
 */
const loggersCollection:ILogger[] = [
	{ logger: ApplicationLogger, level: 'application', transport: applicationLogTransport  },
	{ logger: ErrorLogger, level: 'error', transport: errorLogTransport },
	{ logger: HTTPLogger, level: 'access', transport: accessLogTransport },
	{ logger: TestLogger, level: 'test', transport: testLogTransport },
	{ logger: MailLogger, level: 'mail', transport: mailLogTransport },
];	

/***
 * Define remote Papertrail transport if required
 */
var remoteTransport:any;


// Under Development
const MethodDecorator = (
    target: Object, // The prototype of the class
    propertyKey: string, // The name of the method
    descriptor: TypedPropertyDescriptor<any>
) => {
    
    // save a reference to the original method this way we keep the values currently in the
    // descriptor and don't overwrite what another decorator might have done to the descriptor.
   	if(descriptor === undefined) descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    let originalMethod:Function = descriptor.value;
    let eventID:number;
    let logger:string;

    descriptor.value = function () {

    	let args:string[] = [];
        for (let _i:number = 0; _i < arguments.length; _i++) { args[_i - 0] = arguments[_i]; }

        eventID = parseInt(args[0]);
        logger = args[1];      

        return args
    }

     // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
}

export class LoggerController {

	private messagesSubject:BehaviorSubject<ILogMessage[]> = new BehaviorSubject<ILogMessage[]>([]);
   	private messages$: Observable<ILogMessage[]> = this.messagesSubject.asObservable();	

	/***
	 * Load Status messages from file
	 */
	public build() {					
				
		let $file = path.join(rootPath.path.toString(), "src", "controllers", "logging", "message.definitions.json");
		let getDefinitions:any = Promise.promisify(jsonFile.readFile);		
	
		return getDefinitions($file)
		.then( (definitions:ILogMessage[]) => this.messagesSubject.next(definitions) )
		.then( () => { return Promise.resolve();})
		.catch( (err:Error) => ExitOnError(err) );		
	}

	/***
	 * Configure Transports per defined Logger
	 */
	public configureTransportsPerLogger() {	

		return new Promise( (resolve, reject) => {

			if(LOG_LOCALLY) {
				loggersCollection.map( (entry:any, index:number) => entry.logger.add(entry.transport));
			}
		
			if(LOG_REMOTE_ON_PAPERTRAIL_APP) {

				const remoteTransport :any =  new Papertrail({
					host: LOGGER_PAPERTRAILAPP_HOST,
					port: LOGGER_PAPERTRAILAPP_PORT		
				});		

				remoteTransport.on('connect', (message:any) =>  { 					
					Promise.all(
						loggersCollection.map( (entry:any, index:number) => entry.logger.add(remoteTransport) )
					).then( () => resolve()).catch( (err:Error) => ExitOnError(err))					
				});				
			} else {
				resolve();
			}		
		});	
	}	

	public log(ID:number, level:string) {

		const defs:ILogMessage[] = this.messagesSubject.value;		
		const message:ILogMessage =  defs.find( (def:ILogMessage) => def.eventID === ID );				
		const loggerDefinition:ILogger = loggersCollection.find( (entry:ILogger) => entry.level === level );
		const logger:any = loggerDefinition.logger;
		
		if(LOG_LOCALLY) {
			logger[level](message);
		}

		if(LOG_REMOTE_ON_PAPERTRAIL_APP) {	
			console.log("**** LOG REMOTE ", ID)		
			logger.info(message);
		}		
	}	
}

export const loggerController:LoggerController = new LoggerController();





