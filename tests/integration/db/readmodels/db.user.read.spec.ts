import { expect, assert } from "chai";
import * as chai from "chai";
import validator from "validator";

/****
 * Settings
 */
import { 
	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER,	
} from "../../../../src/util/secrets";

// Helpers
import { 
	UserTypeMethods, 
	deepCloneInstance,
	dbTestEnvironment,
	RedisController,
	ReadRepository,
	ReadWriteRepository
} from "../../helpers/";

import { IUser, IClient, ICustomer} from "../../../../src/shared/interfaces";

/****
 * Instance of ModelMethods: holds all default Mongoose and MLAB db methods
 * @testModel:ModelMethods
 */
import { testModel } from "../../../../src/shared/models/methods.model";

/****
 * Test variables
 */
var methods:any;
var connection:any;
var redisClient:any;
var repository:any;
const userRole:number = 5;

/****
 *
 */
const readModels:string[] = [
	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER
];

/****
 *
 */
var configActions:any = [];

describe("Database User Read Model Methods", () => {

	let err:Error;
	let users:IUser[] | IClient[] | ICustomer[];
	let user: IUser | IClient | ICustomer;

	before( async () => {

		// (1) get proxy
		methods = await UserTypeMethods.build();	

		// (2) connect to Users Database
		connection = dbTestEnvironment.initUserDatabase();		

		// (3) await redis client
		redisClient = RedisController.build();

		readModels.forEach( (type:string) => {

			// clone testmodel to we can create a repo per readModel
			let model:any = deepCloneInstance(testModel);

			// add to actions config array
			configActions.push({ type, model, repo:null });

		});	
	});

	it("shoud create an intance of ReadRepository", async () => {	

		configActions.forEach( (config:any) => {			

			// (4) reate respository
			let testRepo:any = new ReadRepository(config.type, connection, redisClient);	
			
			// import repository into our test model
			config.repo = testRepo;
			config.model.repo = testRepo;
			
			expect(testRepo).to.be.an("object");
			expect(testRepo).to.be.an.instanceOf(ReadRepository);
		});	

	});

	/****
	 * Loop through all <READ> models: execute method <findAll>
	 */
	describe(" READ / findAll ", async() => {				

		it("return an array of users, clients or customers without error", async () => {		

			return configActions.forEach( async (config:any) => {	
			
				try 		{ users = await config.model.findAll(); }
				catch(e) 	{ err=e; }	

				expect(err).to.be.undefined;
				expect(users).to.be.an("array");
				expect(users.length).to.be.gte(0);	

			});
					
		});

	});

	/****
	 * Loop through all <READ> models: execute method <findOne>
	 */
	
	describe(" READ / findOne ", async() => {

		it("return a single user, client or customer without error", async () => {				

			return configActions.forEach( async (config:any) => {	

				let err:Error;
				let user:IUser;
				let identifier:string;

				try { 

					// (1) select users
					users = await config.model.findAll(); 

					// (2) skip this test of for some reason there is no suer available
					if(!users[0]) this.skip();

					// (3) grab email of this user
					identifier = users[0].core.email;

					// (4) find single user
					user = await config.model.findOne({ 'core.email':identifier});
				}

				catch(e) {  err=e; }

				finally {

					// (5) assert
					expect(err).to.be.undefined;
					expect(user).to.be.an("object");
					expect(user.core).to.have.property('email');		
				}

			});

		});		

		
	});
	

	/****
	 * Loop through all <READ> models: execute method <find>
	 */
	describe(" READ / find ", async() => {

		it("return an array of users, clients or customers without error", async () => {	

			let err:Error;	


			return configActions.forEach( async (config:any) => {	


				/***
				 * Find all documents inside this collection that match condition
				 */
				try { 

					users = await config.model.find({ 'core.role':userRole})
				}

				catch(e) {  err=e; }

				/***
				 * Assert
				 */
				finally {

					expect(err).to.be.undefined;
					expect(users).to.be.an("array");
					expect(users.length).to.be.gte(0);														
				}

			});

			
		});

	});
	
	/***
	 * Close DB Connection
	 */
	after( async () => {

		// close db connection
		dbTestEnvironment.closeConnection();
	
	});

})





