import { expect, assert } from "chai";
import * as chai from "chai";
import validator from "validator";

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

import {
	accountTypes
} from "../../../../src/util/secrets";

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
	'SystemUser',
	'User',
	'Client',
	'Customer'
];

/****
 *
 */
 var configActions:any = [];

 describe("Database User READWRITE Model Methods", () => {


	let err:any;
	let users:IUser[] | IClient[] | ICustomer[];
	let user: IUser | IClient | ICustomer;

 });