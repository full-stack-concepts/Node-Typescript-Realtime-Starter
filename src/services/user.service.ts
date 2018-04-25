import path from "path";
import fs from "fs-extra";
import Promise from "bluebird";
import fetch from "node-fetch";
import fileType from "file-type";

import { Subscription } from "rxjs/subscription";
import { serviceManager } from "./services.manager";

const join = Promise.join;
Promise.promisifyAll(fs);
Promise.promisifyAll(fileType);
const uuidv1 = require("uuid/v1");

import { 
	IUser, IClient, ICustomer, IGoogleUser, IDatabasePriority, IRawThumbnail
} from "../shared/interfaces";

import { 
	TUSER, TCLIENT, TCUSTOMER,TI_RAW_THUMBNAIL
} from "../shared/types";

import { 
	UserModel, ClientModel, CustomerModel 
} from "../shared/models";

import { 
	deepCloneObject, capitalizeString, createUserSubDirectories, constructUserCredentials,
	constructProfileFullName,constructProfileSortName, createUserDirectory, isEmail, isURL,
	pathToDefaultUserThumbnail, pathToUserThumbnail, storeUserImage, validateInfrastructure, validateUserIntegrity
} from "../util";

import {
	grabEmailFromFacebookProfile,
	extractFacebookProfile,
	grabEmailFromGoogleProfile,
	extractGoogleProfile	
} from "../util";

import {
	DB_HOSTS_PRIORITY, 
	DB_CLIENTS_COLLECTION_NAME,
	DB_USERS_COLLECTION_NAME,
	DB_CUSTOMERS_COLLECTION_NAME
} from "../util/secrets";

interface IModelSetting {
	model:any,
	type: string,
	collection:string
}

interface IFileType {
	ext: string,
	mime: string
}

interface IAUserDirectory {
	dirCreated?: boolean, 
	err?:any
}

interface IAUserCreated {
	userCreated?:boolean,
	result?:any,
	err?: any
}

interface IUserActions {
	imgResult?: IRawThumbnail,
	dirResult?: IAUserDirectory,
	insertResult?: IAUserCreated
}


class UserService {

	/****
	 * DB Host Type
	 */
	private hostType:number;

	/****
	 * DBModelService Service
	 */
	private hostsService:any = serviceManager.inject("DBModelService");

	private user:IUser;	
	private gmail:string;

	private models:IModelSetting[];

	constructor() {
		this.configureSubscribers();
	}	

	private configureSubscribers():void {
		this.hostsService.models$.subscribe( (models:IModelSetting[]) => {		
			this.models = models;
		});
	}
	
	/***
	 * Find third party authenticated user by email
	 */
	private findUserByEmail():Promise<IUser> {		
		let query = { 'core.email': this.gmail };		
		return UserModel.remoteFindOneOnly(query, 'users')	
		.then(  (user:IUser) => { return Promise.resolve(user); })
		.catch( (err:any)    => { return Promise.reject(err); })	
	}	

	private cloneAndRemoveDatabaseID() {			

		let user:IUser = deepCloneObject(this.user);
		if(user && user["_id"] ) delete user._id;		
		return user;
	}

	/*****
	 * @accessToken: string, Google access token
	 * @refreshYoken: string, Google refresh token
	 * @profile: json object, Google suer profile
	 */
	public authenticateGoogleUser(accessToken:string, refreshToken:string, profile:any) {

		/**** 
		 * process thick: test for DB Hosts
		 */
		this.testForDatabaseHosts();		

		/****
		 * process thick: grab email from Google profile
		 * => use this to find sub suer item
		 */		
		return grabEmailFromGoogleProfile(profile)

		/****
		 * process thick: test for account type 
		 * => as we have defined multiple person types
		 * ( by default person, user, client, customer)
		 * we want to identify the account type and grab the user
		 */// process thick: test for account
		.then( ( email:string ) => this.testForAccountType( email) ) 


		// process thick: create new user or return 
		.then( (person:IUser|IClient|ICustomer|undefined) => {		
			console.log(person);
			if(!person) {		
				console.log("==> Create new Goolge User")					
				// process thick: build user object
				return extractGoogleProfile(profile)
				// process thick: build user object
				.then( (user:IUser) => this.newUser(user) );  
			} else {			
				console.log("==> Validate Existing Google user")
				return this.validateUser( person );		  	
			}			
		})

		// process thick: return to caller so webtoken can be created
		.then( ( user:IUser|IClient|ICustomer) => {		 	
			return Promise.resolve(user); 
		})	

		.catch( (err:any) => {
			Promise.reject(err);
		});	
	}

