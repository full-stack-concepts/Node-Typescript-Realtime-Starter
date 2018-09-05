import { expect, assert } from "chai";
import * as chai from "chai";
import validator from "validator";

import mongoose from "mongoose";
mongoose.Promise = global.Promise;
import { Schema } from "mongoose";

interface IModelSetting {
	model:any,
	type: string,
	collection:string
}

interface IConnectAccount {
	user: string, 
	password: string,
	host:string,
	db: string, 
	port: number,
	type: number
}

/****
 * DB / Redis Settings
 */
import {	

	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER,	

	TEST_ACCOUNT_USER_DB_ADMIN,
	TEST_ACCOUNT_PRODUCT_DB_ADMIN,
	DB_MAX_POOL_SIZE,

	DB_SYSTEM_USERS,
	SYSTEM_DB_USERS_ADMIN_USER
} from "../../../../src/util/secrets";

import { 
    systemUserSchema, 
    userSchema, 
    clientSchema,
    customerSchema,
    addressSchema
} from "../../../../src/shared/schemas";


// Helpers
import { initUserDatabase, closeConnection } from "../../helpers/db.methods";
import { deepCloneInstance} from "../../helpers/functions.helper";
import { RedisController} from "../../helpers/redis.methods";
import { IUser, IClient, ICustomer} from "../../../../src/shared/interfaces";

/****
 * Test variables
 */
let userDBAccount = TEST_ACCOUNT_USER_DB_ADMIN;

/****
 *
 */
var redisClient:any;
var repository:any;
const userRole:number = 5;

var configActions:any = [];

describe("Database User Read Model Methods", () => {

	let err:Error;
	let users:IUser[] | IClient[] | ICustomer[];
	let user: IUser | IClient | ICustomer;
	let connection:any;

	let model:any;

	before( async () => {		

		/****
		 * Format Connection Object
		 */
		 const  a:IConnectAccount = DB_SYSTEM_USERS.find( 
		 	(systemUser:IConnectAccount) => systemUser.user === SYSTEM_DB_USERS_ADMIN_USER
		 );		

		/****
		 * Connection String
		 */
		const mongoURI:string =  `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${DB_MAX_POOL_SIZE}`;	

		console.log(mongoURI)

		/***
		 *
		 */	
		connection =  mongoose.createConnection( mongoURI );	

		/***
		 *
		 */	
		// connection = await initUserDatabase(userDBAccount, DB_MAX_POOL_SIZE );		

		/***
		 * Await redis client
		 */	
		redisClient = await RedisController.build();	
			
	});


	/***
	 * Schema -> Model: SystemUser
	 */
	it("shoud create a Mongoose Model for SystemUser Schema", async () => {	

  		model = connection.model('SystemUser', systemUserSchema, 'systemusers', true);
  		expect(model).to.be.an("function").and.to.exist;	  		
	});


	/***
	 * Schema -> Model: User
	 */
	it("shoud create a Mongoose Model for User Schema", async () => {	

  		model = connection.model( 'User', userSchema, 'users', true);
  		expect(model).to.be.an("function").and.to.exist;	  		
	});


	/***
	 * Schema -> Model: Client
	 */
	it("shoud create a Mongoose Model for Client Schema", async () => {	

  		model = connection.model( 'Client', userSchema, 'clients', true);
  		expect(model).to.be.an("function").and.to.exist;	  		
	});

	/***
	 * Schema -> Model: Customer
	 */
	it("shoud create a Mongoose Model for CUstomer Schema", async () => {	

  		model = connection.model( 'Client', userSchema, 'customer', true);
  		expect(model).to.be.an("function").and.to.exist;	  		
	});


	/***
	 * Schema -> Model: Address
	 */
	it("shoud create a Mongoose Model for Address Schema", async () => {	

  		model = connection.model( 'Address', userSchema, 'addresses', true);
  		expect(model).to.be.an("function").and.to.exist;	  		
	});







	

	

	/***
	 * Close DB Connection
	 */
	after( async () => {

		// close db connection
		closeConnection();
	
	});

});