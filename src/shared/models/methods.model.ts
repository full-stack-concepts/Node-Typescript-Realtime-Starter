import Promise from "bluebird";

import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";
const headers:any= { 'Content-Type': 'application/json' };


/****
 * Class Model owns all local and remote MongoDB query methods 
 * Seperated from default model so test environment can access Mongoose methods
 * without loading proxy service that triggers entire application on BOOTSTRAPPING 
 */
export class ModelMethods {

	/****
	 * Native Connections
	 * inejected into Repository classes
	 */
	userDBConn:any;
	productDBConn:any;

	/****
	 * Repository
	 */
	repo:any;

	/***
	 * Redis Client
	 */
	redisClient:any;

	/******************************************************************************************
	 *
	 * "LOCAL" MONGOOSE METHODS
	 */
	
	 /*** READ OPERATIONS ***/

	public findAll ( query:Object={}, fields:Object={}, options:Object={}):Promise<any> {
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.find ( {}, fields, options, (err:any, res:any) => {					
				if(err) { reject(err);} 
				else if(!res) {  resolve(); } 
				else {  resolve(res); }
			});
		})
	}


	public find (query:Object, fields:Object={}, options:Object={} ):Promise<any> {
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.find ( query, fields, options, (err:any, res:any) => {					
				if(err) {  reject(err); } 
				else if(!res) { resolve(); } 
				else { resolve(res); }
			});
		});
	}

	public findOne (query:Object):Promise<any> {
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.findOne ( query, (err:any, res:any) => {								
				if(err) { reject(err); } 
				else if(!res) { resolve(); } 
				else { resolve(res); }
			});
		});
	}

	public findById(id:string):Promise<any> {
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.findById ( id, (err:any, res:any) => {					
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}

	/*** WRITE OPERATIONS **/
	public insert(users:any): Promise<any> {
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.insertMany( users, (err:any, res:any) => {			
				if(err) {reject(err); } else { resolve(res); }
			});
		});
	}	

	public findOneAndDelete (query:Object, options:Object={} ):Promise<any> {
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.findOneAndDelete ( query, options, (err:any, res:any) => {					
				if(err) {  reject(err); } 
				if(err) {  reject(err); } 
				else { resolve(); } 	
			});
		});
	}

	public findOneAndUpdate (query:Object, update:Object={}, options:Object={} ):Promise<any> {	
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {
			repo.findOneAndUpdate ( query, update, options, (err:any, res:any) => {								
				if(err) {  reject(err); } 
				else { resolve(); } 			
			});
		});
	}

	/*** Bulk Operations ***/
	public updateMany (query:Object, update:any={}, options:Object={} ):Promise<any> {		
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {		
			repo.updateMany ( query, update, options, (err:any, res:any) => {								
				console.log(err, res)
				if(err) {  reject(err); } 
				else { resolve(res); } 			
			});
		});
	}

	public remove (query:Object):Promise<any> {		
		const repo = this.repo;
		return new Promise ( (resolve, reject) => {		
			repo.remove ( query, (err:any, res:any) => {								
				console.log(err, res)
				if(err) {  reject(err); } 
				else { resolve(); } 			
			});
		});
	}	

	/*******************************************************************************************
	 *
	 * REMOTE HTTPS METHODS
	 */

	//** MLAB: Create user 
	public remoteCreateUser(_data:any, collection:string) {		
		return new Promise( (resolve, reject) => {			 
			if( _data && objectKeysLength (_data) === 0 ) reject(' Invalid Data');					
			let data = stringify(_data);			
			let rURL = RemoteQueryBuilder.buildCollectionURL(collection);			
			fetch(rURL, { method: 'POST', body: data, headers:headers })
			.then( (res:any) =>res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );			
		});
	}

	//** MLAB: Update entire User object
	public remoteUpdateEntireUserObject( collection:string, id:string, data:any) {
		return new Promise( (resolve, reject) => {
			if( data && objectKeysLength (data) === 0 ) reject(' Invalid Data');			
			let rURL = RemoteQueryBuilder.updateSingleDocument(collection, id );	
			fetch(rURL, { method: 'PUT', body: JSON.stringify(data), headers:headers })	
			.then( (res:any) =>res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );
		});
	}

	// MLAB: Insert many users
	public mlab_insert(collection:string,  data:any, ) {
		return new Promise( (resolve, reject) => {
			let rURL = RemoteQueryBuilder.buildCollectionURL( collection.toString() );					
			fetch(rURL, { method: 'POST', body: JSON.stringify(data), headers:headers })
			.then( (res:any) =>res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );		

		});
	}

	//** MLAB find single user
	public remoteFindOneOnly(query:Object, collection:string) {
		return new Promise( (resolve, reject) => {
			query = stringify( query);
			let rURL = RemoteQueryBuilder.findOneRemoteURL(collection, query);
			console.log(rURL);
			fetch(rURL)
			.then( (res:any) =>res.json())
			.then( (response:any) => resolve(response) )			
        	.catch( err => reject(err) );        
		});
	}

	//** MLAB Delete collection
	public mlab_deleteCollection(collection:string) {
		return new Promise ( (resolve, reject) => {
			let rURL:string = RemoteQueryBuilder.buildCollectionURL(collection.toString());			
			console.log(rURL)
			fetch(rURL, { method: 'DELETE', headers:headers})
			.then( (res:any) => res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );			
		});
	}

}

/***
 * Export for Test Environment
 */
export const testModel:any = new ModelMethods();