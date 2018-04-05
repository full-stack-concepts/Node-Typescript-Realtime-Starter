/*****
 * Query String Builders for MLAB MONOGODB queries
 */

import { 
	MLAB_API_KEY,
	MLAB_DATABASE
} from "./secrets";

class RemoteQueryBuilder {

	static stringify(obj:any):string { 
		if(typeof obj === "string") return obj;
		return JSON.stringify(obj); 
	}

	static objectKeysLength(obj:any):number { 
		let keys = Object.keys(obj)
		return keys.length;
	}

	// build relative url for MLAB hosted db, relative to default
	static buildCollectionURL(collection:string):string { 
		return `/${MLAB_DATABASE}/collections/${collection}?apiKey=${MLAB_API_KEY}`;	 
	}

	static findOneRemoteURL(collection:string, query:string):string { 
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


module.exports = RemoteQueryBuilder;