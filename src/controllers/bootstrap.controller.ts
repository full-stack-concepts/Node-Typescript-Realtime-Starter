import { 
	proxyService	
} from "../services";

import {
	configureDatabases
} from "../services/db.admin.service";

import {
	testForSystemUser
} from "../services/system.user.service";

import {
	privateDirectoryManager,
	publicDirectoryManager   
} from "../util";

/****
 * Init Default DB Model before import bootstrap manager
 * so it can listen to application events
 */
import { DefaultModel } from "../shared/models";


export class BootstrapController {

	constructor() {
		this.configureSubscribers();
	}

	private configureSubscribers():void {

		/*****
		 * Database sequence has finalized
		 */
		 proxyService.dbReady$.subscribe( (state:boolean) => {
		 	// trigger next action
		 	console.log(" ==> Its time for the next Bootstrap action")
		 });
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
	 * (2) evaluate existiing datbases
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
		// proxyService.configureMongoDBClient();		
		let err:any;
		try {
			const $dbConfig = await configureDatabases();
		}
		catch(e) { err=e;}
		finally {
			if(err) {
			 	this.err(err); } else { return Promise.resolve(); }
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
			 	this.err(err); } else { return Promise.resolve(); }
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

	init():void {

		// process thick: create databases
		this.initDefaultDatabaseModel()

		// process thick: 
		this.configureDatabases()

		// process thick:
		.then( () => this.configureInfrastructure() )

		// process thick: 
		.then( () => this.systemUser() )

		

		// process thick: 
		.then( () => console.log("==> Bootstrap Sequence finished") )

		.catch( (err:any) => this.err(err) );

	}
}

export const bootstrapController = new BootstrapController();
