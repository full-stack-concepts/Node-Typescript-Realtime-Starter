/****
 * Signal Server that we create our 
 * http server inside this module
 */
process.env.TESTING = true;

import * as http from 'http';
import request from "request";
import querystring from "querystring";
import { expect } from "chai";

import * as server from "../../../src/server";
import App from '../../../src/controllers/express.controller';
import { bootstrapController } from "../../../src/controllers";


import { 
	PORT
} from "../../../src/util/secrets"


describe("User", () => {	

	let httpServer:any;
	let err:any;	

	const postData = querystring.stringify({
    	firstName: "Jhohhy",
    	lastName: "Foe",
    	email:"foe@gmail.com",
    	password:"Aabvb@whatever53098_____",
    	confirmPassword: "Aabvb@whatever53098_____" 
	});

	before( function(done) {		
			
		// boot express server
		httpServer = http.createServer(App);
		httpServer.listen(PORT);
    	httpServer.on('error', server.onError);
    	httpServer.on('listening', function() {
        	bootstrapController.init();
    	}); 

		// wait until bootstrap procedure has finalized
		this.timeout(5000);

		return done();
	
	});

	it("should register a new user", () => {   

		
	});

	after( () => {

		/***
		 * Terminate Express
		 */
		httpServer.close();

		/****
 		 * Pass control back to 
 		 * application express server
 		*/
		process.env.TESTING = false;
	});

});



