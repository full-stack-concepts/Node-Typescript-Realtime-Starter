import fs from "fs-extra";
import Promise from "bluebird";
import path from "path";
import mongoose from "mongoose";

Promise.promisifyAll(fs);
Promise.promisifyAll(mongoose);

import { IUser} from "../../shared/interfaces";
import { userModel, UserModel } from "../../shared/models"
import { deepCloneObject } from "../../util";

/****
 * Security JWT TOKEN
 */
import jwt from "jsonwebtoken";
import { readPrivateKeyForTokenAuthentication } from "../../util";

/***
 * Store private key on constant
 */
const PRIVATE_KEY:Buffer = readPrivateKeyForTokenAuthentication();

export class WebToken {

	/******
	 * Before processing any token we would like to check if a value was passed in and that we have a string
	 */
	static testCertificateValue(data:any):Promise<void> {

		return new Promise( (resolve, reject) => {
			if(!data || data && !data.hasOwnProperty('certificate') ) {
				reject(1083);			
			} else if(data && data.certificate && typeof data.certificate !== 'string') {
				reject(1084);
			} else {
				resolve();
			}
		});
	}

	/******
	 * Create JWT Token => merges defaultID, googleID or facebookID
	 */
	static createJSONWebToken( userAccounts:any ):Promise<string> {				

		return new Promise( (resolve, reject) => {			
	    	let token = jwt.sign(	    	
	        	{ accounts: userAccounts }, 
	        	// our secret key
	        	PRIVATE_KEY,
	        	{expiresIn: '21d'}
	    	);	    	
	    	return resolve(token);
	    });
	}

	/*****
	 * Verify JWT Token(secret)
	 */
	static verifyJSONWebToken(token:string):Promise<string> {		

		return new Promise( (resolve, reject) => {			

			jwt.verify(token, PRIVATE_KEY, (err, decoded) => {						

				// jwt error: certificate expired
				if(err) {		
					return reject(1080);

				} else if(decoded) {
					return resolve(token);

				// process error: empty str as output
				} else if(!decoded) {
					return reject(1080)
				}
			})
		});		
	}

	/********
	 * Decode JWT Token
	 */
	static decodeJWT(token:string):Promise<any> {	

		return new Promise( (resolve, reject) => {			

			jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
				
				// jwt process error
				if(err) {					
					return reject(1081); 						

				} else if(decoded) { 					
					return resolve(decoded); 
				}				
			});
		});
	}

	/***********
	 * Test for Account
	 * (1) Google
	 * (2) Facebook
	 * (3) Defaut Account
	 */
	 static testForAccountType(data:any):Promise<any> {  

	 	return new Promise( (resolve, reject) => {
	 		
	 		if(!data.hasOwnProperty('accounts') ) reject(1085);

	 		let accountTypes = data.accounts,
	 			accType=0,
	 			providerID='',
	 			accTypeValue;

	 		for( let type in accountTypes) {	 	
	 			if(accountTypes[type]) {	 		
	 				if(type==='googleID') { accType = 1; providerID = 'googleID'; }
	 				if(type==='facebookID') { accType = 2; providerID = 'facebookID'; }
	 				if(type==='defaultID') { accType = 3; providerID = 'defaultID'; }
	 				accTypeValue = accountTypes[type];	 			
	 			}
	 		}
	 		
	 		if(typeof accTypeValue !== 'string') {
	 			reject(1080);	 		
	 		} else if(accType === 0) {
	 			reject(1080);
	 		} else {
	 			resolve({ accountType: accType, providerID: providerID, value: accTypeValue });
	 		}
	 	
	 	});	 	
	}

	static getUser(account:any):Promise<IUser> {	

		let query:string = `{ 'accounts.${account.providerID}':'${account.value}' }`;	
		return userModel.remoteFindOneOnly(query, 'users')
		.then(  (user:IUser) => { return Promise.resolve(user); })
		.catch( (err:any) => Promise.reject(err) );
	}

	static removeDatabaseIDFromUserObject( user:IUser ) {		
		let _user:IUser = deepCloneObject(user);
		if(_user && _user['_id'] ) 	delete _user._id;		
		return _user;
	}

	static create(accounts:any, done:Function) {

		console.log("Lets create some stuff")

		// process thick: create web token
		this.createJSONWebToken(accounts)

		// process thick: verify web token
		.then( token => this.verifyJSONWebToken(token) )

		// return token to caller
		.then( token => done( null, token) )

		// error handler
		.catch( err => done(err) );
	}
}