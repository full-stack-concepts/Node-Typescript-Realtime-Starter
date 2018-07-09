import { transports  }  from 'winston';
import { logPaths, customLevels } from "../logging";


/****
 * Transport: Application Log
 */
export const applicationLogTransport:any = new transports.File({	
	level: 'application',	
	filename: logPaths.$application,	
	maxsize: 5242880, // 5MB
	maxFiles: 10	
});  

/****
 * Transport: Access Log
 */
export const accessLogTransport = new transports.File({
	level: 'access',	
	filename: logPaths.$access,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
});

/****
 * Transport: Test Log
 */
export const testLogTransport = new transports.File({
	level: 'test',	
	filename: logPaths.$tests,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
});

/****
 * Transport: Error Log
 */
export const errorLogTransport = new transports.File({
	level: 'error',	
	filename: logPaths.$errors,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
});

/****
 * Transport: Mail Log
 */
export const mailLogTransport = new transports.File({
	level: 'mail',	
	filename: logPaths.$mail,		
	maxsize: 5242880, // 5MB
	maxFiles: 3
});
