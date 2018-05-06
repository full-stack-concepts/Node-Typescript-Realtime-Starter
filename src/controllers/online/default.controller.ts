import { Observable } from "rxjs/Observable";


export class DefaultOnlineController {

	/****
	 * Controller instance of SOCKET.IO Server
	 */
	io:any;

	constructor() {}

	/****
	 * Instantiate Sequence 
	 */
	public init$():Observable<{}> {
		return Observable.empty();
	}

	/****
	 * Register Client afer clients connect
	 */
	public registerClient(io:any, client:any, socket:any):void {}

	/****
	 * Register client: backup
	 */
	clientRegistered(io:any, client:any, socket:any):void {}

	/***
	 *
	 */
	public initThisDataStore():void {}

	public configureDataStore():void {}

	public registerIO(io:any):void {}

	/***
	 * Update controller when IO objct changes
	 */
	public updateIO$(io:any):Observable<any> {	
		this.io = io;
		return Observable.empty();
	}	
}