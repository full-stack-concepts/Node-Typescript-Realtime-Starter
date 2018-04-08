/*****
 * Query String Builders for MLAB MONOGODB queries
 *
 *  To get the collections in the specified database: /databases/{database}/collections
 *   Example: https://api.mlab.com/api/1/databases/my-db/collections?apiKey=myAPIKey
 */

import { 
	MLAB_API_URL,
	MLAB_API_KEY,
	MLAB_DATABASE
} from "./secrets";

import {
	IListOptions
} from "../shared/interfaces";

export class RemoteQueryBuilder {	

	// build relative url for MLAB hosted db, relative to default
	static buildCollectionURL(collection:string):string { 
		return `${MLAB_API_URL}/${MLAB_DATABASE}/collections/${collection}?apiKey=${MLAB_API_KEY}`;	 
	}
	
	static list({ 
		
		/***
		 * Collection: @string
		 */
		collection, 

		/***
         * Query: mongodb query, @object
         */
		query,  

		/***
		 * Count: MLAB variable - @boolean
		 */
		count,  

		/***
		 * Fields: projection document to specify or restrict fields to return - @object
		 */
		fields,  

		/***
		 * FindOneOnly: MLAB variable - @boolean
		 */
		findOneOnly, 

		/***
		 * Sort: specifies the order in which the query returns matching documents - @object
		 */
		sort,

		/***
		 * Skip:  MLAB variable - @number
		 */
		skip,

		/***
		 * Limit:  MLAB variable - @number
		 */
		limit,

	}:IListOptions):string {		
		
		/***
		 * Build Default Query Str: returns list of collections
		 */
		let url:string = `${MLAB_API_URL}${MLAB_DATABASE}/collections/`;

		console.log(url)

		/***
		 * Collection: returns list of documents 
		 */
		if(collection && typeof collection === 'string') {
			url+= `${collection}`;
		}

		/***
		 * Question Mark: add <?> before url params are added
		 */
		 url+=`?`;

		/***
		 * Query: return the result count for this query
		 */
		if( query ) {			
			query = JSON.stringify(query);
			url += `q=${query}`;		
		}

		/***
		 * Count: return as its useless to add other options
		 */
		if( count && typeof count === 'boolean') {
			url+=`&c=true&apiKey=${MLAB_API_KEY}`;
			return url;
		}

		/***
		 * Fields: specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)
		 */
		if( fields && typeof fields === 'object') {
			url+=`&f=${JSON.stringify(fields)}`;			
		}

		/*** 
		 * Find One Only: return a single document
		 */
		if( findOneOnly && typeof findOneOnly === 'boolean') {
			url+=`&fo=true`;
		}

		/***
		 * Sort Order: specify the order in which to sort each specified field ( 1- ascending; -1 - descending)
		 */
		if( sort && typeof sort === 'object') {
			url += `&q=${JSON.stringify(sort)}`;
		}

		/***
		 * Skip: method on a cursor to control where MongoDB begins returning results. 
		 * This approach may be useful in implementing paginated results.
		 */
		if( skip && Number.isInteger(skip) && skip > 0) {
			url += `&sk=${skip}`;
		}

		/***
		 * Limit: method on a cursor to specify the maximum number of documents the cursor will return
		 */
		if( limit && Number.isInteger(limit) && limit > 1) {
			url += `&l=${limit}`;
		}

		/***
		 * Add MLAB API
		 */
		url+=`&apiKey=${MLAB_API_KEY}`;		

		return url;
	}
	

	static findOneRemoteURL(collection:string, query:any):string { 
		return  `/${MLAB_DATABASE}/collections/${collection}?q=${query}&fo=true&apiKey=${MLAB_API_KEY}`;
	}	

	static selectRemoteURL(collection:string, query:string, filter:string, findOneOnly:string):string {
		return  `/${MLAB_DATABASE}/collections/${collection}?q=${query}&f=${filter}&fo=${findOneOnly}&apiKey=${MLAB_API_KEY}`;
	}

	static updateDocumentURL(collection:string, query:string):string {
		return `/${MLAB_DATABASE}/collections/${collection}?apiKey=${MLAB_API_KEY}&q=${query}`;
	}

	/***************************************************************************************************************
	 * MLAB String that returns updated document with a specified MONGODB Document _id 
	 * Example: https://api.mlab.com/api/1/databases/my-db/collections/my-coll/4e7315a65e4ce91f885b7dde?apiKey=myAPIKey 
	 * Example: https://api.mlab.com/api/1/databases/my-db/collections/my-coll?f={"notes": 0}&apiKey=myAPIKey
	 */

	static updateSingleDocoumentURL(collection:string, userID:string):string {
		return `/${MLAB_DATABASE}/collections/${collection}/${userID}?apiKey=${MLAB_API_KEY}`;
	}
}


