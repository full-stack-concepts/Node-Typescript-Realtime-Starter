import * as child from 'child_process';
import path from "path";
import { Observable, Subject, BehaviorSubject } from "rxjs";
const uuid = require("uuid/v1");
const appRoot = require("app-root-path");

import {
	proxyService 
} from "../../services";

import { 
	IEmailMessage, 
	IEmailSMTPOptions, 
	IAppMessage,
	IMessageID
} from "../../shared/interfaces";

import { cloneArray } from "../../util";

import { ErrorLogger } from "../../controllers";

/****
 * Parent Class for any controller 
 * that communicates with a forked or 
 * spawned application
 */
export class AppControllerModel {

	/****
	 * proxyService
	 */
	protected proxyService:any = proxyService;

	/****
	 * Forked applications
	 */	
	 protected app:child.ChildProcess;

	/****
	 * Application Identifier
	 */
	protected appIdentifier:string;

	/****
	 * Root path
	 */
	protected rootPath = appRoot.path.toString();

	/****
	 * Controller Messages Queue
	 */
	protected messagesQueueSubject:BehaviorSubject<IMessageID[]> = new BehaviorSubject<IMessageID[]>([]);
	protected queue$: Observable<IMessageID[]> = this.messagesQueueSubject.asObservable();

	constructor() {		
	}	

	/***
	 *
	 */
	protected forkApplication(appIdentifier:string):void {
		this.appIdentifier = appIdentifier;
		let pathToFile:string = path.join(this.rootPath, 'src', 'apps', this.appIdentifier.toString() )		
		this.app = child.fork( pathToFile );
	}

	protected createID():string { return uuid(); }	

	/***
	 * 
	 */
	protected registerAppRequest(requestID:string):string {

		let queue:IMessageID[];
		let id:string = this.createID(); // message id

		queue = cloneArray(this.messagesQueueSubject.value);
		queue.push({ id, requestID });
		this.messagesQueueSubject.next(queue);

		return id;
	}

	/***
	 *
	 */
	protected removeAppRequest(queueID:string):void {
		
		let queue:IMessageID[];		
		let pos:number;
		let message:IMessageID[];	

		/***
		 * Clone messages queue and find message
		 */			
		queue = cloneArray(this.messagesQueueSubject.value);
		pos = queue.findIndex( (entry:IMessageID) => entry.id === queueID );

		/***
		 * Remove message from queue
		 */
		queue.splice(pos,1);
		this.messagesQueueSubject.next(queue);			
	}

	/***
	 * log any error for child class or forked process
	 * @section:string -> applicatoin section identifeir
	 * @eventID: number -> event identifier	
	 * @msg:string -> error description string
	 * @trace:any -> error.stack
	 */
	protected logError(section:string, eventID:number, msg:string, trace:any):void {
		ErrorLogger.error({ section, eventID, status:false, msg, trace });				
	}


}