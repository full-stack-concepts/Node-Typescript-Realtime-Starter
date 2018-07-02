import stream from "stream";
import Transport from "winston-transport";
import moment from "moment-timezone";
import {createLogger, transports, format }  from 'winston';

import { ENVIRONMENT } from "../util/secrets";
import { logPaths, customLevels } from "./logging";

const { combine, timestamp, label, printf, metadata } = format;
const split = require("split");

/***
 * Application Settings
 */
import { EXPRESS_SERVER_MODE, TIME_ZONE } from "../util/secrets";

/***
 * Message Formatting
 */
import { tsFormatter, timestampToString } from "../util";

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

	const MESSAGE:string = 'message';

	// format metadata
	info = metaDataFormatter(info);
	info[MESSAGE] = JSON.stringify(info.message);
	return info;
});

/****
 * Transport: Application Log
 */
const applicationLogTransport:any = new transports.File({	
	level: 'application',	
	filename: logPaths.$application,	
	maxsize: 5242880, // 5MB
	maxFiles: 10	
});  

/****
 * Transport: Access Log
 */
const accessLogTransport = new transports.File({
	level: 'access',	
	filename: logPaths.$access,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
});

/****
 * Transport: Test Log
 */
const testLogTransport = new transports.File({
	level: 'test',	
	filename: logPaths.$tests,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
});

/****
 * Transport: Error Log
 */
const errorLogTransport = new transports.File({
	level: 'error',	
	filename: logPaths.$errors,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
});

/****
 * Transport: Mail Log
 */
const mailLogTransport = new transports.File({
	level: 'mail',	
	filename: logPaths.$mail,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
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

	transports: [	 
	 	applicationLogTransport
	]
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
		entryFormatter(),
		format.json()	
	),	

	// winston error handling
	exitOnError: false,	

	transports: [	 
	 	errorLogTransport
	]
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

	transports: [	 
	 	accessLogTransport
	]
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

	transports: [	 
	 	testLogTransport
	]
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

	transports: [	 
	 	mailLogTransport
	]
});


/***
 * Stream for HTTP Access Log
 */
export const HTTPLoggerStream:any = split().on('data', (message:any) => {
	HTTPLogger.access(message);
});
