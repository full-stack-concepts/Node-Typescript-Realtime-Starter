import { Observable } from "rxjs";

/****
 * Default Socket Store Management Class
 * Each data type gets its own store class, a child from this parent.
 */
/* eslint no-onused-vars: "off" */
export class ModuleBase {

	io:any;	

	// init our sequence stream
	public init$():Observable<{}> {		
		return Observable.empty();
	}

	// handsles all actions coming in through socket connection
	public registerClient(io:any, client:any, socket:any):void {
	}

	clientRegistered(client:any, socket:any) {
	}

	public initThisDataStore() {
		
	}

	public configureDataStore() {

	}

	public registerIO(io:any):any {

	}

	public updateIO$(io:any):Observable<any> {	
		this.io = io;
		return Observable.empty();
	}

	
}

