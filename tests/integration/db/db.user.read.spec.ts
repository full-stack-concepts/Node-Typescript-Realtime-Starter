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

import { IUser} from "../../../src/shared/interfaces";

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
const userRole:number = 5;

describe("Database User Read Model Methods", () => {

	let err:any;
	let users:IUser[];
	let user:IUser;

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

	it("shoud create an intance of ReadRepository", async () => {	

		let testRepo:any = new ReadRepository('User', connection, redisClient);	

		expect(testRepo).to.be.an("object");
		expect(testRepo).to.be.an.instanceOf(ReadRepository);
	
	});

	/****
	 *
	 */
	describe(" READ / findAll ", async() => {		

		before( async () => {
			try { users = await testModel.findAll(); }
			catch(e) {  err=e; }
		});

		it("return an array of users without error", async () => {				
			expect(err).to.be.undefined;
			expect(users).to.be.an("array");
			expect(users.length).to.be.gte(0);			
		});

	});

	/****
	 * 
	 */
	describe(" READ / findOne ", async() => {

		let err:any;
		let user:IUser;
		let identifier:string;

		before( async() => {
			if(users[0]) {
				
				identifier = users[0].core.email;
				try { user = await testModel.findOne({ 'core.email':identifier}); }
				catch(e) {  err=e; }

			} else {
				this.skip()
			}
		});

		it("find user without error", async () => {		

			expect(err).to.be.undefined;
			expect(user).to.be.an("object");
			expect(user.core).to.have.property('email');			
		});		
	});

	/****
	 * 
	 */
	describe(" READ / find ", async() => {

		before( async() => {				
			try { users = await testModel.find({ 'core.role':userRole}); }
			catch(e) {  err=e; }		
		});

		it("return an array of users without error", async () => {				
			expect(err).to.be.undefined;
			expect(users).to.be.an("array");
			expect(users.length).to.be.gte(0);			
		});

	});

	after( async () => {

		// close db connection
		dbTestEnvironment.closeConnection();
	
	});
	
})





