import * as child from 'child_process';
import path from "path";
import { Observable, Subject, BehaviorSubject } from "rxjs";
const uuid = require("uuid/v1");
const appRoot = require("app-root-path");

import { 
	IEmailMessage, 
	IEmailSMTPOptions, 
	IAppMessage,
	IMessageID
} from "../../shared/interfaces";

import { cloneArray } from "../../util";

/****
 * Parent Class for any controller 
 * that communicates with a forked or 
 * spawned application
 */
export class AppControllerModel {

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

	protected  testSection(section:string):string {
		return (!section || typeof section !== 'string')? section='controller':section;
	}

	/****
	 *
	 */
	protected send(

		/***
		 * Controller Process Management
		 */
		controllerRequest:string, 

		/***
		 * Application Section Request
		 */
		message?:IEmailMessage, 

		/***
		 * identifies internal or external request
		 */
		section?:string

	):void {
		
		let queue:IMessageID[];
		let id:string = this.createID(); // message id

		/***
		 * Test for application section identifier	
		 */
		section = this.testSection(section); 

		/***
		 * Get a copy op the current messages queue, push new message ID and update messages queue
		 */
		queue = cloneArray(this.messagesQueueSubject.value);
		queue.push({ 
			id:id, 
			section
		});
		this.messagesQueueSubject.next(queue);

		/***
		 * Send message to forked process
		 */
		this.app.send({ 
			id,
			message,
			controllerRequest	
		});		
	}




}