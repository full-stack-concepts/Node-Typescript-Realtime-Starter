/*****
 * Injectable Proxy Service
 * Propagates app state to subscribed observers
 */
import { Subject } from "rxjs";

class ProxyService {

	public db$:Subject<boolean> = new Subject();
	public adminDB$:Subject<boolean> = new Subject();
	public systemUser$:Subject<boolean> = new Subject();
	public localDBInstance$:Subject<boolean> = new Subject();
	
	
	/****
	 * Default MongoDB instance
	 */
	private _db:any;

	/****
	 * Admin MongoDB instance
	 */
	private _adminDB:any;

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

	public setLocalAdminDbInstance(db:any) {	
		this._adminDB=db;	
		this.adminDB$.next(true);
	}

	public set adminDB ( db:any) { this._adminDB = db; }
	public get adminDB() { return this._adminDB; }
	
}

export const proxyService = new ProxyService();
