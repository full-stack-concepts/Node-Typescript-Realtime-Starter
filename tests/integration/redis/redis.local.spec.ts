import { expect, assert } from 'chai';
import redis from "redis";
const {promisify} = require('util');
import util from "util";
import validator from "validator";

/****
 * Instance of ModelMethods: holds all default Mongoose and MLAB db methods
 * @testModel:ModelMethods
 */
import { testModel } from "../../../src/shared/models/methods.model";

import {
	USE_LOCAL_REDIS_SERVER,
	AUTHENTICATE_REDIS_SERVER,
	REDIS_LOCAL_URL,
	REDIS_LOCAL_PORT,
	REDIS_LOCAL_PASSWORD,
	REDIS_READ_QUERIES_EXPIRATION_TYPE,
	REDIS_READ_QUERIES_EXPIRATION_TIME,
	REDIS_WRITE_QUERIES_EXPIRATION_TYPE,
	REDIS_WRITE_QUERIES_EXPIRATION_TIME,
	TEST_ACCOUNT_USER_DB_ADMIN

} from "../../../src/util/secrets";

import {
	UserTypeMethods,
	dbTestEnvironment,
	deepCloneInstance,
	ReadRepository
} from "../helpers";

import {	
	constructPrimaryKey,
    constructSecundaryKey,
    constructTimeslotKey
} from "../../../src/engines/mongoose/helpers";

import {
	RedisController
} from "../../../src/controllers";

