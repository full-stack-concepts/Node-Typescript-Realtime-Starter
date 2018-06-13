import querystring from "querystring";
import { expect, assert } from "chai";
import * as chai from "chai";
import validator from "validator";

// Helpers
import { 
	UserTypeMethods, 
	dbTestEnvironment,
	RedisController,
	ReadRepository,
	ReadWriteRepository
} from "../helpers/";

/****
 *
 */
import {
	testModel
} from "../../../src/shared/models/methods.model";


/****
 * Test variables
 */
var methods:any;
var connection:any;
var redisClient:any;
var repository:any;

describe("User Default Database Read Actions ", () => {

	before( async () => {

		// (1) get proxy
		methods = await UserTypeMethods.build();	

		// (2) connect to Users Database
		connection = dbTestEnvironment.initUserDatabase();		

		// (3) await redis client
		redisClient = RedisController.build();
		
		// (4) reate respository
		repository= new ReadRepository('User', connection, redisClient);	
		
		// import repository into our test model
		testModel.repo = repository;		

	});

	it("shoud do something for now", async () => {	

		expect(1).to.equal(1);
	});

	after( async () => {

		// close db connection
		dbTestEnvironment.closeConnection();


	})


})





