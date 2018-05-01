/*****
 * Injectable Proxy Service
 * Propagates app state to subscribed observers
 */
import { Subject } from "rxjs";

class ProxyService {

	public db$:Subject<boolean> = new Subject();

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
}

export const proxyService = new ProxyService();
