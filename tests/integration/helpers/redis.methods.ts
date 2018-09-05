/****
 *
 */
import redis from "redis";
import util from "util";

/****
 * Redis Settings
 */
import {
	USE_LOCAL_REDIS_SERVER,
	REDIS_LOCAL_URL,
	REDIS_LOCAL_PORT,
	REDIS_LOCAL_PASSWORD,
	REDIS_READ_QUERIES_EXPIRATION_TYPE,
	REDIS_READ_QUERIES_EXPIRATION_TIME,
	REDIS_WRITE_QUERIES_EXPIRATION_TYPE,
	REDIS_WRITE_QUERIES_EXPIRATION_TIME

} from "../../../src/util/secrets";

export class RedisController {

	static async build() {

		if(!USE_LOCAL_REDIS_SERVER)
			return null;

		let redisUrl:string = `${REDIS_LOCAL_URL}:${REDIS_LOCAL_PORT}`;
		let redisClient:any = redis.createClient(redisUrl);

		// Promisify Redis Client methods		
		redisClient.get = util.promisify(redisClient.get);
		redisClient.set = util.promisify(redisClient.set);
		redisClient.hset = util.promisify(redisClient.hset);
		redisClient.hget = util.promisify(redisClient.hget);

		redisClient.auth( REDIS_LOCAL_PASSWORD, (err:Error) => {
			if (err) throw err;
		});

		/****
		 * return Redis CLient to caller
		 */	
		return Promise.resolve(redisClient);		
	}
}