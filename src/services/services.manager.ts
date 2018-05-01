/*
 * Import Dependency Injection Container Object
 */
import { ServiceContainer } from "../shared/lib";
import { DBModelService } from "./db.model.service";
import { DatabaseService } from "./db.service";

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
		this.services.registerClass('db', [], DatabaseService);

		/****************************
		 * Register DBModels Service 
		 */
		this.services.registerClass('DBModelService', [], DBModelService);				
	}

	public inject(service:string) {
		return this.services.get(service);		
	}
}


/******
 * Create instance and initialize
 */
const __serviceManager:any = new ServiceManager();

export const serviceManager = __serviceManager.services;
