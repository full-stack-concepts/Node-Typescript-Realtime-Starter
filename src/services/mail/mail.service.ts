import { sprintf, vsprintf } from 'sprintf-js';
import path from "path";
import fs from "fs-extra";
import { promisify } from "util";
import { v4 as uuid} from "uuid";
const appRoot = require("app-root-path");


promisify(fs.readFile).bind(fs);
promisify(fs.stat).bind(fs);

import { 
	SYSTEM_ADMIN_EMAIL,
	SMTP_AUTH_USER
} from "../../util/secrets";

import {
	proxyService
} from "../../services";

import { tsFormatter, timestampToString, deepCloneObject } from "../../util";
import { 
	ISystemTemplateData,
	IEmailMessage 
} from "../../shared/interfaces";

export const templates = {
	SYSTEM_EMAIL: 'application.message.tpl'
}

import {
	TemplateDataDefinitions
} from "../../controllers/mail/definitions/data.definitions";

import {
	TEmailMessage
} from "../../controllers/mail/types/message.type";


export var defaultTemplateData:ISystemTemplateData = {
	date: timestampToString(),
	time: tsFormatter(),
	email: SYSTEM_ADMIN_EMAIL
}

export class MailService {	

	private rootPath:string = appRoot.path.toString();

	private dataDefinitions:any = TemplateDataDefinitions;

	private dataPositionsArray:any;

	constructor() {
		this.formatDataDefinitions();
	}

	/***
	 * Format Definitions
	 * each definition is an object with a numerical keys and a tring key that refers to this numerical key (position)	 
	 * filter definitions object so we can match any string key to its positoin
	 */
	private formatDataDefinitions():void {

		 const _keys = Object.keys(TemplateDataDefinitions);

		 const stringKeys = _keys.filter( (x:any) => Number.isNaN(parseInt(x, 10) ) )

		 // match key to position array
		 this.dataPositionsArray = stringKeys.map( (key:any) => {
		 	return { key, pos: TemplateDataDefinitions[key] };
		 });
	}


	/***
	 * @template: string
	 */
	private constructPathToTemplateFile($file:string):Promise<string> {	
		return Promise.resolve(
			path.join( this.rootPath, 'src','controllers','mail', 'templates', $file)
		);
	}

	/****
	 *
	 */
	private getTemplateFile($file:string):Promise<string> {		

		return fs.stat($file)
		.then( () => fs.readFile($file, 'utf8') )
		.then( (tpl:string) => Promise.resolve(tpl) )
		.catch( (err:Error) => Promise.reject(err) );		
	}

	/****
	 *
	 */
	private getDataDefinition(identifier:string):Promise<ISystemTemplateData> {				

		 let index:number = this.dataPositionsArray.filter( (item:any) => identifier === item.key)[0].pos;
		 let definition:ISystemTemplateData = this.dataDefinitions[index];	

		 return Promise.resolve(definition);
	}

	/***
	 * @tpl: string - raw sprintf template
	 * @definition:ISystemTemplateData - data object to be merged with raw sprintf template
	 */
	private parseTemplate(
		tpl:string, 
		definition:ISystemTemplateData
	):Promise<string> {
		
		let err:Error;
		let parsedTemplate:any;

		try { parsedTemplate = sprintf(tpl, definition );	}
		catch(e) { err = e; }
		finally {
			return new Promise( (resolve, reject) => (err)?reject(err):resolve(parsedTemplate) );
		}
	}

	/***
	 *
	 */
	private createMessage(	

		definition:ISystemTemplateData,
		html:string='',
		disableFileAccess:boolean=false,
		disableUrlAccess:boolean=false

	):Promise<IEmailMessage> {

		let email:IEmailMessage = deepCloneObject(TEmailMessage);
		let err:Error;	

		try {

			/***
			 * Creatse unique identifier for this message
			 */
			email.messageId = uuid();

			/***
			 * Email address of the sender
			 */
			(definition.from)? email.from = definition.from : null;

			/***
             * Email address that will appear on the <Sender> field
             */
            (definition.sender)? email.sender = definition.sender : null;

            /***
             * Email address that will appear on the <Reply-To> field
             */
            (definition.replyTo)? email.replyTo = definition.replyTo: null;

            /***
             * Comma separated list or an array of recipients email addresses 
             */
            (definition.to)? email.to = definition.to : null;

            /***
             * Allow service to send email with empty subject line
             */
            (definition.subject)? email.subject = definition.subject : email.subject = "";

            /***
             * Assign HTML
             */
            email.html = html;

            /***
             *  if true, then does not allow to use files as content. Use it when you want to use JSON data from untrusted source as the email.
             */
            email.disableFileAccess = disableFileAccess;

            /***
             *  If true, then does not allow to use Urls as content. If this field is also set in the transport options, then the value in mail data is ignored
             */     
            email.disableUrlAccess= disableUrlAccess;		           

		}

		catch(e) { err = e; }

		finally {			
			return new Promise( (resolve, reject) => {
				(err)? reject(err):resolve(email);
			});
		}

	}

	/****
	 *
	 */	
	public async sendSystemEmail(identifier:string, errorID:number) {	

		let err:Error;

		try {

			// (1) construct path to required template file
			const $path:string = await this.constructPathToTemplateFile(templates.SYSTEM_EMAIL);

			// (2) get template file
			const tpl:string = await this.getTemplateFile($path);

			// (3) get template data definition
			const definition:ISystemTemplateData  = await this.getDataDefinition(identifier);

			// (4) parse data object into HTML
			const html:string = await this.parseTemplate(tpl, definition);		

			// (5) create message object for forked mailer app
			const email:IEmailMessage = await this.createMessage(definition, html );

			// (6) emit send request to mailerController
			console.log("(1) Set next mail")
			proxyService.setNextEmail(email);
			// proxyService.sendEmail$.next(email);

		} 	

		catch (e) { err = e;}
		finally {
			console.log(err)
		}	

	}



}

export const mailService:MailService = new MailService();

