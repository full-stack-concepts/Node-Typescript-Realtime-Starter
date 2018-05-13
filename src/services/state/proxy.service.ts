/*****
 * Injectable Proxy Service
 * Propagates app state to subscribed observers
 */
import { Subject } from "rxjs";

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


	public systemUser$:Subject<boolean> = new Subject();	
	
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
		console.log("** Flag USERS DB To Live")			
		this.userDBLive$.next(true);
	}

	public setProductDBLive():void {	
		console.log("** Flag PRODUCTS DB To Live")			
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
	
}

export const proxyService = new ProxyService();
