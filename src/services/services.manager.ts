/***
 * Import Dependency Injection Container Object
 */
import { ServiceContainer } from "../shared/lib";

/***
 * Import Database Services
 */
import { DBAdminService } from "./db/db.admin.service";
import { NoSQL_UserService } from "./db/nosql/db.user.nosql.service";
import { NOSQL_ProductService } from "./db/nosql/db.product.nosql.service";
import { SQL_UserService } from "./db/sql/db.user.sql.service";
import { SQL_ProductService } from "./db/sql/db.product.sql.service";
import { SystemUserService } from "./user/system.user.service";

class ServiceManager {

	public services:any = ServiceContainer;

	constructor() {	

		/***
		 * Register NoSQL Services
		 */
		this.registerNoSQLServices();

		/***
		 * Register SQL Services
		 */
		this.registerSQLServices();
	}	

	/***
	 * Register NoSQL Singleton Services
	 */
	private registerNoSQLServices():void {	

		/***************************
		 * Configure Local Database		
		 */	
		this.services.registerClass('db', [], NoSQL_UserService);

		/***************************
		 * Configure Local Database		
		 */	
		this.services.registerClass('adminDB', [], DBAdminService  );

		/***************************
		 * Register Product Database Service		
		 */	
		this.services.registerClass('productDB', [], NOSQL_ProductService  );

		/***************************
		 * Register System user Service
		 */
		this.services.registerClass('systemUser', [], SystemUserService);
			
	}

	/***
	 * Register SQL Singleton Services
	 */
	private registerSQLServices():void {

		/***************************
		 * Register Users Database Service
		 */	
		this.services.registerClass('userDB_SQL', [], SQL_UserService);

		/***************************
		 * Register Product Database Service		
		 */	
		this.services.registerClass('productDB_SQL', [], SQL_ProductService  );
		
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
