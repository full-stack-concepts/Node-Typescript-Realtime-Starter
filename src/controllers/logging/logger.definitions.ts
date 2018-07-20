import {createLogger,format }  from 'winston';

import { logPaths, customLevels } from "../logging";

/***
 * Import Remote Loggers: PaperTrail
 */
const Papertrail = require('winston-papertrail').Papertrail;

const split = require("split");

/***
 * Message Formatting
 */
import { tsFormatter, timestampToString } from "../../util";

import { 
	ENVIRONMENT, 
	LOG_SYSTEM_EVENTS,
	LOG_LOCALLY,
	LOGGER_PAPERTRAILAPP_HOST,
	LOGGER_PAPERTRAILAPP_PORT 
} from "../../util/secrets";

const { combine, timestamp, label, printf, metadata } = format;

const stringFormat = printf ( (info:any) => {
	const ts:string = tsFormatter().toString();
	const tsString:string = timestampToString();
	return ` [${info.label}] - ${tsString} - ${ts} - ${info.level}: ${info.message}`;
});

/****
 * Formats Winston <metadata> object
 * @info: Winston Log Message
 */
const metaDataFormatter = (info:any):string => {

	let label:string, environment:number, ts:number = tsFormatter();

	if(ENVIRONMENT==='dev') {  label = 'Development'; environment = 1;	} 
	else { label = 'Production'; environment =  2;}
	info.metadata = JSON.stringify({ label, environment,  ts });
	return info;
}

/****
 *
 */
const MESSAGE:string = 'message'
export const entryFormatter = format( (info:any, opts:any) => {	

	// format metadata
	info = metaDataFormatter(info);
	info[MESSAGE] = JSON.stringify(info.message);
	return info;
});

/****
 *
 */
export const entryErrorFormatter = format( (info:any, opts:any) => {

	let raw = info;
	let label:string, 
		environment:number, 
		ts:number = tsFormatter();

	if(ENVIRONMENT==='dev') {  
		label = 'Development'; 
		environment = 1;	
	} 
	else { 
		label = 'Production'; 
		environment =  2;
	}

	/***
	 * BuiLd Error Metadata Object
	 */
	info.metadata = { 		
		label, 										// @string, environment type
		environment,								// @number: environemnt type
		ts,											// @number: timestamp in ms
		action:		info.message.action,			// @string: application section identifier
		provider:	info.message.provider,          // @string: microservice identifier
		eventID: 	info.message.number,			// @number: errorID
		stack: 		info.message.stack, 				// @string:	strinigfied error trace
		errorType:	info.message.errorType 			// @number: JavaScript error constructor
	};

	/***
	 * Overwrite 
	 */
	info.message = info.message.msg;

	return info;	
});

/****
 * Application Logger
 */
export const ApplicationLogger:any = createLogger({	

	// message level scheme
	levels: customLevels.levels,	
	
	format: combine(		
		metadata(),
		timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ssss' }),
		entryFormatter(),
		format.json()	
	),	

	// winston error handling
	exitOnError: false,	
	transports: []
});


/****
 * Error Logger
 */
export const ErrorLogger:any = createLogger({	

	// message level scheme
	levels: customLevels.levels,	
	
	format: combine(		
		metadata(),
		timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ssss' }),
		entryErrorFormatter(),
		format.json()	
	),	

	// winston error handling
	exitOnError: false,	
	transports: []	
});


/****
 * HTTP Logger
 */
export const HTTPLogger:any = createLogger({

	// message level scheme
	levels: customLevels.levels,	
	
	format: combine(
		label({ label: 'HTTP-SERVER' }),
		stringFormat
	),	

	// winston error handling
	exitOnError: false,	

	transports: []
});


/****
 * Tests Logger
 */
export const TestLogger:any = createLogger({

	// message level scheme
	levels: customLevels.levels,	
	
	format: combine(		
		metadata(),
		timestamp(),
		entryFormatter(),
		format.json()	
	),	

	// winston error handling
	exitOnError: false,	

	transports: []
});


/****
 * Mail Logger
 */
export const MailLogger:any = createLogger({

	// message level scheme
	levels: customLevels.levels,	
	
	format: combine(		
		metadata(),
		timestamp(),
		entryFormatter(),
		format.json()	
	),	

	// winston error handling
	exitOnError: false,	

	transports: []
});


/***
 * Stream for HTTP Access Log
 */
export const HTTPLoggerStream:any = split().on('data', (message:any) => {
	HTTPLogger.access(message);
});




