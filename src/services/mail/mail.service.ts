import { vsprintf } from 'sprintf-js';
import path from "path";
import fs from "fs-extra";
import { promisify } from "util";
const appRoot = require("app-root-path");

promisify(fs.readFile).bind(fs);
promisify(fs.stat).bind(fs);

export class MailService {	

	private rootPath:string = appRoot.path.toString();

	constructor() {
	}

	/***
	 * @trmplate: string
	 */
	private constructPathToTemplateDir(template:string):string {
		template  = `${template}.tpl`;
		return path.join( this.rootPath, 'src','controllers','mail', template);
	}

	private getTemplateFile($file:string):Promise<string> {

		return fs.stat($file)
		.then( () => fs.readFile($file, 'utf8') )
		.then( (tpl:string) => Promise.resolve(tpl) )
		.catch( (err:any) => Promise.reject(err) );		
	}

	private parseTemplate(tpl:string, data:any):Promise<string> {
		
		let err:any;
		let parsedTemplate:string;

		try { parsedTemplate = sprintf(tpl, data );	}
		catch(e) { err = e; }
		finally {
			return new Promise( (resolve, reject) => (err)?reject(err):resolve(parsedTemplate) );
		}
	}

	private buildMessage() {
		return;
	}

	public sendSystemEmail():void {
		console.log("-----------------------------------------------------")
		console.log("**** SEND SYSTEM EMAIL AS BOOTSTRAP SEQUENCE FINISHED")
		console.log("-----------------------------------------------------")
	}

}

export const mailService:MailService = new MailService();