	/*****
	 * Set DB host Type
	 * (1) local mongo db instance
	 * (2) MLAB
	 */
	private testForDatabaseHosts():Promise<number> {

		let host:IDatabasePriority = DB_HOSTS_PRIORITY[0];
		return Promise.resolve( this.hostType = host.type );		
	}

	private userEmailQuery(email:string) {
		return { 'core.email': email  };
	}

	private testForAccountType( email:string) {	

		let query:any = this.userEmailQuery(email);
		let hostType:number = this.hostType;

		hostType =1;

		// process thick: query all <Person> Subtype collections 
		return Promise.map( this.models, (setting:IModelSetting) => {

			// Query local MongoDB				
			if(hostType === 1) {									
				return setting.model.findOne (query)
				.then( (res:any) => { return { [setting.type] : res }; })
				.catch( (err:any) => '<errorNumber2>' );	
			}

			// Query MLAB MongoDB			
			if(hostType === 2) {
				return setting.model.remoteFindOneOnly( query, setting.collection)
				.then( (res:any) => { return { [setting.type] : res }; })
				.catch( (err:any) => '<errorNumber3>' );					
			}	
		})		
	
		// process thick: evaluate query results 
		.then( (results:any) => {					

			return Promise.map( results, ( result:any) => {
				let subType:string = Object.keys(result)[0];	
				if(result[subType]) {
					let person:any = result[subType];				
					person.core['type'] = subType;					
					return Promise.resolve(person);
				} else {
					return Promise.resolve();
				}
			})			
			.then( (items:any) => {

				let person:IUser|IClient|ICustomer;
				items.forEach( (item:IUser|IClient|ICustomer, index: number | string) => {
					if(item) person = item;
				});				
				return Promise.resolve( person );
			})
		})

		// process thick: return to caller
		.then( (person:IUser|IClient|ICustomer) => Promise.resolve(person))		

		// error handler
		.catch( (err:any) => {
			console.log(err) 
			return Promise.reject(err);
		});		
	}	

	private getDefaultThumbnail():IRawThumbnail {
		let rawThumbnail:IRawThumbnail = deepCloneObject(TI_RAW_THUMBNAIL);
    	return rawThumbnail;   	
	}

	private fetchUserImage( user:IUser | IClient | ICustomer ) {

		let err:any;
		let url:string = user.profile.images.externalThumbnailUrl;
		// url="https://scontent-ams3-1.xx.fbcdn.net/v/t1.0-1/c12.12.155.155/1505426_10202353096223045_1977986292_n.jpg?_nc_cat=0&oh=85bb9b8bd69a699896427f544308c96b&oe=5B4FFB9A";
		console.log(url)

		/****
		 * If provider profile has no imageURL we assign default user image
		 */
		if(!url || (url && typeof(url) != 'string')) {
			let rawThumbnail:IRawThumbnail = this.getDefaultThumbnail();    				
    		return Promise.resolve(rawThumbnail);  
		}

		let rawThumbnail:IRawThumbnail = deepCloneObject(TI_RAW_THUMBNAIL);

		return fetch(url)
		.then( res => res.buffer())
    	.then( buffer => {

    		// get image type: extension and mime
    		try {

    			let imageType:IFileType = fileType(buffer);    
    			let userName:string = user.core.userName;
    			let extension:string = imageType.ext;    			

    			rawThumbnail = {
    				defaultImage: false,
    				buffer:buffer,
    				extension: extension,
    				mime: imageType.mime,
    				fileName: `${userName}.${extension}`
    			};
    		} 

    		catch(e) {  
    			err = e;  
    		}

    		finally {

    			/*****
    			 * Error: URL to user profile image expired or is faulty
    			 * reset default raw thumnail obejct so user get unixsex default user thumbnail
    			 */
    			if(err) {    				    		
    				rawThumbnail = this.getDefaultThumbnail();    				
    			}     		
    			return Promise.resolve(rawThumbnail);    			
    		}  	
    	})    	   
		.catch( err => Promise.reject( this.getDefaultThumbnail()) );
	}

	private insertNewUser(user:any):Promise<IAUserCreated> { 
	
		if(this.hostType === 1) {
			return UserModel.createUser(user)
			.then( res => Promise.resolve({  userCreated:true, result:res }) )
			.catch( err => Promise.reject({ userCreated:false, err: err }) );
		}

		if(this.hostType===2) {
			return UserModel.remoteCreateUser( user )
			.then( res => Promise.resolve({ userCreated:true }) )
			.catch( err => Promise.reject({ userCreated:false, err: err }) );
		}			
	}

	/****
	 * Tasks
	 * (1) Validate user directories and resources
	 * (2) Valdiate user profile for missing actions
	 * // TODO write tasks (1), (2)
	 */
	private validateUser( user:IUser|IClient|ICustomer) {	

		return Promise.join<any>(
			validateInfrastructure(user),
			validateUserIntegrity(user)
		)
		.spread( (infatructure:boolean, integrity:boolean) => {
			return Promise.resolve(user);
		})		
		.catch( (err:any) => Promise.reject(err))
	}

