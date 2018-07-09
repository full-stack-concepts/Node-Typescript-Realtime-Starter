import { Observable, BehaviorSubject} from "rxjs";
import 'rxjs/add/operator/switchmap';
import "rxjs/add/observable/of";

import {
	AppControllerModel
} from "./lib/app.controller.model";

import { LoggerController, ErrorLogger, MailLogger } from "../controllers";

import { 
	IEmailMessage, 
	IEmailSMTPOptions, 
	IAppMessage,
	IMessageID
} from "../shared/interfaces";

import { cloneArray } from "../util";
import { mailService } from "../services";

const MAILER_APP:string = 'mailer.app.js'

/****
 * Mail Actions Controller
 */
export class MAController {

	/***
	 *  Use Proxy to broke acceess to Mailer Actions
	 */
	static async build() {		

		try {

			const controller:any = new MailController();

			return new Proxy( controller, {
				get: await function(target:any, property:any) {				
					return mailService[property];				 	
				}
			});		

		} catch(e) {	
			process.exit(1);
		}
	}
}

export class MailController extends AppControllerModel {

	/***
	 *
	 */
	private emailsSubject:BehaviorSubject<IEmailMessage[]> = new BehaviorSubject<IEmailMessage[]>([]);
	protected emails$: Observable<IEmailMessage[]> = this.emailsSubject.asObservable();

	/***
	 * Identifier for Logger
	 */
	private section:string = 'MailController';

    constructor() {    	
    	super();		
    	this.localSubscribers();
	}		

	/***
	 * 
	 */
	private localSubscribers():void {

		const registerEmail:Function = this.registerEmail;

		/****
		 * Register Message before forwarding to to the processManager
		 */
		this.proxyService.sendEmail$.switchMap( async (state:boolean) => {  

			let email:IEmailMessage;			
			let isRegistered:boolean;

			email = this.proxyService.getNextEmail();    
       		if(state && email) {       			
       			isRegistered = await registerEmail(email);       			       	
       			if(isRegistered) {	return email; } else {return {}; }       			
       		} else {
       			return {};
       		}       		
       	}).subscribe( (email:IEmailMessage) => {
       		if(email && email.messageId) this.processEmail(email);
     	});       
	}

	/***
	 * Register Message (use class property to maintain this reference to class context)
	 */
	private registerEmail = (email:IEmailMessage):Promise<boolean> => {

		let messageId:string = email.messageId;
		let queue:IEmailMessage[];	
		let pos:number;
		let registered:boolean;

		// clone queue and try to find email object
		queue = cloneArray(this.emailsSubject.value);
		pos = queue.findIndex( (email:IEmailMessage) => email.messageId === messageId );		

		// insert email object if necessary
		if(pos === -1) {
			queue.push(email);
			registered=true;
		} else {
			registered = false;
		}
	
		// updpate queue
		this.emailsSubject.next(queue);

		return Promise.resolve(registered);
	}

	/***
	 *
	 */
	private removeEmailFromQueue(messageId:string):void {

		let queue:IEmailMessage[];
		let pos:number;
		let email:IEmailMessage;
		let section:string;

		queue = cloneArray(this.emailsSubject.value);
		pos = queue.findIndex( (entry:IEmailMessage) => entry.messageId === messageId );
		queue.splice(pos,1);
		this.emailsSubject.next(queue);		
	}

	/***
	 *
	 */
	private processEmail(email:IEmailMessage) {	
		let messageID:string = this.registerAppRequest(email.messageId);
		this.send(messageID, email, null);		
	}

	/***
	 * Send message to forked process
	 */
	protected send(id:string, email:IEmailMessage, controllerRequest:string ) {
		this.app.send({ id,	email, controllerRequest });		
	}	

	/***
	 *
	 */
	public init():Promise<boolean> {

		let error:any;
		try {

			/***
			 * Fork child process
			 */	
			this.forkApplication(MAILER_APP)

			/***
			 * Configure Forked App Listeners
			 */
			this.configureAppListeners();	

			/***
			 * Emit verification EMail Provider Request
			 */				
			this.send(null, null, 'verify');		

			return Promise.resolve(true);
		}

		catch(e) {error = e;}
		finally {
			if(error) {
			ErrorLogger.error({ 
				section: this.section,
				eventID: 8002,
				status: false,			
				msg: error.message,			
				trace: error.trace			
			});    
			}			
		}
	}	
	
	
	private configureAppListeners():void {

		this.app.on('message', ({
			queueID, 
			messageId, 
			controllerRequest, 
			email, 
			status, 
			trace,
			message
			 
		}:IAppMessage) => {				

			/***
			 * Remove app message ID from parental master queue
			 * @queueID:string
			 */
			this.removeAppRequest(queueID);

			/***
			 * Evaluate <Section>: 
			 * (1) Internal <Controller>
			 * (2) External <Service>
			 */
			if(controllerRequest) {
				this.finalizeInternalRequest(controllerRequest, status, trace, message);
			} else {

				/***
				 * Remove email ID from emails queue
				 */				
				this.removeEmailFromQueue(messageId);

				/***
				 * Log email result
				 */
				this.logResult(email, status, trace, message)
			}	
		});

		/*** 
		 * Reboot on error then log
		 */
		this.app.on('exit', (error:any) => {		

	        /***
	         * Log Critical System Error
	         */
	        let trace:any = error.stack;
	        this.logError(this.section, 8002, `Mailer App crashed on error: ${error.message}`, trace);    

			/***
			 * Restart Application
			 */
			this.forkApplication(MAILER_APP);
		});	

	}

	/****
	 * @email: IEmailMessage -> email object 
	 * @status: boolean -> send state of email
	 * @trace:any -> error.stack
	 * @errorMessage:string -> error.message
	 * @eventID:number -> event identifier
	 */
	private logResult(
		email:IEmailMessage, 
		status:boolean, 
		trace:any,
		errorMessage:string,
		eventID:number=8001
	):void {		
		// Log result		
		if(status && !errorMessage) {
			MailLogger.mail({ 
				section: this.section, 
				eventID: eventID, 
				from: email.from, 
				to: email.to, 
				subject: email.subject, 
				delivered: true 
			});	

		// Log error 
		} else if(!status && errorMessage) {
		 	this.logError(this.section, 8002, errorMessage, trace); 			
		}
	}		

	/***
	 * Internal Controller Handler
	 * @controllerRequest:string -> process request for child process	
	 */
	private finalizeInternalRequest(
		controllerRequest:string, 
		status:boolean, 
		trace:any, 
		errorMessage:string
	) {		
		if(status) {
			switch(controllerRequest) {
				case 'verify':
					
				break;
			}
		}
	}	

}

export const mailController:MailController = new MailController()

