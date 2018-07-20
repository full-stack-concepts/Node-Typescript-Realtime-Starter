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
	USER_ROLE_TYPES
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

import { 
	ISystemUser, 
	IUser, 
	IClient, 
	ICustomer
} from "../../../../src/shared/interfaces";

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

/****
 * Read Write Models
 * string is converted inside Mongoose engine
 */
const readWriteModels:string[] = [
	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER
];

/****
 *
 */
 var configActions:any = [];

 describe("Database User READWRITE Model Methods", () => {

	let err:Error;
	let users:ISystemUser[] | IUser[] | IClient[] | ICustomer[];
	let user: ISystemUser | IUser | IClient | ICustomer;

	before( async () => {

		// (1) get proxy
		methods = await UserTypeMethods.build();	

		// (2) connect to Users Database
		connection = dbTestEnvironment.initUserDatabase();		

		// (3) await redis client
		redisClient = RedisController.build();

		readWriteModels.forEach( (type:string) => {

			// clone testmodel to we can create a repo per readModel
			let model:any = deepCloneInstance(testModel);

			// find account type/role				
			let role:number;	
			const userRole:any = USER_ROLE_TYPES.find( (item:any) => item.userType === type );
			role = userRole.account;			

			// add to actions config array
			configActions.push({ type, model, repo:null, role });
		});				
	});

	
	it("shoud create an intance of ReadWriteRepository", async () => {	

		configActions.forEach( (config:any) => {			

			// (4) reate respository
			let testRepo:any = new ReadWriteRepository(config.type, connection, redisClient);	
			
			// import repository into our test model
			config.repo = testRepo;
			config.model.repo = testRepo;
			
			expect(testRepo).to.be.an("object");
			expect(testRepo).to.be.an.instanceOf(ReadWriteRepository);
		});	

	});


	

	/****
	 * Loop through all <WRITE> models: execute method <findAll>
	 */	
	describe(" READWRITE / findAll ", async() => {				

		it("return an array of systemusers, users, clients or customers without error", async () => {		

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
	 * Loop through all <READWRITE> models: execute method <findOne>
	 */	
	describe(" READWRITE / findOne ", async() => {

		it("return a single systemusers, user, client or customer without error", async () => {				

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
	 * Loop through all <READWRITE> models: execute method <find>
	 */	
	describe(" READWRITE / find ", async() => {

		it("return an array of systemusers, clients or customers without error", async () => {	

			let err:Error;	

			return configActions.forEach( async (config:any) => {	

				// Find all documents inside this collection that match condition				
				try { 
					users = await config.model.find({ 'core.role': config.role})
				}
				catch(e) {  err=e; }

				// Assert				
				finally {
					expect(err).to.be.undefined;
					expect(users).to.be.an("array");
					expect(users.length).to.be.gte(0);														
				}
			});			
		});
	});

	/****
	 * Loop through all <READWRITE> models: execute method <findOneAndUpdate>
	 */	
	describe(" READWRITE / findOneAndUpdate ", async() => {

		it("update single systemuser, user, client or customer without error", async () => {	

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
					console.log(identifier)

					// (4) find single user
					user = await config.model.findOneAndUpdate(
						{ 'core.email': identifier },
						{ $set: { 'core.role': 50}}
					);
				}

				catch(e) {  err=e; }

				finally {
					// (5) assert
					expect(err).to.be.undefined;
					expect(user).to.be.an("object");
					expect(user.core.role).to.equal(config.role);		
				}		
			});

		});
	});

	/****
	 * Loop through all <READWRITE> models: execute method <findOneAndUpdate>
	 */	
	
	describe(" READWRITE / updateMany", async() => {

		it("update multiple systemusers, user, client or customer without error", async () => {	

			
		});

	});
	

 });