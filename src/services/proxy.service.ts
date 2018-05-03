/*****
 * Injectable Proxy Service
 * Propagates app state to subscribed observers
 */
import { Subject } from "rxjs";

class ProxyService {

	/***
	 * App Event Bus: Native Mongoose connection is ready
	 */
	public db$:Subject<boolean> = new Subject();

	/***
	 * App Event Bus: signal MongoCLient for test
	 */
	public mongoClient$:Subject<boolean> = new Subject();

	/***
	 * App Event Bus: signal Database Service to create DB User
	 * @MongoID
	 */
	public dbUser$:Subject<string> = new Subject();

	public systemUser$:Subject<boolean> = new Subject();

	public localDBInstance$:Subject<boolean> = new Subject();
	
	
	/****
	 * Default MongoDB instance
	 */
	private _db:any;	

	constructor() {}

	/****
	 * Set state of local MongoDB Instance to live
	 */
	public setLocalDBLive():void {				
		this.db$.next(true);
	}

	/****
	 * Set state of local MongoDB Instance to offline
	 */
	public setLocalDBOffline():void {
		this.db$.next(false);
	}

	/***
	 * Inject Main System User
	 */
	public createSystemUser():void {
		this.systemUser$.next(true);
	}

	/***
	 * Database service propagates local DB instance
	 * ==> inform subscribers
	 */
	public setLocalDBInstance(db:any) {	
		this.db=db;
		this.localDBInstance$.next(true);
	}
	public set db( db:any) { this._db = db; }
	public get db() { return this._db; }	
	
}

export const proxyService = new ProxyService();
