import Promise from "bluebird";
import fetch from "node-fetch";

import { proxyService } from "../../services";
// import { IUser, IListOptions } from "../interfaces";
// import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";
// const headers:any= { 'Content-Type': 'application/json' };

import { ModelMethods } from "./methods.model";

/****
 * Custom Methods for MLAB Mongo Databse				
 */   
export class DefaultModel extends ModelMethods {

	/****
	 * Native Connections
	 * inejected into Repository classes
	 */
	// userDBConn:any;
	// productDBConn:any;

	/****
	 * Repository
	 */
	// repo:any;

	/***
	 * Redis Client
	 */
	// redisClient:any;

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