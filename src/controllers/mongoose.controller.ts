/*****
 * Prototyping Mongoose for Redis Caching
 * Should be import in top of bootstrap controller module
 * so our prototyped version of Mongoose is loaded into other modules
 */

import mongoose from "mongoose";
import { proxyService } from "../services";

/*****
 * Redis Client (instance)
 */
var client:any;

proxyService.redisClient$.subscribe( (state:boolean) => {   		
	if(proxyService.redisClient) client = proxyService.redisClient;          	 	
});

const exec = mongoose.Query.prototype.exec

/****
 * use redis to cache query
 * @useCache:boolean
 */
var Query:any = mongoose.Query;
Query.prototype.useCache;

/****
 * Top Level Haskey
 * @haskKey:string
 */ 
Query.prototype.hashKey;

/***
 * instruct default Mongoose Query to cache this query
 * Toggleable Cache
 * @options: top level redis hash key
 */
Query.prototype.cache = function(options:any={})  {

	// console.log('(1) *** I am about to run a query: ', this.mongooseCollection.name)	
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || 'default');

	return this;
}

/***
 *
 */
mongoose.Query.prototype.exec = async () => {

	/***
	* Return is query will not be cached
	*/
	if(!this.useCache) {		
		return exec.apply(this, arguments);
	}

	/***
	 * Redis Key Strategy
	 */
	const key:string = JSON.stringify(Object.assign( {}, 
		this.getQuery(), {
		collection: this.mongooseCollection.name
	}));

	/***
	 * Test if have a cached value for thsi Redis Key
	 * @cacheValue: Mongoose Document(s)
	 */
	const cacheValue:any = await client.get(key);

	/***
	 * Process either
	 * (a) Single Mongoose Document, or 
	 * (b) Array of Mongoose Documents
	 */
	if(cacheValue) {

		const doc = JSON.parse(cacheValue);

		return Array.isArray(doc)
			? doc.map(d => new this.model(d))
			: new this.model(doc);
	}

	/***
	 * Execute query and store result in redis
	 */
	const result:any = await exec.apply(this, arguments);
	client.set(key, JSON.stringify(result), 'EX', 10);

	/***
	 *
	 */
	this.useCache=false;

	/***
	 *
	 */
	return result;
}

/***
 *
 */
Query.prototype.stats = function() {

}

/***
 *
 */
Query.prototype.fromLocalStore = function() {
	
}

