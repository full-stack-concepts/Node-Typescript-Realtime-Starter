/***
 * Default Interface for log messages
 */
export interface ILogMessage {
	section?:string,
	eventID?:number,
	action?:string,
	status?:boolean,
	stack?: string, // stringified
	error?:string
}

