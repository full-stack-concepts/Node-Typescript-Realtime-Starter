import path from "path";
import Promise from  "bluebird";
import jsonFile from  "jsonfile";
import fs from "fs-extra";
import { Observable, BehaviorSubject } from "rxjs";
const rootPath  = require("app-root-path");

import {cloneArray} from "../util";

interface ErrorDefinition {		
	action?: string, 
	provider?:string,
	number?: number,
	message?: string
}

export class ErrorController {

	private errorsSubject:BehaviorSubject<ErrorDefinition[]> = new BehaviorSubject<ErrorDefinition[]>([]);
   	private errors$: Observable<ErrorDefinition[]> = this.errorsSubject.asObservable();

	constructor() {
	}

	public build() {

		let $file = path.join(rootPath.path.toString(), "src", "controllers", "errors", "error.definitions.json");
		let errorDefinitions:any;
		let error:any;		

		try { 
			if(!fs.existsSync($file)) throw new Error();
			let getDefinitions = Promise.promisify(jsonFile.readFile);			
			getDefinitions($file).then( (errorDefinitions:ErrorDefinition[]) => {			
				this.errorsSubject.next(errorDefinitions);
				return Promise.resolve();	
			});			
		}
		catch(e) { error = e; }
		finally {
			if(error) {
				console.error("Critical Error: could not load error definitions.")
				process.exit(1);
			}
		}
	}	

	private getRange(number:number):ErrorDefinition[] {	

		let definitions:any = this.errorsSubject.value;		
		let range:ErrorDefinition[];
		switch(true) {
			case (number>=1000 && number<=2000): range = definitions.user; break;
		}
		return range;
	}

	public getErrorDefinition(number:number) {	
		
		let types:ErrorDefinition[] = this.getRange(number)		
		let pos = types.findIndex( (type:ErrorDefinition) => type.number === number );		
		let def:ErrorDefinition = types.splice(pos,1)[0];
		return Promise.resolve(def);
	}
}

export const errorController:ErrorController = new ErrorController();


