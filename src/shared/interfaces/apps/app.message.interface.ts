/***
 * Communication between controller and forked and spawned child application
 */
export interface IAppMessage {

	/****
	 * UUID Identifier 
	 */
	id: string,

	/***
	 * Constroller Request identifier: string
	 */
	controllerRequest?:string,

	/***
	 * Message Content
	 */
	message?: any

	/***
	 *
	 */
	status?:boolean,

	/***
	 *
	 */
	error?:any;

}