import Promise from "bluebird";
import fetch from "node-fetch";

import { proxyService } from "../../services";

import { ModelMethods } from "./methods.model";

/****
 * Custom Methods for MLAB Mongo Databse				
 */   
export class DefaultModel extends ModelMethods {	

	constructor() {

		super();

		this.configureSubscribers();		
	}

	protected configureSubscribers() {		

		/***
		 * Subsriber: get UserDB native connection
		 */		
		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			if(proxyService.userDB) {
				this.userDBConn = proxyService.userDB;				
			}
		});

		/***
		 * Subsriber: get Product DB native connection
		 */		
		proxyService.productDB$.subscribe( (state:boolean) => {				
			if(proxyService.productDB) this.productDBConn = proxyService.productDB;
		});

		/***
		 * Subsriber: 
		 */		
		proxyService.redisClient$.subscribe( (state:boolean) => {          
			if(proxyService.redisClient) this.redisClient = proxyService.redisClient;                 
   		});
	}


}