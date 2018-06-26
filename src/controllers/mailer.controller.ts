import {
	AppControllerModel
} from "./lib/app.controller.model";

import { ApplicationLogger, ErrorLogger} from "../controllers";

import { 
	IEmailMessage, 
	IEmailSMTPOptions, 
	IAppMessage,
	IMessageID
} from "../shared/interfaces";

import { cloneArray } from "../util";

import {	
	mailService
} from "../services";

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
			process.exit(1)
		}
	}
}

export class MailController extends AppControllerModel {
	

    constructor() {
    	super();		
	}		

	public init():Promise<boolean> {

		let err:any;
		try {

			/***
			 * Fork child process
			 */	
			this.forkApplication(MAILER_APP)

			/***
			 * Configure Listeners
			 */
			this.configureListeners();	

			/***
			 * Emit verification EMail Provider Request
			 */				
			this.send('verify');		

			return Promise.resolve(true);
		}

		catch(e) {err = e;}
		finally {
			console.log(err);
		}
	}
	
	private configureListeners():void {

		this.app.on('message', ({id, controllerRequest, status, error}:IAppMessage) => {	

			let queue:IMessageID[];	
			let section:string;
			let pos:number;
			let message:IMessageID[];

			/***
			 * Clone messages queue and find message
			 */			
			queue = cloneArray(this.messagesQueueSubject.value);
			pos = queue.findIndex( (messageID:IMessageID) => messageID.id === id );

			/***
			 * Get section of MessageID for evaluation
			 */
			section = queue.slice(pos,1)[0].section;

			/***
			 * Remove message from queue
			 */
			queue.splice(pos,1);
			this.messagesQueueSubject.next(queue);			

			/***
			 * Evaluate <Section>: 
			 * (1) Internal <Controller>
			 * (2) External <Service>
			 */
			if(section === 'controller') {
				this.finalizeInternalRequest(controllerRequest, status, error);
			} else {
				this.finalizeExternalRequest(section, status, error);
			}	
		});

		/*** 
		 * Reboot on error then log
		 */
		this.app.on('exit', (err:any) => {

	        /***
	         * Log Critical System Error
	         */
	        ErrorLogger.error({
	            section: 'Mailer App',
	            eventID: 100,
	            status: `Mailer App crashed on error: ${err.message}`,
	            stack: JSON.stringify(err.stack)
	        });    

			/***
			 * Restart Application
			 */
			this.forkApplication(MAILER_APP);
		});	

	}

	/***
	 *
	 */
	private finalizeInternalRequest(controllerRequest:string, status:boolean, error:any) {
		console.log('*** FINALIZE INTERNAL REQUEST ')
		console.log(controllerRequest, status, error)
		if(status) {
			switch(controllerRequest) {
				case 'verify':
					ApplicationLogger.application({
						section: 'BootstrapController', 
						eventID: 1020, 
						action: 'SMTP Configuration Email Provider has been verified.'
					});
				break;
			}
		}

	}

	private finalizeExternalRequest(section:string, status:boolean, error:any) {
		console.log('*** FINALIZE EXTERNAL REQUEST ')
	}	

}

export const mailController:MailController = new MailController()