	/*****	
	 * (1) Fetch user thumbnail
	 * (2) Create public infrastructure for this user
	 * (3) Insert new user
	 * (4) Store Thumbnail
	 */
	private newUser( user:IUser):Promise<any> { 	
 
		// process thick: execute tasks (1, 2)					  
		return Promise.join<any>(
			this.fetchUserImage( user),
			createUserDirectory (user.core.userName),		
		).spread( (thumbnail:IRawThumbnail, userDirectory:any) => {		

			console.log( "New User: ", thumbnail, userDirectory )

			// ** Error: User Directories could not be created
			if(!userDirectory.dirCreated) {
				return Promise.reject('<errorNumber4>');
			} else {

				// Process image: assign default url to thumbnail property of user object
				if(thumbnail.defaultImage) {				
		 			user.profile.images.thumbnail = pathToDefaultUserThumbnail();

				// Process image: assing user specific thumnail url
				} else {
					user.profile.images.thumbnail = pathToUserThumbnail(thumbnail, user.core.userName);
				}
 
				// update user configuration
				user.configuration.isThumbnailSet = true;

				return Promise.resolve({ 
					user:user, 
					thumbnail:thumbnail
				});
			}				

		// process thick: execute tasks (3, 4)					 
		}).then( (result:any) => {

			return Promise.join<any>(
				storeUserImage( result.thumbnail, result.user.core.userName),
				this.insertNewUser(result.user)
			).spread( (imgStored:any, userDatabaseEntry:IAUserCreated) => {				

				/****
				 * Return user -> next step is generation of webtoken for client
				 */
				let user:IUser = userDatabaseEntry.result;  
				return Promise.resolve(user);
			})
			.catch( err => Promise.reject(err) );
		})

		// process thick: return to caller
		.then ( (user:IUser) => Promise.resolve(user) )	
		.catch( (err:any) => {
			console.log(err)
			Promise.reject(err) 
		});		 
	}
	
	public authenticateFacebookUser(token:string, fProfile:any, done:Function) {

		/**** 
		 * process thick: test for DB Hosts
		 */
		this.testForDatabaseHosts();	

		/****
		 * process thick: grab email from facebook profile
		 * => use this to find sub suer item
		 */		
		return grabEmailFromFacebookProfile(fProfile)

		/****
		 * process thick: test for account type
		 * => as we have defined multiple person types
		 * ( by default person, user, client, customer)
		 * we want to identify the account type and grab the user
		 */// process thick: test for account
		.then( ( email:string ) => this.testForAccountType( email) )

		// process thick: create new user or return 
		.then( (person:IUser|IClient|ICustomer|undefined) => {		
			if(!person) {							
				// process thick: build user object
				return extractFacebookProfile(fProfile)
				// process thick: build user object
				.then( (user:IUser) => this.newUser(user) );  
			} else {			
				return this.validateUser( person );		 	
			}
		})

		// process thick: return to caller so webtoken can be created
		.then( ( user:IUser|IClient|ICustomer) => {		 	
			return Promise.resolve(user); 
		})

		.catch( (err:any) => {
			Promise.reject(err);
		});	
	}
}

export const u:any = { 	

	authenticateGoogleUser({accessToken, refreshToken, profile }:IGoogleUser, done:Function) {	
		let instance:any = new UserService();
		instance.authenticateGoogleUser( accessToken, refreshToken, profile)  		
			.then( (user:IUser|IClient|ICustomer) => { return done(null, user);	})
			.catch( (err:any) => { return done(err); });		
	},

	authenticateFacebookUser(settings:any, done:Function) {
	
		let instance:any = new UserService();
		instance.authenticateFacebookUser( settings.accessToken, settings.profile)  
			.then( (user:IUser|IClient|ICustomer) => { return done(null, user);	})
			.catch( (err:any) => { return done(err); });
	}
}

export const testFaceBookUserAuthentication = (token:string, fbUserProfile:any, done:Function) => {

	let instance:any = new UserService();
	instance.authenticateFacebookUser( token, fbUserProfile)  
		.then( (user:IUser|IClient|ICustomer) => { return done(null, user);	})
		.catch( (err:any) => { return done(err); });
}

export const testGoogleserAuthentication = ({accessToken, refreshToken, profile }:any, done:Function) => {

	let instance:any = new UserService();
	instance.authenticateGoogleUser( accessToken, refreshToken, profile)  		
		.then( (user:IUser|IClient|ICustomer) => { return done(null, user);	})
		.catch( (err:any) => { return done(err); });		
}






