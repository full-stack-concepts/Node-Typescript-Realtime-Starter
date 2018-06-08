import querystring from "querystring";
import { expect, assert } from "chai";
import * as chai from "chai";
import chaiHttp from "chai-http";
import request from "request";
import validator from "validator";

import { createServer,createTestServer } from "../../../src/server";
import { proxyService} from "../../../src/services";

// Bootstrap Controller
import { bootstrapController } from "../../../src/controllers";

// Helpers
import { RequestMethods } from "../helpers/request.methods";
import { ICustomer, UserTokenObject, IUserDefinitions, IResponse } from "../../../src/shared/interfaces";
import { WebToken } from "../../../src/services";
import { userDefinitions } from "../helpers/user.definitions";

chai.use(chaiHttp);

/****
 * Constants used in multipe route tests
 */
const { PASSWORD, application, login, logout, find, deleteObj }:IUserDefinitions = userDefinitions();

var _httpServer:any,
	_server:any;

const defaultURI:string = RequestMethods.defaultURL();

/****
 *
 */
var methods:any;

beforeEach( async () => {
	methods = await RequestMethods.build();	
});

describe("Customer Routes", () => {

	let token:string;			
	const v:any = validator;	

	before( (done) => {

		createTestServer()
		.then( ({httpServer, server}:any) => {

			_httpServer = httpServer;	
			_server = server;		

			// BOOTSTRAP APPLICATION      	           
    		bootstrapController.init();
		});

    	/****
    	 * Await bootstap process signals databases are live
    	 */
		proxyService.userDBLive$.first().subscribe( (state:boolean) => {  			
  			done();
  		});	
	});

	/****
	 *
	 */
	describe("POST /register", () => {		
		
		let result:IResponse;	
		let body:UserTokenObject;
		let token:string;
		let decoded:any;

		it("shoud respond", async () => {		
			const url:string = `${defaultURI}/api/customer/register`;				
			result = await methods.post(url, application);		
			body = JSON.parse(result.body);
			token = body.token;
			decoded = await WebToken.decodeJWT(token);		
			console.log(decoded);
		});

		it("should respond with a 200 status",  () => expect(result.response).to.have.status(200) );		
		it("should return a JSON Object", () => expect(v.isJSON(result.body)).to.equal(true) );
		it("should return a JSON Object with a token property", () => expect(body).to.have.property('token') );
		it("should have token that is a string", () => expect(token).to.be.a('string').and.exist );
		it("should return a JSON web token that can be compiled into a USERID", async () => {
			expect(decoded.accounts).to.have.property('localID').and.to.equal(application.email);			
		});

	});

	/****
	 * 
	 */
	describe("POST /login", () => {

		let result:IResponse;	
		let body:UserTokenObject;
		let token:string;
		let decoded:any;

		before( async () => {
			const url:string = `${defaultURI}/api/customer/login`;	
			result = await methods.post(url, login);
			body = JSON.parse(result.body);
			token = body.token;
			decoded = await WebToken.decodeJWT(token);				
		});

		it("should respond with a 200 status",  () => expect(result.response).to.have.status(200) );		
		it("should return a JSON Object", () => expect(v.isJSON(result.body)).to.equal(true) );
		it("should return a JSON Object with a token property", () => expect(body).to.have.property('token') );
		it("should return a JSON web token that can be compiled into a USERID", async () => {
			expect(decoded.accounts).to.have.property('localID').and.to.equal(application.email);			
		});

	});

	/****
	 * 
	 */
	describe("POST /logout", () => {

		let result:IResponse;
		let body:UserTokenObject;

		before( async () => {
			const url:string = `${defaultURI}/api/customer/logout`;	
			result = await methods.post(url, logout);	
			body = JSON.parse(result.body);	
		});

		it("should respond with a 200 status",  () => expect(result.response).to.have.status(200) );

		it("should return a JSON Object", () => expect(v.isJSON(result.body)).to.equal(true) );

		it("should return a JSON object with <isLoggedOut> property", () => expect(body).to.have.property('isLoggedOut').and.to.be.true );

	});

	/****
	 * FIND CUSTOMER
	 */
	describe("POST /findOne", () => {

		let result:IResponse;
		let body:any;
		let customer:ICustomer;

		before( async () => {
			const url:string = `${defaultURI}/api/customer/findone`;	
			result = await methods.post(url, find);
			body = JSON.parse(result.body);
			customer = body.customer;			
		});	

		it("should respond with a 200 status",  () => expect(result.response).to.have.status(200) );
		it("should return a JSON Object", () => expect(v.isJSON(result.body)).to.equal(true) );
		it("should return a client with an email identifier", () => {
			expect(customer.core.email).to.be.a('string').and.exist;
			expect(v.isEmail(customer.core.email)).to.equal(true);
		});
		it("should return a client with an url identifier", () => expect(customer.core.url).to.be.a('string').and.exist );
		it("should return an client with infractructure identifier", () => {
			expect(customer.core.identifier).to.be.a('string').and.exist;		
			expect(v.isUUID(customer.core.identifier)).to.equal(true);
		});

	});

	/****
	 * Delete Customer
	 */
	describe("POST /delete", () => {

		let result:IResponse;
		let body:any;	

		before( async () => {
			const url:string = `${defaultURI}/api/customer/delete`;	
			result = await methods.post(url, deleteObj);		
			body = JSON.parse(result.body);			
		});

		it("should respond with a 200 status",  () => expect(result.response).to.have.status(200) );
		it("should return a JSON Object", () => expect(v.isJSON(result.body)).to.equal(true) );
		it("should return a JSON object with <isClientDeleted> property", () => expect(body).to.have.property('isCustomerDeleted').and.to.be.true );
	});


	/****
	 * Terminate Express Server
	 */
	after( () => {		
		_server.close();	
	});

});