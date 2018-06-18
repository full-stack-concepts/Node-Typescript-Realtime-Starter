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
import { IUser, UserTokenObject, IUserDefinitions, IResponse } from "../../../src/shared/interfaces";
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
	// check settings
	methods.testEnvironment();
});

describe("User Routes", () => {

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
			console.log("*** USER DB is Live")		
  			done();
  		});	
	});

	/****
	 *
	 */
	describe("POST /register", () => {		
		
		let r:IResponse;	

		it("shoud respond", async () => {		
			const url:string = `${defaultURI}/api/user/register`;				
			const result:IResponse = await methods.post(url, application);
			console.log(result)
			r = result;				
		});

		it("should respond with a 200 status",  () => {
			expect(r.response).to.have.status(200);		
		});				

	
		it("should return a JSON Object", () => {						
			expect(v.isJSON(r.body)).to.equal(true);			
		});
	
		it("should return a JSON web token", () => {

			let obj:UserTokenObject = JSON.parse(r.body);
			expect(obj).to.have.property('token');

			let token:string = obj.token;
			expect(token).to.be.a('string').and.exist;
		});
	
		it("should return a JSON web token that can be compiled into a USERID", async () => {

			const obj:UserTokenObject = JSON.parse(r.body);
			const token:string = obj.token;
			const decoded:any = await WebToken.decodeJWT(token);			

			expect(decoded.accounts).to.have.property('localID').and.to.equal(application.email);			
		});
	});	  

	/****
     * 
     */
    describe("POST /login", () => {

        let r:IResponse;    

        before( async () => {
            const url:string = `${defaultURI}/api/user/login`;  
            const result:IResponse = await methods.post(url, login);
            r = result;             
        });

        it("should respond with a 200 status",  () => {
            expect(r.response).to.have.status(200);     
        });

        it("should return a JSON Object", () => {                       
            expect(v.isJSON(r.body)).to.equal(true);            
        });

        it("should return a JSON web token", () => {

            let obj:UserTokenObject = JSON.parse(r.body);
            expect(obj).to.have.property('token');

            let token:string = obj.token;
            expect(token).to.be.a('string').and.exist;
        });

        it("should return a JSON web token that can be compiled into a USERID", async () => {

            const obj:UserTokenObject = JSON.parse(r.body);
            const token:string = obj.token;
            const decoded:any = await WebToken.decodeJWT(token);            

            expect(decoded.accounts).to.have.property('localID').and.to.equal(application.email);   
        });     
    });

    /****
     * 
     */
    describe("POST /logout", () => {

        let r:IResponse;    

        before( async () => {

            const url:string = `${defaultURI}/api/user/logout`; 
            const result:IResponse = await methods.post(url, logout);
            r = result;         
        });

        it("should respond with a 200 status",  () => {
            expect(r.response).to.have.status(200);     
        });

        it("should return a JSON Object", () => {                       
            expect(v.isJSON(r.body)).to.equal(true);            
        });

        it("should return a JSON object with <isLoggedOut> property", () => {
            let obj:any = JSON.parse(r.body);
            expect(obj).to.have.property('isLoggedOut').and.to.be.true; 
        });
    });

    /****
     * FIND USER
     */
    describe("POST /findOne", () => {

        let r:IResponse;    
        let user:IUser;

        before( async () => {
            const url:string = `${defaultURI}/api/user/findone`;    
            const result:IResponse = await methods.post(url, find);
            let obj:any = JSON.parse(result.body);
            user = obj.user;    
            r = result;         
        }); 

        it("should respond with a 200 status",  () => {
            expect(r.response).to.have.status(200);     
        });

        it("should return a JSON Object", () => {                       
            expect(v.isJSON(r.body)).to.equal(true);            
        });

        it("should return a user with an email identifier", () => {
            expect(user.core.email).to.be.a('string').and.exist;
            expect(v.isEmail(user.core.email)).to.equal(true);
        });

        it("should return an user with an url identifier", () => {
            expect(user.core.url).to.be.a('string').and.exist;      
        });

        it("should return an user with infractructure identifier", () => {
            expect(user.core.identifier).to.be.a('string').and.exist;       
            expect(v.isUUID(user.core.identifier)).to.equal(true);
        });
    });

    /****
     * Delete USER
     */
    describe("POST /delete", () => {

        let r:IResponse;        
        let body:any;

        before( async () => {

            const url:string = `${defaultURI}/api/user/delete`; 
            const result:IResponse = await methods.post(url, deleteObj);
            r = result;
            body = JSON.parse(result.body);         
        });

        it("should respond with a 200 status",  () => {
            expect(r.response).to.have.status(200);     
        });

        it("should return a JSON Object", () => {                       
            expect(v.isJSON(r.body)).to.equal(true);            
        });

        it("should return a JSON object with <isUserDeleted> property", () => {     
            expect(body).to.have.property('isUserDeleted').and.to.be.true;      
        });
    });







	

	/****
	 * Terminate Express Server
	 */
	after( () => {		
		_server.close();		
	});
});



