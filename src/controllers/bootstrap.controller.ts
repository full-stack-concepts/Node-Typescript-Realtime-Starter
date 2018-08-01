import { Observable, Subscription } from "rxjs";

/****
 * Import System Settings
 */
import { SEND_MAIL_ON_BOOTSTRAP_SEQUENCE_FINISHED } from "../util/secrets";

/****
 * Import Actions
 */
import {
	SEND_SYSTEM_EMAIL
} from "./actions";

/****
 * Import Dependencies
 */
import { 
	loggerController,
	errorController,
	RedisController, 
	UAController, 
	DAController, 
	ApplicationLogger, 	
	ErrorLogger, 
	mailController, MAController	
} from "../controllers";

import { proxyService, connectToUserDatabase, connectToProductDatabase, dataBreeder } from "../services";
import { configureDatabases } from "../services/db/db.admin.service";
import { createSystemUser } from "../services/user/system.user.service";

import {
	DATA_GENERATE
} from "./actions";

import {
	privateDirectoryManager,
	publicDirectoryManager	
} from "../util";

import { DefaultModel, userModel, userReadModel, clientModel, clientReadModel, customerModel, customerReadModel } from "../shared/models";

import {
	SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED_EMAIL
} from "./mail/identifiers";

export class BootstrapController {

	userDBLive:boolean;
	productDBLive:boolean;
	testMode:boolean;

	redisClient:any;
	uaController:Function;
	daController:Function;
	maController:Function;

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
	private logBootstrapEvent(eventID:number) {
		loggerController.log(eventID, 'application');
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
					this.logBootstrapEvent(1008);
					this.logBootstrapEvent(1009);					
					dataBreeder.generateData()
				}			
			}
		);
	}

	/***
	 * Log Critical Error
	 * @err:Error
	 */
	private err(err:Error) {		
		errorController.log(10000, err);	
		process.exit(1);
	}

	/****
	 * Instatiate Default DB Model 
	 * so that it can subscribe to DB events
	 */
	private initDefaultDatabaseModel() {

		let err:Error;
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
		
		let err:Error;
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

	private sendBootstrapFinalizedEmail():void {
		if(SEND_MAIL_ON_BOOTSTRAP_SEQUENCE_FINISHED)
			this.maController[SEND_SYSTEM_EMAIL](SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED_EMAIL);
	}

	async init() {	

		try {

			/***
			 * Await built of Log Controller
			 */
			await loggerController.build();

			/***
			 * Test Remote Transport per Logger
			 */
			await loggerController.configureTransportsPerLogger();

			/***
			 * Await Build of Error Controller
			 */
			await errorController.build();			

			/***
			 * Await build of Redis Client
			 */
			this.redisClient = await RedisController.buildLocal();
			this.logBootstrapEvent( 1000);			
			
			/***
			 * Test build of User Action Controller Proxy
			 */
			this.uaController = await UAController.build();		
			this.logBootstrapEvent(1001)	

			/****
			 * Test build of Data Action Controller Proxy
			 */
			this.daController = await DAController.build();
			this.logBootstrapEvent(1002);

			/****
			 * Propagate instance of Redis CLient
			 */
			await proxyService.setRedisClient(this.redisClient);
			this.logBootstrapEvent(1003);	

			/***
			 * Propagate instance of User Action Controller
			 */
			await proxyService.setUAController(this.uaController);
			this.logBootstrapEvent(1004);	

			/***
			 * Propagate instance of Data Action Controller
			 */					
			await proxyService.setDAController(this.daController);
			this.logBootstrapEvent(1005);

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
			this.logBootstrapEvent(1006);

			/***
			 * Configure infrastructure
			 * (1) Public Directories
			 * (2) Private Directories
			 * (3) Local Store Directories
			 */
			await this.configureInfrastructure();
			this.logBootstrapEvent(1007)	

			/***
			 * Mail Controller
			 * (1)  Build Mail Action Proxy			 	
			 * (2) Build Mail Action Proxy
			 */
			this.maController = await MAController.build();
			await mailController.init();		
			this.logBootstrapEvent(1019)

			/***
			 * Connect To User DB
			 */
			await connectToUserDatabase();

			/***
			 * Connect to Product DB
			 */ 
			await connectToProductDatabase();		

			/***
			 *
			 */ 
			await createSystemUser();		

			/***
			 * Send email to application owner 
			 * that application has booted successfully
			 */			
			this.sendBootstrapFinalizedEmail()		

			console.log("==> Bootstrap Sequence finished");		

			return Promise.resolve();

		}

		catch(e) {
			this.err(e);
		}

	}
}

export const bootstrapController = new BootstrapController();
