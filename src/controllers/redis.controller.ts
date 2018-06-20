import redis from "redis";
import util from "util";

import {
	USE_LOCAL_REDIS_SERVER,
	AUTHENTICATE_REDIS_SERVER,
	REDIS_LOCAL_URL,
	REDIS_LOCAL_PORT,
	REDIS_LOCAL_PASSWORD,
	REDIS_READ_QUERIES_EXPIRATION_TYPE,
	REDIS_READ_QUERIES_EXPIRATION_TIME,
	REDIS_WRITE_QUERIES_EXPIRATION_TYPE,
	REDIS_WRITE_QUERIES_EXPIRATION_TIME

} from "../util/secrets";

import { ErrorLogger } from "../controllers";

export class RedisController  {	

	constructor() {
	}

	static localURL():string {
		return `${REDIS_LOCAL_URL}:${REDIS_LOCAL_PORT}`;
	}

	/***
	 * Set up Connection with Local Redis Server
	 */
	static async buildLocal() {				

		try {

			if(!USE_LOCAL_REDIS_SERVER)
				return Promise.resolve();

			const url:string = this.localURL();

			/***
			 * Create Redis client
			 */
			const client:any = redis.createClient(url);		

			/***
			 * Promisify Redis Client methods
			 */
			client.get = util.promisify(client.get);
			client.set = util.promisify(client.set);
			client.hset = util.promisify(client.hset);
			client.hget = util.promisify(client.hget);

			if(AUTHENTICATE_REDIS_SERVER) {
				client.auth( REDIS_LOCAL_PASSWORD, (err:any) => {
	    			if (err) throw err;
				});
			}		

			/****
			 * eturn Redis CLient to Bootstrap Controller
			 */			
			return Promise.resolve(client); 


		} catch(err) {
			
			let status:string =  `Critical Error - Could not connect to Redis Server ${err.message}`;
			let stack:string = JSON.stringify(err.stack) || "";		
			ErrorLogger.error({ section:'RedisController', eventID:10, status, stack });    			
		}
	}
}