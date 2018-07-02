/***
 * Communication between controller and forked and spawned child application
 */

import { IEmailMessage } from "../../interfaces";

export interface IAppMessage {

	/****
	 * UUID Identifier used in Controller Queue
	 */
	queueID: string,

	/****
	 * MessageId -  UUID Identifier for registered email object
	 */
	messageId?:string,

	/***
	 * Constroller Request identifier: string
	 */
	controllerRequest?:string,

	/***
	 * EMail Content
	 */
	email?: IEmailMessage,

	/***
	 *
	 */
	status?:boolean,

	/***
	 * Error Stack
	 */
	trace?:any,

	/***
	 * Error Message
	 */
	message?:string

}