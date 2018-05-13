import Promise from "bluebird";
import fetch from "node-fetch";

import { proxyService } from "../../services";
import { IUser, IListOptions } from "../interfaces";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

const headers:any= { 'Content-Type': 'application/json' };

/****
 * Custom Methods for MLAB Mongo Databse				
 */   
export class DefaultModel {

	/****
	 * Native Connections
	 * inejected into Repository classes
	 */
	userDBConn:any;
	productDBConn:any;

	constructor() {
		this.configureSubscribers();		
	}

	protected configureSubscribers() {		

		/***
		 * Subsriber: get UserDB native connection
		 */		
		proxyService.userDBLive$.subscribe( (state:boolean) => {				
			console.log("*** UDSER DB has arrived ", state)
			if(proxyService.userDB) {
				this.userDBConn = proxyService.userDB;				
			}
		});

		/***
		 * Subsriber: get Product DB native connection
		 */		
		proxyService.productDB$.subscribe( (state:boolean) => {	
			console.log("*** PRODUCT DB has arrived ", state)
			if(proxyService.productDB) this.productDBConn = proxyService.productDB;
		});
	}

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