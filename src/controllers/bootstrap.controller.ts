import { Observable, Subscription } from "rxjs";

/****
 * Import Dependencies
 */
import { RedisController, UAController, DAController, ApplicationLogger } from "../controllers";
import { proxyService, connectToUserDatabase, connectToProductDatabase } from "../services";
import { configureDatabases } from "../services/db/db.admin.service";
import { testForSystemUser, createSystemUser } from "../services/user/system.user.service";

import {
	DATA_GENERATE
} from "./actions";

import {
	privateDirectoryManager,
	publicDirectoryManager	
} from "../util";

import { DefaultModel, userModel, userReadModel, clientModel, clientReadModel, customerModel, customerReadModel } from "../shared/models";


export class BootstrapController {

	userDBLive:boolean;
	productDBLive:boolean;
	testMode:boolean;

	redisClient:any;
	uaController:Function;
	daController:Function;

	constructor() {
		this.configureSubscribers();
		this.dataGenerator();
	}

	private configureSubscribers():void {	

		/***
		 * Server signals that app runs in test mode
		 */
		proxyService.testMode$.subscribe( (state:boolean) => this.testMode = state );

		/***
		 * Data Generation is seperated from application boot sequence
		 * Wait for UserDB and Product DB are live to start data generaton process
		 */	
		proxyService.userDBLive$.subscribe( (state:boolean) => this.userDBLive = state );
		proxyService.productDBLive$.subscribe( (state:boolean) => this.productDBLive = state );		
	}

	/***
	 * Logger
	 * Default Event ID for Bootstrap Controller = 1000; 
	 */
	private logBootstrapEvent(eventID:number, action:string='') {
		let section:string = 'BootstrapController';
		ApplicationLogger.application({section, eventID, action})
	}

	/***
	 * Launch Data Generator when
	 * (1) User Database is live
	 * (2) Product Dataabse is live
	 * (3) User Action Controller is loaded
	 * (4) Data Action Controller is loaded
	 * (5) Application is not running is test mode
	 */
	private dataGenerator() {
		const source$:Observable<number> = Observable.interval(75);
		const sub$:Subscription = source$.subscribe(	
			(x:number)=> { 			

				if(this.testMode || (this.userDBLive && this.productDBLive && this.uaController && this.daController) ) sub$.unsubscribe();
				if(this.userDBLive && this.productDBLive  && this.uaController && this.daController) {
					this.logBootstrapEvent(1007, "User Database is live");
					this.logBootstrapEvent(1008, "Products Database is live");
					console.log("SIGNAL SIGNAL SIGNAL")
					// proxyService.startDataOperations();
				}			
			}
		);
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

		try {

			/***
			 * Await build of Redis Client
			 */
			this.redisClient = await RedisController.buildLocal();
			this.logBootstrapEvent( 1000, "RedisController has been build.")
			
			/***
			 * Test build of User Action Controller Proxy
			 */
			this.uaController = await UAController.build();		
			this.logBootstrapEvent(1001, "User Action Controller Proxy is ready.")	

			/****
			 * Test build of Data Action Controller Proxy
			 */
			this.daController = await DAController.build();
			this.logBootstrapEvent(1002, "Data Action Controller Proxy is ready.");

			/****
			 * Propagate instance of Redis CLient
			 */
			await proxyService.setRedisClient(this.redisClient);
			this.logBootstrapEvent(1003, "Listeners can subscribe to Redis Client.");	

			/***
			 * Propagate instance of User Action Controller
			 */
			await proxyService.setUAController(this.uaController);
			this.logBootstrapEvent(1003, "Listeners can subscribe to UA Contoller.");	

			/***
			 * Propagate instance of Data Action Controller
			 */					
			await proxyService.setDAController(this.daController);
			this.logBootstrapEvent(1004, "Listeners can subscribe to DA Controller");

			/***
			 * Init Default DB Model
			 */
			await this.initDefaultDatabaseModel();

			/***
			 * Configure application databases
			 * (1) Test for predefined db users
			 * (2) Test assigned roles per db user
			 * (3) Test if predefined collections exist (#TODO)
			 * (4) Perform test operations (#TODO)
			 */		
			await this.configureDatabases();
			this.logBootstrapEvent(1005, "Databases have been configured with predefined users and designated roles.");

			/***
			 * Configure infrastructure
			 * (1) Public Directories
			 * (2) Private Directories
			 * (3) Local Store Directories
			 */
			await this.configureInfrastructure();
			this.logBootstrapEvent(1006, "Public and private directories have been configured.")	

			/***
			 * Connect To User DB
			 */
			await connectToUserDatabase();

			/***
			 * Connect to Product DB
			 */ 
			await connectToProductDatabase();		

			// process thick: 
			await createSystemUser();		

			console.log("==> Bootstrap Sequence finished")

			
			

			return Promise.resolve();

		}

		catch(e) {
			this.err(e);
		}

	}
}

export const bootstrapController = new BootstrapController();
