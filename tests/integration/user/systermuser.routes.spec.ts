import querystring from "querystring";
import { expect, assert } from "chai";
import * as chai from "chai";
import chaiHttp from "chai-http";
import request from "request";
import validator from "validator";

import {
	SYSTEM_ADMIN_USER,
	SYSTEM_ADMIN_EMAIL,
	DEFAULT_PASSWORD_SYSTEM_USER,
} from "../../../src/util/secrets";

import { createServer,createTestServer } from "../../../src/server";
import { proxyService} from "../../../src/services";

// Bootstrap Controller
import { bootstrapController } from "../../../src/controllers";

// Helpers
import { RequestMethods } from "../helpers/request.methods";
import { ISystemUser, UserTokenObject, IResponse, ILoginRequest, ILogout } from "../../../src/shared/interfaces";
import { WebToken } from "../../../src/services";

chai.use(chaiHttp);

/***
 * System User login request
 */
const login:ILoginRequest = {
	email: SYSTEM_ADMIN_EMAIL,
	password: DEFAULT_PASSWORD_SYSTEM_USER
};

/***
 * Suystem User Logout request
 */
const logout:ILogout = {
	email: SYSTEM_ADMIN_EMAIL
};

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

describe("'System User Routes", () => {

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
	/*
	describe("POST /login", () => {

		let result:IResponse;	
		let body:UserTokenObject;
		let token:string;
		let decoded:any;

		before( async () => {
			const url:string = `${defaultURI}/api/systemuser/login`;	
			result = await methods.post(url, login);
			body = JSON.parse(result.body);
			token = body.token;
			decoded = await WebToken.decodeJWT(token);		
			console.log(decoded)		
		});

		it("should respond with a 200 status",  () => expect(result.response).to.have.status(200) );		
		it("should return a JSON Object", () => expect(v.isJSON(result.body)).to.equal(true) );
		it("should return a JSON Object with a token property", () => expect(body).to.have.property('token') );
		it("should return a JSON web token that can be compiled into a USERID", async () => {
			expect(decoded.accounts).to.have.property('localID').and.to.equal(login.email);			
		});

	});
	*/

	/****
	 * 
	 */
	/*
	describe("POST /logout", () => {

		let result:IResponse;
		let body:UserTokenObject;

		before( async () => {
			const url:string = `${defaultURI}/api/systemuser/logout`;	
			result = await methods.post(url, logout);	
			body = JSON.parse(result.body);	
		});

		it("should respond with a 200 status",  () => expect(result.response).to.have.status(200) );

		it("should return a JSON Object", () => expect(v.isJSON(result.body)).to.equal(true) );

		it("should return a JSON object with <isLoggedOut> property", () => expect(body).to.have.property('isLoggedOut').and.to.be.true );

	});
	*/


	/****
	 * Terminate Express Server
	 */
	after( () => {		
		_server.close();	
	});

});
