import { proxyService, connectToUserDatabase, connectToProductDatabase } from "../services";
import { configureDatabases } from "../services/db/db.admin.service";
import { testForSystemUser, createSystemUser } from "../services/user/system.user.service";
import { UAController } from "./user.action.controller";

import {
	privateDirectoryManager,
	publicDirectoryManager,
	encryptPassword,
	decryptPassword
} from "../util";

/****
 * Init Default DB Model before import bootstrap manager
 * so it can listen to application events
 */
import { DefaultModel } from "../shared/models";

import {IEncryption} from "../shared/interfaces"

export class BootstrapController {

	constructor() {
		this.configureSubscribers();
	}

	private configureSubscribers():void {		
	}

	private err(err:any) {
		console.error("Critical Error: bootstrap sequence failed ")
		console.error(err);
		process.exit(1);
	}

	/****
	 * Instatiate Default DB Model 
	 * so that it can subscribe to DB events
	 */
	private initDefaultDatabaseModel() {

		let err:any;
		try { const model = new DefaultModel();} 
		catch(e) { err = e; }
		finally { if(err) this.err(err); return; }
	}

	/****
	 * Configure Databases sequence 
	 * (1) configure MongoDB Client
	 * (2) evaluate existing datbases
	 * (3) evaluate pre-defined user roles
	 * (4) evaluate pre-defined db users
	 * (5) publish db connections to default DB Model
	 * (6) default DB Model injects connections into:
	 * 		(a) SystemUSerModel		-  readWrite native connection
	 * 		(b) UserModel 			-  readWrite native connection
	 * 		(c) ClientModel			-  readWrite native connection
	 *		(d) CustomerModel		-  readWrite native connection
	 */
	private async configureDatabases():Promise<void> {		
		
		let err:any;
		try {
			const $dbConfig = await configureDatabases();
		}
		catch(e) { err=e;}
		finally {
			if(err) { 
				this.err(err); 
			} else { 
				return Promise.resolve(); 
			}
		}
	}

	/****
	 * Configure Infrastructure
	 * (1) private folders
	 * (2) public folders
	 */
	private async configureInfrastructure():Promise<void> {

		let err;
		try {
			const $private = await privateDirectoryManager();
			const $public = await publicDirectoryManager();
		}
		catch(e) { err=e;}
		finally {
			if(err) {
			 	this.err(err); 
			 } else { 
			 	return Promise.resolve(); 
			}
		}
	}
 
	/***
	 * Test if Super Admin system User
	 * Clone of MongoDB SuperAdmin, injected into <systemusers> collection
	 */
	private async systemUser():Promise<void> {		
		let err;
		try {
			const $systemUser = await testForSystemUser();
		}
		catch(e) { err=e;}
		finally {
			if(err) { this.err(err); } else { return Promise.resolve();}
		}
	}	

	async init() {

		/***
		 * Test build of User Action Controller Proxy
		 */
		const uaController:any = await UAController.build();	

		try {

			/***
			 * Propagate uaController
			 */
			await proxyService.setUAController(uaController);

			/***
			 * Init Default DB Model
			 */
			// await this.initDefaultDatabaseModel();

			/***
			 * Configure application databases
			 * (1) Test for predefined db users
			 * (2) Test assigned roles per db user
			 * (3) Test if predefined collections exist (#TODO)
			 * (4) Perform test operations (#TODO)
			 */		
			// await this.configureDatabases();

			/***
			 * Configure infrastructure
			 * (1) Public Directories
			 * (2) Private Directories
			 * (3) Local Store Directories
			 */
			// await this.configureInfrastructure();

			/***
			 * Connect To User DB
			 */
			// await connectToUserDatabase();

			/***
			 * Connect to Product DB
			 */ 
			// await connectToProductDatabase();		

			// process thick: 
			// await createSystemUser();		

			console.log("==> Bootstrap Sequence finished")

			return Promise.resolve();

		}

		catch(e) {
			this.err(e);
		}

	}
}

export const bootstrapController = new BootstrapController();
