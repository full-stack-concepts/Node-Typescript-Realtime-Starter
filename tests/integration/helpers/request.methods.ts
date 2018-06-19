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

	/****
	 * Test Environment
	 * Only run a route test if Express mode is http and Redis is disabled
	 */
	testEnvironment() {		
		if(EXPRESS_SERVER_MODE==='https') {
			console.error("TESTING ENV ERROR: Test routes with express in http mode and disable any Redis Server")
			process.exit(1);
		}
	}


	/***
	 * POST METHOD
	 */
	post(url:string, data:any) {
			
		return new Promise( (resolve, reject) => {
			 request({
				method: 'POST',
				uri:url,
				form:data,
				gzip:true,
				headers: {'Content-Type': 'application/json'}
			},
			(error:any, response:any, body:string) => {
				const r:IResponse = {error, response, body};					
				(error)?reject(error):resolve(r);
			});
		});		
	}
}

