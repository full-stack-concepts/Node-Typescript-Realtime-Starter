/*****
 * Injectable Proxy Service
 * Propagates State Requests to subscribed observers
 */
import { Subject } from "rxjs";
import { IEmailMessage} from "../../shared/interfaces";

/****
 * 
 */
const myGlobal:any = global;

class ProxyService {

	/***
	 * App Event Bus: Native Mongoose connection is ready
	 */
	public db$:Subject<boolean> = new Subject();

	/*****
	 * App Event bus: Database sequence has finalized
	 */
	public dbReady$:Subject<boolean> = new Subject();

	/*****
	 * Ap Event bus: Users DB ReadWrite Native connection ready
	 */	
	public userDBLive$:Subject<boolean> = new Subject();
	public productDBLive$:Subject<boolean> = new Subject();

	/*****
	 * Ap Event bus: Product DB ReadWrite Native connection ready
	 */
	public productDB$:Subject<boolean> = new Subject();

	/***
	 * App Event Bus: signal MongoCLient for test
	 */
	public mongoClient$:Subject<boolean> = new Subject();	

	/***
	 * App Event Bus: signal DB Users Service to connect
	 */
	public connectUsersDatabase$:Subject<boolean> = new Subject();

	/***
	 * App Event Bus: request Email Controller to send email
	 */
	public sendEmail$:Subject<boolean> = new Subject();
	private _email:IEmailMessage;

	public setNextEmail(email:IEmailMessage):void {
		this._email = email;
		this.sendEmail$.next(true);
	}
	
	public getNextEmail():IEmailMessage { 
		const email:IEmailMessage = this._email;
		this._email = null;
		return email;
	}	


	/***
	 * Test Mode
	 */
	public testMode$:Subject<boolean> = new Subject();

	/***
	 * User Action Controller
	 */
	public _uaController:Function;
	public uaController$:Subject<boolean> = new Subject();

	/***
	 * Data Action Controller
	 */
	public _daController:Function;
	public daController$:Subject<boolean> = new Subject();


	public systemUser$:Subject<boolean> = new Subject();	

	/***
	 * Local Redis CLient
	 */
	private _redisClient:any;
	public redisClient$:Subject<boolean> = new Subject();	

	public setRedisClient(client:any):void {
		this._redisClient = client;
		this.redisClient$.next(true);
	}
	public set redisClient( client:any) { this._redisClient = client; }
	public get redisClient() { return this._redisClient; }	

	/***
	 * Data Generator
	 */
	public startDataOperations$:Subject<boolean> = new Subject();	


	public startDataOperations() {		
		this.startDataOperations$.next(true);
	}
	
	/****
	 * native connections
	 */
	private _userDB:any;
	private _productDB:any;	

	constructor() {}

	/****
	 * Set state of local MongoDB Instance to live
	 */
	public setUserDBLive():void {		
		console.log("*** BP 7")
		this.userDBLive$.next(true);
	}

	public setProductDBLive():void {		
		this.productDBLive$.next(true);
	}

	/****
	 * Set state of local MongoDB Instance to offline
	 */
	public setUserDBOffline():void {
		this.userDBLive$.next(false);
	}
	public setProductDBOffline():void {
		this.productDBLive$.next(false);
	}

	/***
	 * Inject Main System User
	 */
	public createSystemUser():void {
		this.systemUser$.next(true);
	}

	/***
	 * Database service propagates User DB instance
	 * ==> inform subscribers
	 */
	public setUserDB(db:any) {	
		this._userDB=db;				
	}
	public set userDB( db:any) { this._userDB = db; }
	public get userDB() { return this._userDB; }	


	/***
	 * Database service propagates Product DB instance
	 * ==> inform subscribers
	 */
	public setProductDB(db:any) {	
		this._productDB=db;				
	}
	public set productDB( db:any) { this._productDB = db; }
	public get productDB() { return this._productDB; }	

	/***
	 * Start MongoDB Client COnfiguratoin
	 */
	public configureMongoDBClient():void {
		this.mongoClient$.next(true); 
	}

	/***
	 * Conenct to users database
	 */
	public connectToUsersDatabase():void {
		this.connectUsersDatabase$.next(true);
	}

	/***
	 * Proxy User Action controller
	 * @uaController:Function
	 */
	public setUAController(uaController:Function):Promise<void> { 		
		this._uaController = uaController; 
		this.uaController$.next(true);
		return Promise.resolve();
	}

	public get uaCOntroller() {
		return this._uaController;
	}

	/***
	 * Proxy Data Action controller
	 * @daController:Function
	 */
	public setDAController(daController:Function):Promise<void> { 		
		this._daController = daController; 
		console.log("*** ProxyService: signal daController")
		this.daController$.next(true);
		return Promise.resolve();
	}

	public get daCOntroller() {
		return this._daController;
	}

	/***
	 * Propagate Test Mode
	 */
	public setTestStatus():void {
		this.testMode$.next(true); 
	}
	
}

export const proxyService = new ProxyService();
