/****
 * Wrapper for Request Methods
 */
import request from "request";

// Settings/
import { ENVIRONMENT, EXPRESS_SERVER_MODE, SITE_URL, PORT } from "../../../src/util/secrets";

import {IResponse} from "../../../src/shared/interfaces";

export class RequestMethods {
	

	// Use Proxy to broke acceess to puppeteer Page class
	static async build() {	

		type property = keyof RequestMethods;
		
		const methods:any =  new RequestMethods();

		return new Proxy( methods, {
			get: (target:any, property:any)  => {
				 return methods[property];
			}
		})
	}

	/***
	 * Helper Methods
	 */
	static defaultURL = ():string => {
		if('dev' === ENVIRONMENT) {
			return `${SITE_URL}`;
		} else {
			return null;
		}
	}

	/***
	 * POST METHOD
	 */
	post(url:string, data:any) {

		console.log("*****************************************")
		console.log(url, data)

		return new Promise( (resolve, reject) => {
			 request({
				method: 'POST',
				uri:url,
				form:data,
				headers: {'Content-Type': 'application/json'}
			},
			(error:any, response:any, body:string) => {
				const r:IResponse = {error, response, body};					
				(error)?reject(error):resolve(r);
			});
		});		
	}
}


