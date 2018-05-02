import Promise from "bluebird";
import fetch from "node-fetch";

import { RepositoryBase,  IUser, IListOptions } from "../interfaces";
import { objectKeysLength, stringify, RemoteQueryBuilder } from "../../util";

const headers:any= { 'Content-Type': 'application/json' };

export class DefaultModel {

	/****
	 * Custom Methods for MLAB Mongo Databse				
	 */   

	//** MLAB: Create user 
	public static remoteCreateUser(_data:any, collection:string) {		
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
	public static remoteUpdateEntireUserObject( collection:string, id:string, data:any) {
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
	public static mlab_insert(collection:string,  data:any, ) {
		return new Promise( (resolve, reject) => {
			let rURL = RemoteQueryBuilder.buildCollectionURL( collection.toString() );					
			fetch(rURL, { method: 'POST', body: JSON.stringify(data), headers:headers })
			.then( (res:any) =>res.json())
			.then( (response:any) => { resolve(response); })
			.catch( err => reject(err) );		

		});
	}

	//** MLAB find single user
	public static remoteFindOneOnly(query:Object, collection:string) {
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
	public static mlab_deleteCollection(collection:string) {
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