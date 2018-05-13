/***
 * Import Dependency Injection Container Object
 */
import { ServiceContainer } from "../shared/lib";

/***
 * Import Database Services
 */
import { DBAdminService } from "./db/db.admin.service";
import { DBUserService } from "./db/db.user.service";
import { DBProductService } from "./db/db.product.service";
import { SystemUserService } from "./user/system.user.service";

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
		 */	
		this.services.registerClass('db', [], DBUserService);

		/***************************
		 * Configure Local Database		
		 */	
		this.services.registerClass('adminDB', [], DBAdminService  );

		/***************************
		 * Configure Product Database		
		 */	
		this.services.registerClass('productDB', [], DBProductService  );

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
