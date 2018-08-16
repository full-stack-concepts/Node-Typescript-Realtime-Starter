import { Observable, Subscription } from "rxjs";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/take";
import "rxjs/add/operator/map";

import { proxyService } from "../../services";
import { ModelMethods } from "./methods.model";

/****
 * Custom Methods for MLAB Mongo Databse				
 */   
export class DefaultModel extends ModelMethods {	

	/****
	 * Native Connections
	 * inejected into Repository classes
	 */
	protected userDBConn:any;
	protected productDBConn:any;

	/****
	 * Protected Repository Constructor
	 */
	protected repoConstructor:any

	constructor() {

		super();

		this.configureSubscribers();		
	}

	protected configureSubscribers() {		

		/***
		 * Subsriber: get UserDB native connection
		 */		
		proxyService.userDBLive$.subscribe( (state:boolean) => {						
			if(proxyService.userDB) {
				this.userDBConn = proxyService.userDB;				
			}
		});

		/***
		 * Subsriber: get Product DB native connection
		 */		
		proxyService.productDB$.subscribe( (state:boolean) => {								
			if(proxyService.productDB) this.productDBConn = proxyService.productDB;
		});		
	}

	private getConnection(dbType:number) {

		let conn;
		switch(dbType) {
			case 1: conn = this.userDBConn; break;
			case 2: conn = this.productDBConn; break;
		}
		return conn;
	}

	/***
	 * Create Repository
	 * @dbType:number => 1=user, 2=product
	 */
	protected createRepo(dbType:number) {		

		let connection:any;

		return new Promise( (resolve, reject) => {

			const source$:Observable<number> = Observable.interval(25);
			const sub$:Subscription = source$.subscribe(	
				(x:number)=> { 							

					if(this.userDBConn) {

						/***
						 * Inject repo into child class
						 */
						connection = this.getConnection(dbType);
						this.repo = new this.repoConstructor(connection);

						/***
						 * Unsubscribe form sequence and return to caller
						 */
						sub$.unsubscribe();
						resolve();
					}						
				}	
			);

		});
		
	}
}