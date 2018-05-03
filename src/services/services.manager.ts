/***
 * Import Dependency Injection Container Object
 */
import { ServiceContainer } from "../shared/lib";

/***
 * Import Database Services
 */
import { DBConfigService } from "./db.config.service";
import { DBOpsService } from "./db.ops.service";
import { SystemUserService } from "./system.user.service";

class ServiceManager {

	public services:any = ServiceContainer;

	constructor() {	
		this.registerServices();
	}	

	/*****
	 * Register Singleton Services
	 */
	private registerServices() {	

		/***************************
		 * Configure Local Database
		 * USE_LOCAL_MONGODB_SERVER=true
		 */	
		this.services.registerClass('db', [], DBConfigService);


		/***************************
		 * Configure Local Database
		 * USE_LOCAL_MONGODB_SERVER=true
		 */	
		this.services.registerClass('admin', [], DBOpsService  );

		/***************************
		 * Register System user Service
		 */
		this.services.registerClass('systemUser', [], SystemUserService);
			
	}

	public inject(service:string):Function {
		return this.services.get(service);		
	}
}


/******
 * Create instance and initialize
 */
const __serviceManager:any = new ServiceManager();

export const serviceManager = __serviceManager.services;