describe("Local Redis Server", () => {	

	const v:any = validator;
	let redisClient:any;

	/****
	 *
	 */
	describe("Configuration settings", () => {	

		it("should instruct application whether to use Redis locally or remote", () => {
			expect(USE_LOCAL_REDIS_SERVER).to.be.a('boolean');		
		});

		if(USE_LOCAL_REDIS_SERVER) {

			it("should instruct application whether to authenticate with Redis Server Locally", () => {
				expect(AUTHENTICATE_REDIS_SERVER).to.be.a('boolean');		
			});

			it("should provide a connection URL", () => {
				expect(REDIS_LOCAL_URL).to.be.a('string').and.to.exist;			
			});

			it("should provide a value for the local Redis port", () => {
				const port:number = parseInt(REDIS_LOCAL_PORT);
		    	expect( Number.isInteger(port)).to.equal(true);
			});

			it("should provide a connection password", () => {
				 expect(REDIS_LOCAL_PASSWORD).to.be.a('string').and.to.exist;
			});

			it("should set Expiration type for cached Mongoose Read Queries", () => {
				expect(REDIS_READ_QUERIES_EXPIRATION_TYPE).to.be.a('string').and.to.exist;
				expect(REDIS_READ_QUERIES_EXPIRATION_TYPE.length).to.equal(2);
			});

			it("should set timeout value for any Redis key that stores a cached Mongoose Read Query", () => {
				const timeout:number = parseInt(REDIS_READ_QUERIES_EXPIRATION_TIME);
		    	expect( Number.isInteger(timeout)).to.equal(true);
			});

			it("should set Expiration type for cached Mongoose Write Queries", () => {
				expect(REDIS_WRITE_QUERIES_EXPIRATION_TYPE).to.be.a('string').and.to.exist;
				expect(REDIS_WRITE_QUERIES_EXPIRATION_TYPE.length).to.equal(2);
			});

			it("should set timeout value for any Redis key that stores a cached Mongoose Write Query", () => {
				const timeout:number = parseInt(REDIS_WRITE_QUERIES_EXPIRATION_TIME);
		    	expect( Number.isInteger(timeout)).to.equal(true);
			});

		}

	});

	/***
	 * Local Client
	 */
	describe("Node Redis Client", () => {

		let redisReady:boolean;
		let getAsync:any;
		let setAsync:any;
		let delAsync:any;
		let key:string = 'write-something';
		let value:number = 1000;
		let err:Error;

		before( (done) => {

			redisClient = redis.createClient( `${REDIS_LOCAL_URL}:${REDIS_LOCAL_PORT}` );	

			if(AUTHENTICATE_REDIS_SERVER) {
				redisClient.auth( REDIS_LOCAL_PASSWORD, (err:Error) => {
	    			if (err) throw err;
				});
			}	

			getAsync = promisify(redisClient.get).bind(redisClient);
			setAsync = promisify(redisClient.set).bind(redisClient);	
			delAsync = promisify(redisClient.del).bind(redisClient);			

			redisClient.on('ready', () => {
				redisReady = true;
				done();
			});

			redisClient.on('error', (e:any) => {
				redisReady = false
				err = e;
				done();
			});

		});

		it("should connect to local instance without error", () => {
			expect(redisClient).to.exist;
			expect(err).to.be.undefined;
		});

		it("should write to and read from the cache", async  () => {			

			await setAsync( key, value, 'EX', 40 );
			const res = await getAsync(key);			

			expect(parseInt(res)).to.equal(value);

		});

		it("should delete keys from the cache", async () => {

			const reply:any = await delAsync(key);
			
			expect(reply).to.exist.and.to.be.a('number');	

		});		

	});

	/****
     * This haskey is created inside any Mongoose Repository
     * For this test we use the Mongoose Read Repository
     */
    describe("Cache", () => {

        let err:Error;

        let methods:any;
        let connection:any;
        let Model:any;
        let repo:any
        let _dbName:string = TEST_ACCOUNT_USER_DB_ADMIN.db;
        let _collectionName: string;
        let _hashKey:string;
        let _key:string;

        let hgetAsync:any;
		let hsetAsync:any;


        /***
         * Connect to DB So we can create Mongoose Models on demand
         */
        before( async () => {

            // (1) get proxy
            methods = await UserTypeMethods.build();

            // (2) connect to Users Database
            connection = dbTestEnvironment.initUserDatabase();  

            let testRepo:any = await new ReadRepository('user', connection, redisClient);            

            // clone testmodel to we can create a repo per readModel
            let model:any = await testRepo.getModel();          
            
            // construct hash key
            const {
            	dbName, 
            	collectionName, 
            	hashKey
            }:any = constructPrimaryKey(model); 

            _dbName = dbName;
            _collectionName = collectionName;
            _hashKey = hashKey;

            // construct secudary key
            let key:string|number = constructSecundaryKey({test:'redis', section: 'hashkey'}, _collectionName);

            _key = key;

            // promisify redis function
           	redisClient.hset = util.promisify(redisClient.hset);
			redisClient.hget = util.promisify(redisClient.hget);           
           
        });

        describe("Hash Key", () => {
        	
        	it("should be a string and exist", () => {                                  
            	expect(_hashKey).to.exist.and.to.be.a('string');
        	});

	       	it("should include name of database", () => {                                  
	            expect(_hashKey).to.contain(_dbName);        
	        });

	        it("should include name of collection", () => {                                              
	            expect(_hashKey).to.contain(_collectionName);
	        });

        });

        describe("Secundary Key", () => {

        	it("should be a string and exist", () => {                                  
            	expect(_hashKey).to.exist.and.to.be.a('string');       
        	});
        });

        describe("Store with hash key and Secundary key", () => {

        	let res:any;
        	let value:any = 1;

        	before( async () => {
        		console.log(_hashKey, _key, value)
        		await redisClient.hset( _hashKey, _key, JSON.stringify(value) );
        		res = await redisClient.hget(_hashKey, _key);
        	});        	

        	it("should write to and read from the cache", async  () => {						
				expect(parseInt(res)).to.equal(JSON.parse(value));
			});

        });


        /***
         * Close DB Connection
         */
        after( async () => {

            // close db connection
            dbTestEnvironment.closeConnection();
        
        });

    });

	

});
