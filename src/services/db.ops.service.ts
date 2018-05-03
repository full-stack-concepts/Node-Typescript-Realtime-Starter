import Promise from "bluebird";

import { proxyService } from "../services";

export class DBOpsService {

	/***
	 * Proxy Service
	 */
	proxyService:any;

	/***
	 * Instance of Mongo CLient
	 */
	adminDB:any;

	constructor() {

		this.proxyService = proxyService;

		// configure local subscribers
		this.configureSubscribers();
	}

	/****
	 * Class subscribers
	 */
	private configureSubscribers():void {		

		/****
		 * Subscriber: when proxyService flags that Mongoose Client is connected to Admin DB
		 * get instance through get call to proxy service
		 */		
		this.proxyService.adminDB$.subscribe( (state:boolean) => {		
			if(proxyService.adminDB) this.adminDB = proxyService.adminDB;		
		});		
	}


}