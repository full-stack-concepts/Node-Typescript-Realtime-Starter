/****
 * Core User Operations
 */
import Promise from "bluebird";
import fetch from "node-fetch";
import fileType from "file-type";
const uuidv1 = require("uuid/v1");
import validator from "validator";
import moment from "moment-timezone";
import mongoose from "mongoose";

import { PersonProfile} from "./user.profile.service";

import {
	DB_HOSTS_PRIORITY,
	PERSON_SUBTYPES,
	PERSON_SUBTYPE_TO_MODELS,
	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER,
	TIME_ZONE, 
    DATE_FORMAT,
    TIME_FORMAT,
    MAX_LENGTH_USER_LOGINS_EVENTS,   
    RANDOMIZE_PASSWORD_ENCRYPTION
} from "../../util/secrets";

import { 
	userModel, clientModel, customerModel,
	UserModel, ClientModel, CustomerModel 
} from "../../shared/models";


import { dbModelService } from "./../db/db.model.service";
import { proxyService } from "./../state/proxy.service"; 

import {
	cloneArray,	
	FormValidation,
	constructUserCredentials,
	constructProfileFullName,
	capitalizeString,
	deepCloneObject,
	pathToDefaultUserThumbnail,
	pathToUserThumbnail,
	constructProfileSortName,
	isEmail,
  	isURL,
  	validateInfrastructure,
  	validateUserIntegrity,  	
  	updateUserForAuthenticationProvider,
  	createPublicUserDirectory,
  	storeUserImage,
  	pickPasswordEncryptionMethod,
  	encryptWithInitializationVector,
	decryptWithInitializationVector,
	encryptWithCrypto,
	decryptWithCrypto,
	encryptWithBcrypt,
	decryptWithBcrypt
} from "../../util";

import {
	IPerson, IUser, ISystemUser, IClient, ICustomer, IDatabasePriority, IRawThumbnail, IEncryption, 
	ILoginTracker, IPasswordTracker, IDeleteUser, IChangePassword
} from "../../shared/interfaces"; 

import {
	TI_RAW_THUMBNAIL,
	TUSER
} from "../../shared/types";

interface IModelSetting {
	model:any,
	type: string,
	collection:string
}

interface IFileType {
	ext: string,
	mime: string
}

/****
 * Import Data Action Identifgiers
 */
import {
	DATA_CREATE_USER_TYPE,
	DATA_FORMAT_USER_SUBTYPE	
} from "../../controllers/actions";

import {
	errorController
} from "../../controllers";

export class UserOperations extends PersonProfile {

	/***
	 * Instance of User Actions Controller
	 */
	protected uaController:any;

	/***
	 * Instance of Data Actions Controller
	 */
	protected daController:any;

	/****
	 * DB Host Type
	 * decided where MongoDB operatoins are performed
	 */
	protected hostType:number;

	/****
	 * All PERSON READ models
	 */
	protected readModels:IModelSetting[];

	/****
	 * All PERSON WRITE models
	 */
	protected writeModels:IModelSetting[];

	/****
	 * Data Model Service
	 */
	private dbModelService:any = dbModelService;

	/****
	 * Local DB instance
	 */
	protected db:any;

	protected user:IUser;

	constructor() {

		super();

		/***
		 * Local Subscribers
		 */
		this.configureMySubscribers();

		/**** 
		 * test for DB Hosts
		 */
		this.testForDatabaseHosts();
	}

	/*****
	 * Set DB host Type
	 * (1) local mongo db instance
	 * (2) MLAB
	 */
	protected testForDatabaseHosts():Promise<number> {

		let host:IDatabasePriority = DB_HOSTS_PRIORITY[0];
		return Promise.resolve( this.hostType = host.type );		
	}

	/****
	 * Class subscribers
	 */
	private configureMySubscribers():void {

		this.dbModelService.readModels$.subscribe( (models:IModelSetting[]) => this.readModels = models );
		this.dbModelService.writeModels$.subscribe( (models:IModelSetting[]) => this.writeModels = models );

		/****
		 * Listen to incoming instance of UA Controller
		 */
        proxyService.uaController$.subscribe( (state:boolean) => {        	       	        	
        	if(proxyService._uaController) this.uaController = proxyService._uaController;           
        });  


		/****
		 * Subscriber: when proxyService flags that localDB is connected
		 * we want to fetch dbInstance so we can create roles for system user accounts
		 */		
		proxyService.userDBLive$.subscribe( (state:boolean) => {		
			if(proxyService.userDB) this.db = proxyService.userDB;						
		});		
	}

	/****
	 *
	 */
	public findUserSubDocument($query:Object, $filter:Object={}) {

		// Define HostType, model, collection and query
		const hostType:number = this.hostType;

		// process thick: query all <Person> Subtype collections 		
		return Promise.map( PERSON_SUBTYPE_TO_MODELS, ( personType:string) => {	

			let setting:IModelSetting = this._getReadModel(personType);
			let model:any = setting.model;		
			let collection:string = setting.collection;				
			
			if(hostType === 1) {
				return model.find($query) 
				.then( (res:any) => { return { [personType]: res[0]}; })
				.catch( (err:Error) => Promise.reject(1100));		
			}				
		})		

		// process thick: evaluate query results 
		.then( (results:any) => {	

			let doc:any;							
			results.forEach( (result:any) => {
				let personType:string = Object.keys(result)[0];			
				if(result[personType]) doc = result[personType];	
			});	

			return new Promise( (resolve, reject) => {
				(doc)?resolve(doc):reject(1100)
			});

		})
		.catch( (err:Error) => Promise.reject(1100));		
	}

	/****
	 * Find <Person> in either collection: systemusers, users, clients, customers
	 * @email:string
	 * @id: Mongoose ID String
	 */
	public testForAccountType( email:string, id?:string) {	

		
		let hostType:number = this.hostType;

		// only support localDB for now
		hostType =1;	

		// process thick: query all <Person> Subtype collections 		
		return Promise.map( PERSON_SUBTYPE_TO_MODELS, ( personType:string) => {	

			/***
			 * Search By Mongoose ID of Person
			 */
			if(id) {			
				return this.findUserById(personType, id) 
				.then( (res:any) => { return { [personType]: res}; })
				.catch( (err:Error) => Promise.reject(1100));	

			/***
			 * Search By Person's email address
			 */
			} else {
				return this.findUserByEmail( personType, email) 
				.then( (res:any) => { return { [personType]: res}; })
				.catch( (err:Error) => Promise.reject(1100));			
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

			/***
			 * Test if item matches provided email or Mongoose ID
			 */
			.then( (persons:any) => {			

				let result:any;
				return new Promise( (resolve, reject) => {
					persons.map( (person:ISystemUser|IUser|IClient|ICustomer) => {					
						if(person) result = person;					
					});				
					(result)?resolve(result):reject(1100);
				});			
			});			
		})
		
		// error handler
		.catch( (err:Error) => Promise.reject(err) );				
	}	

	protected cloneAndRemoveDatabaseID(_user:IUser|IClient|ICustomer) {			

		let user:IUser|IClient|ICustomer = deepCloneObject(_user);
		if(user && user["_id"] ) delete user._id;		
		return user;
	}

	private  testString(str:string, required?:boolean, minLength?:number, maxLength?:number):Promise<boolean> {

		const f:any = FormValidation;
		let v:boolean;		
		let tests:boolean[]=[];

		tests.push( f.isString(str) );

		if(required) tests.push( f.required(str) );
		if(minLength) tests.push(f.minLength(str, minLength) );
		if(maxLength) tests.push(f.maxLength(str, maxLength) );

		const valid = tests.every( (v:boolean) => v === true );	

		return new Promise ( (resolve, reject) => {
			(valid)?resolve(true):reject(false);
		});		
	}	

	/***
	 * 
	 */
	protected testUserEmail(email:string):Promise<boolean> {
		let v:boolean;
		v=FormValidation.isEmail(email);
		return new Promise ( (resolve, reject) => {
			(v)?resolve(true):reject(1101);
		});
	}	

	/***
	 *
	 */
	protected testPassword(pw:string):Promise<boolean> {
		let v:boolean;
		v = FormValidation.testPassword(pw);		
		return new Promise ( (resolve, reject) => {
			(v)?resolve(true):reject(11205);
		});		
	}	

	/****
     * Authenticatoin Tracker
     */
	protected authenticationTracker():ILoginTracker { 

	    let ts:number = Math.round(+new Date());
	    let date:Date = new Date(ts);
	    let login:ILoginTracker;
	    let err:Error;
	  
	    try {
	        login = {
	            timestamp: ts,
	            date: moment(date).tz( TIME_ZONE ).toString(),
	            formattedDate:  moment(date).tz( TIME_ZONE ).format( DATE_FORMAT ),
	            formattedTime: moment(date).tz( TIME_ZONE ).format( TIME_FORMAT )
	        };   
	    }
	    catch(e) { err =e; }
	    finally {	      
	        if(err) throw new Error('1110');
	        if(!err) return login;
	    }  
	}

	/***
	 *
	 */
	protected updateLoginsArray(
		user:ISystemUser|IUser|IClient|ICustomer,
		login:ILoginTracker
	):ILoginTracker[] {		
		let _logins:ILoginTracker[]=[];		
		if( user.logins && Array.isArray(user.logins)) _logins = cloneArray(user.logins);						
		_logins.push(login);	
		return _logins;
	}

	/***
	 *
	 */
	protected testFirstName({ value, required, minLength, maxLength}:any):Promise<boolean> {		
		return this.testString(value, required, minLength, maxLength)
		.then( () => Promise.resolve(true) )
		.catch( (state:boolean) => Promise.reject(1120));
	}

	/***
	 *
	 */
	protected testLastName({ value, required, minLength, maxLength}:any):Promise<boolean> {		
		return this.testString(value, required, minLength, maxLength)
		.then( () => Promise.resolve(true) )
		.catch( (state:boolean) => Promise.reject(1121));
	}

	/***
	 * @user: ISustemUser|IClient|ICustomer|IUser
	 * @decrypt: {method, hash, data}:IEncryption
	 */
	protected validateUserPassword(user:any, password:string) {

		/***
		 * If no user/client/customer found grapghql mutatoin query is calling wrong collectoin
		 */
		if(!user) return Promise.reject(11206)

		let decrypt:IEncryption = {
			hash: user.password.value, 
			method: user.password.method,  
			data:password 
		};		

		// Crypto with Initialization Vector
		if(decrypt.method === 1) {
			 return decryptWithInitializationVector(String(decrypt.hash))
	        .then( (decrypted:string) => {  	           
	            if( decrypted===decrypt.data) {
	                return Promise.resolve(user)
	            } else {
	                return Promise.reject(11200);
	            }
	        })
	        .catch( (err:Error) => Promise.reject(err));
		}

		// Method 2: Crypto  
	    else if(decrypt.method === 2) {    
	        return decryptWithCrypto(decrypt.hash)
	        .then( (decrypted:string|Buffer) => {
	            if( decrypted === decrypt.data) {
	                return Promise.resolve(user)
	            } else {
	                return Promise.reject(11201);
	            }
	        })
	        .catch( (err:Error) => Promise.reject(err));      
	    }

	    // Method 3: Bcrypt
	    else if(decrypt.method === 3) {    	       
	        return decryptWithBcrypt(decrypt.data, String(decrypt.hash))
	        .then( (valid:any) => {
	            if(valid) {
	                return Promise.resolve(user)
	            } else {
	                return Promise.reject(11202);
	            }
	        })
	        .catch( (err:Error) => Promise.reject(err) );
	    }		
	}	

	/***
	 *
	 */
	protected encryptPassword(user:any, pwd:string, forceMethod?:number) {	

		let method:number = pickPasswordEncryptionMethod();
		let encrypt:IEncryption = {};

		if(!RANDOMIZE_PASSWORD_ENCRYPTION)
        	method = 3;   

        if(forceMethod) method = forceMethod;     		
	
		 //Method 1: Crypt with Initialization Vector
	    if(method===1) {  	    	
	        return encryptWithInitializationVector(pwd)
	        .then( (hash:string) => {
	        	encrypt = {	method, hash, data:pwd };
	        	return Promise.resolve({ user, encrypt});
	        }) 
	        .catch( (err:Error) => Promise.reject(1035));
	    }

	    // Method 2: Crypto  
	    else if(method === 2) {
	        return encryptWithCrypto(pwd)
	        .then( (hash:string) => {
	        	encrypt = {	method, hash, data:pwd };
	        	return Promise.resolve({ user, encrypt});
	        }) 
	        .catch( (err:Error) => Promise.reject(1036));
	    }   

	    // Method 3: Bcrypt/
	    else if(method === 3) {      
	        return encryptWithBcrypt(pwd)
	        .then( (hash:string) => {
	        	encrypt = {	method, hash, data:pwd };	        	
	        	return Promise.resolve({ user, encrypt});
	        }) 
	        .catch( (err:Error) => Promise.reject(1038))
	    }       		
	}

	protected serializeUser(user:any):string {		
		return JSON.stringify(user);		
	}

	public deSerializeUser(userStr:string, done:any):IUser|IClient|ICustomer {	
		return JSON.parse(userStr);	
	}	

	protected _getDefaultThumbnail():IRawThumbnail {
		let rawThumbnail:IRawThumbnail = deepCloneObject(TI_RAW_THUMBNAIL);
    	return rawThumbnail;   	
	}

	/*****
	 *
	 */
	protected newClient(client:IUser|IClient|ICustomer):Promise<any> {

		// process thick: execute tasks (1, 2)					  
		return Promise.join<any>(
			this.fetchUserImage(client),
			createPublicUserDirectory (client.core.userName),	
			this.authenticationTracker()		
		).spread( (thumbnail:IRawThumbnail, userDirectory:any, login:ILoginTracker) => {				

			// ** Error: User Directories could not be created
			if(!userDirectory.dirCreated) {
				return Promise.reject(1150);
			} else {

				// Process image: assign default url to thumbnail property of user object
				if(thumbnail.defaultImage) {				
		 			client.profile.images.thumbnail = pathToDefaultUserThumbnail();

				// Process image: assing user specific thumnail url
				} else {
					client.profile.images.thumbnail = pathToUserThumbnail(thumbnail, client.core.userName);
				}
 
				// update user configuration
				client.configuration.isThumbnailSet = true;

				let logins:ILoginTracker[];
				if( client.logins && Array.isArray(client.logins)) {
					logins = cloneArray(client.logins);
				} else {
					logins = [];
				}							
				logins.push(login);
				client.logins=logins;		

				return Promise.resolve({ 
					client:client, 
					thumbnail:thumbnail
				});
			}	

		// process thick: execute tasks (3, 4)					 
		}).then( (result:any) => {			

			return Promise.join<any>(
				storeUserImage( result.thumbnail, result.client.core.userName),
				this.insertUser( PERSON_SUBTYPE_CLIENT, result.client)
			).spread( (imgStored:any, user:IUser|IClient|ICustomer) => {	

				/****
				 * Return user -> next step is generation of webtoken for client application
				 */						
				return Promise.resolve(client);
			})
			.catch( err => Promise.reject(err) );
		})

		// process thick: return to caller
		.then ( (client:IClient) => Promise.resolve(client) )	
		.catch( (err) => Promise.reject(err) );		 
	}		

	/*****
	 *
	 */
	protected newCustomer(customer:ICustomer):Promise<any> {

		// process thick: execute tasks (1, 2)					  
		return Promise.join<any>(
			this.fetchUserImage(customer),
			createPublicUserDirectory (customer.core.userName),	
			this.authenticationTracker()		
		).spread( (thumbnail:IRawThumbnail, userDirectory:any, login:ILoginTracker) => {				

			// ** Error: User Directories could not be created
			if(!userDirectory.dirCreated) {
				return Promise.reject(1151);
			} else {

				// Process image: assign default url to thumbnail property of user object
				if(thumbnail.defaultImage) {				
		 			customer.profile.images.thumbnail = pathToDefaultUserThumbnail();

				// Process image: assing user specific thumnail url
				} else {
					customer.profile.images.thumbnail = pathToUserThumbnail(thumbnail, customer.core.userName);
				}
 
				// update user configuration
				customer.configuration.isThumbnailSet = true;

				let logins:ILoginTracker[];
				if( customer.logins && Array.isArray(customer.logins)) {
					logins = cloneArray(customer.logins);
				} else {
					logins = [];
				}							
				logins.push(login);
				customer.logins=logins;		

				return Promise.resolve({ 
					customer:customer, 
					thumbnail:thumbnail
				});
			}	

		// process thick: execute tasks (3, 4)					 
		}).then( (result:any) => {			

			return Promise.join<any>(
				storeUserImage( result.thumbnail, result.customer.core.userName),
				this.insertUser( PERSON_SUBTYPE_CUSTOMER, result.customer)
			).spread( (imgStored:any, customer:IUser|IClient|ICustomer) => {	

				/****
				 * Return user -> next step is generation of webtoken for client application
				 */						
				return Promise.resolve(customer);
			})
			.catch( err => Promise.reject(err) );
		})

		// process thick: return to caller
		.then ( (customer:ICustomer) => Promise.resolve(customer) )	
		.catch( (err:Error) => Promise.reject(err) );		 
	}		

	/*****	
	 * (1) Fetch user thumbnail
	 * (2) Create public infrastructure for this user
	 * (3) Create authentication time object
	 * (4) Insert new user
	 * (5) Store Thumbnail
	 */
	protected newUser( user:IUser|IClient|ICustomer):Promise<any> { 			
 
		// process thick: execute tasks (1, 2)					  
		return Promise.join<any>(
			this.fetchUserImage( user),
			createPublicUserDirectory (user.core.userName),	
			this.authenticationTracker()		
		).spread( (thumbnail:IRawThumbnail, userDirectory:any, login:ILoginTracker) => {				

			// ** Error: User Directories could not be created
			if(!userDirectory.dirCreated) {
				return Promise.reject(1150);
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

				let logins:ILoginTracker[];
				if( user.logins && Array.isArray(user.logins)) {
					logins = cloneArray(user.logins);
				} else {
					logins = [];
				}							
				logins.push(login);
				user.logins=logins;		

				return Promise.resolve({ 
					user:user, 
					thumbnail:thumbnail
				});
			}					

		// process thick: execute tasks (3, 4)					 
		}).then( (result:any) => {			

			return Promise.join<any>(
				storeUserImage( result.thumbnail, result.user.core.userName),
				this.insertUser( PERSON_SUBTYPE_USER, result.user)
			).spread( (imgStored:any, user:IUser|IClient|ICustomer) => {	

				/****
				 * Return user -> next step is generation of webtoken for client application
				 */						
				return Promise.resolve(user);
			})
			.catch( err => Promise.reject(err) );
		})

		// process thick: return to caller
		.then ( (user:IUser) => Promise.resolve(user) )	
		.catch( (err:Error) => Promise.reject(err) );		 
	}	

	/****
	 *
	 */
	protected evalThumbnailObjectThenSetPath({ user, thumbnail }:any) {
		// Process image: assign default url to thumbnail property of user object
		if(thumbnail.defaultImage) {				
 			user.profile.images.thumbnail = pathToDefaultUserThumbnail();

		// Process image: assing user specific thumnail url
		} else {
			user.profile.images.thumbnail = pathToUserThumbnail(thumbnail, user.core.userName);
		}

		return Promise.resolve({
			thumbnail:thumbnail,
			user:user
		});
	}

	/****
	 * Fetch User Image
	 * return default url or fetch thumnail from external provider
	 */
	protected fetchUserImage( user:ISystemUser|IUser|IClient|ICustomer ) {

		let err:Error;
		let url:string = user.profile.images.externalThumbnailUrl;		

		/****
		 * If provider profile OR new user has no imageURL we assign default user image
		 */
		if(!url || (url && typeof(url) != 'string')) {
			let rawThumbnail:IRawThumbnail = this._getDefaultThumbnail();    				
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
    				rawThumbnail = this._getDefaultThumbnail();    				
    			}     		
    			return Promise.resolve(rawThumbnail);    			
    		}  	
    	})    	   
		.catch( err => Promise.reject( this._getDefaultThumbnail()) );
	}

	// _getModelSetting

	/***
	 * Get READ MODEL
	 */
	private _getReadModel(userType:string):IModelSetting{

		const model:IModelSetting = this.readModels.find( (setting:IModelSetting) => {
			return (setting.type === userType);
		});	
		return model;	
	}

	/***
	 * GET WRITE MODEL
	 */
	private _getWriteModel(userType:string):IModelSetting{

		const model:IModelSetting = this.writeModels.find( (setting:IModelSetting) => {
			return (setting.type === userType);
		});
		return model;	
	}

	/***
	 * Find User for this user SubType model by email
	 */
	protected findUserByEmail( userType:string, email:string) {

		// Define HostType, model, collection and query
		const hostType:number = this.hostType;
		const setting:IModelSetting = this._getReadModel(userType);
		const model:any = setting.model;		
		const collection:string = setting.collection;		
		const query = { 'core.email': email };		

		/***
		 * Local MongoDB instance
		 */		
		if(hostType === 1) {							
			return model.findOne( query )
			.then( (u:any) => { return Promise.resolve(u); })
			.catch( (err:Error) => Promise.reject(1160) ); 		
		}	

		/***
		 * MLAB MongoDB instance
		 */
		if(hostType === 2) {			
			return model.remoteFindOneOnly(query, collection)	
			.then(  (user:IUser) => { return Promise.resolve(user); })
			.catch( (err:Error)    => { return Promise.reject(err); });
		}
	}

	/***
	 * Find User for this user SubType model by id
	 */
	protected findUserById( userType:string, id:string) {

		// Define HostType, model, collection and query
		const hostType:number = this.hostType;
		const setting:IModelSetting = this._getReadModel(userType);
		const model:any = setting.model;		
		const collection:string = setting.collection;					

		/***
		 * Local MongoDB instance
		 */		
		if(hostType === 1) {							
			return model.findById(id.toString())
			.then( (u:any) => { return Promise.resolve(u); })
			.catch( (err:Error) => Promise.reject(1160) ); 		
		}	

		/***
		 * MLAB MongoDB instance
		 */
		if(hostType === 2) {			
			
		}
	}

	protected _initSequence():Promise<any> {
   		return Promise.resolve();
    }  

	/***
	 * Delete User (called by child class Person subtype)
	 */
	protected deleteUser(userType: string, request:IDeleteUser) {

		/****
		 * Find Model Setting for this User Type
		 */	
		const setting:IModelSetting = this._getWriteModel(userType);	

		/****
		 * Define user subtype model
		 */
		const model:any = setting.model;		

		/****
		 * Test if a user identifier was provided (email/url/UUID)
		 */
		type key = keyof IDeleteUser;
		let keys:string[] = Object.keys(request);
		let ID:string;
		let field:string;

		keys.forEach( (key:any) => {			
			if(request[key]) {
				field = `core.${key}`;
				ID = request[key];
			}
		});			

		return this._initSequence()
		.then( () => {
			let errorID:number;
			if(!field || !ID) errorID = 11185; 
			if(!model) errorID = 11186;
			if(errorID) { return Promise.reject(errorID);}
			else { return Promise.resolve(); }		
		})
		.then( () => model.remove({ [field]:[ID]}) )
		.then( () => Promise.resolve() )
		.catch( (err:any) => Promise.reject(err) );
	}

	private createPasswordTracker(
		user:IUser|IClient|ICustomer 
	):IPasswordTracker {

		const DateTimeObject:any = this.dateTimeFormatter();

		return {
			timestamp: DateTimeObject.ts,
	        date: DateTimeObject.date,
	        isoDate: DateTimeObject.isoDate,
	        hash: user.password.value,
    		method: user.password.method
		}		
	}

	/***
	 *
	 */
	private addPasswordTracker(
		user:IUser|IClient|ICustomer, 
		encrypt:IEncryption
	) {
		
	    let tracker:IPasswordTracker;
	    let h:IPasswordTracker[];
	    let _trackers:IPasswordTracker[];
	    let err:Error;
	  
	    try {

	        tracker = this.createPasswordTracker(user);    	     
	        h = user.password.history;
	        if(!h || (h && !Array.isArray(h))) h = [];
	        _trackers = cloneArray(h);
	        _trackers.push(tracker);

	        user.password.history = _trackers;	
	       
	    }
	    catch(e) { err =e; }
	    finally {	      
	        if(err) throw new Error('11207');
	        if(!err) return { user, encrypt };
	    }  
	}

	/***
	 *
	 */
	protected changePassword(userType: string, request:IChangePassword) {

		/****
		 * Find Model Setting for this User Type => Define user subtype model
		 */	
		const setting:IModelSetting = this._getWriteModel(userType);		
		const model:any = setting.model;	

		/****
		 * Test if a user identifier was provided (email/UUID)
		 */
		let userID:string = request.id;	
		let currentUser:IUser|IClient|ICustomer;
		let errorID:number;				

		return this._initSequence()

		// process thick: validate request object
		.then( () => {
			if(!request.id || (request.id && typeof(request.id) != 'string')) errorID = 11200;			
			if(request.oldPassword === request.password) errorID = 11203;
			if(request.password != request.confirmPassword) errorID = 11204;					
			if(errorID) { return Promise.reject(errorID);}
			else { return Promise.resolve(); }		
		})

		// process thick: test new password
		.then( () => this.testPassword(request.password) )

		// process thick: test confirmation password
		.then( () => this.testPassword(request.confirmPassword) )		

		// process thick: get user/client/customer
		.then( () => model.findById(userID) )

		// process thick: validate current password
		.then( (user:IUser|IClient|ICustomer) => this.validateUserPassword(user, request.oldPassword) )

		// process thick: encrypt new password
		.then( (user:IUser|IClient|ICustomer) => this.encryptPassword(user, request.password) )

		// process thick: create password tracker object then add it so security history array
		.then( ({user, encrypt}:any ) => this.addPasswordTracker(user, encrypt) )

		// process thick: save new encrypted password
		.then( ({user, encrypt}:any) =>  this.updateUser(
				{'_id': request.id },
				{ 	$set: { 
						'security.isPasswordEncrypted': true, 
						'password.value': encrypt.hash,
						'password.method': encrypt.method,
						'password.history': user.password.history					
					}
				})
		)

		// process thick: return to caller 
		.then( () => Promise.resolve() )		
		
		// error handling: error processed by caller 
		.catch( (err:any) => Promise.reject(err) ); 
	}

	/***
	 * Create New User per model
	 */
	protected insertUser( userType:string, user:IPerson|ISystemUser|IUser|IClient|ICustomer) {
	
		/****
		 * Degine HostType
		 */
		const hostType:number = this.hostType;		

		/****
		 * Find Model Setting for this User Type
		 */
		const setting:IModelSetting = this._getWriteModel(userType);		

		/****
		 * Define user subtype model
		 */
		const model:any = setting.model;		

		/****
		 * Define Collection
		 */
		const collection:string = setting.collection;		

		/***
		 * Local MongoDB instance
		 */		
		if(hostType === 1) {		

			return model.createUser(user)
			.then( (res:any) => { return Promise.resolve(res) })
			.catch( (err:Error) => Promise.reject(11170));	
		}	

		/***
		 * MLAB MongoDB Instance
		 */			
		if(hostType === 2) {			
			return model.remoteCreateUser( user, collection)
			.then( (res:any) => { return Promise.resolve(user); })
			.catch( (err:Error) => Promise.reject(11171) );					
		}
	}	

	/****
	 * Tasks
	 * (1) Validate user directories and resources
	 * (2) Valdiate user profile for missing actions
	 * (3) Create authentication time object
	 * (4) Add auth time to user object
	 * (5) update user for different Authentication Provider if necessary
	 * // TODO extend tasks (1), (2)
	 */
	protected validateUser( profile:any, user:IUser|IClient|ICustomer) {		

		// process thick: tasks (1) (2) (3)
		return Promise.join<any>(
			validateInfrastructure(user),
			validateUserIntegrity(user),
			this.authenticationTracker()	
		)

		// process thick: task (4)
		.spread( (infatructure:boolean, integrity:boolean, login:ILoginTracker) => {	
			
			// TODO: put this in new function
			let logins:ILoginTracker[];
			if( user.logins && Array.isArray(user.logins)) {				
				logins = cloneArray(user.logins);		
			} else {
				logins = [];
			}							
			logins.push(login);
			user.logins=logins;				
			return Promise.resolve({user, logins});
		})		

		
		// process thick: update user for Authentication Provider
		.then( ({ user, logins}:any) => {
			return 	updateUserForAuthenticationProvider(profile, user)	
					.then( (user:any) => Promise.resolve( {user, logins}))
		})

		.then( ({ user, logins}:any) => {

			return this.updateUser(
				{'core.email': user.core.email },
				{ 	$set: { 
						'configuration': user.configuration, 
						'profile': user.profile,
						'accounts': user.accounts,
						'logins': logins
					}
				}
			) 
			.then( () => Promise.resolve(user))
			.catch( (err:Error) => Promise.reject(err));
		})
		
		// process thick: return to caller so webtoken can be created
		.then( ( user:ISystemUser|IUser|IClient|ICustomer|any) => {				
			return Promise.resolve(user); 
		})

		.catch( (err:Error) => {		
			Promise.reject(err);
		});	
	}	


	public updateUser (query:any, update:any, subType?:string) {

		/*
		let ts:number = Math.round(+new Date());
	    let date:Date = new Date(ts);

	    console.log("*** incoming update ", update)

	    if(update.hasOwnProperty('$set')) {
	    	console.log("(1) clone update object" )
	    	let obj = deepCloneObject(update.$set);
	    	obj['updatedAt'] = date;
	    	console.log("(2) Add date field ")	    	
	    	update.$set = obj;
	    	console.log("(3) ", update)

	    	
	    } else {
	    	console.log("*** wrong update")
	    }
	    */

		/*****
		 * HOST TYPE 1
		 */
		if(this.hostType === 1) {		

			/***
			 * Scenario 1: User subtype is provided
			 * (1) look up model is subTtype is provided
			 * (2) then update user
			 */ 
			if(subType && typeof(subType) === 'string') {				
				
				const model:any = this._getWriteModel(subType).model;				

				return model.findOneAndUpdate (query, update)				
				.then( (res:any) => Promise.resolve() )
				.catch( (err:Error) => Promise.reject(1180) );	


			/*****
			 * Scenario (2) User subtype is unknown (Google or Facebook Authentication)
		 	 * Loop through user subtype collections 
		 	 * update user if document is part of this collection
		 	 */
			} else {

				return Promise.all( PERSON_SUBTYPE_TO_MODELS.map ( ( subType:string) => {

					const setting:IModelSetting = this._getWriteModel(subType);	
					const model:any = setting.model;	
					return model.findOneAndUpdate (query, update)
					.then( (res:any) => Promise.resolve(res))
					.catch( (err:Error) => Promise.reject(1181) )	
				}))
				.then( () => Promise.resolve() )
				.catch( (err:Error) => Promise.reject(err));

			}
		}		

		/*****
		 * Update on MLAB
		 * TODO: test this feature
		 */
		else if(this.hostType===2) {
			
		}
	}		
}

/****
 * Public Interface for User Actions Controller
 */
class ActionService {	

	public testForAccountTypeById( id:string) {
		console.log("*** Get user by id ", id)
		let instance:any = new UserOperations();
		return instance.testForAccountType(null , id)
			.then( (user:any) => Promise.resolve(user) )
			.catch( (err:Error) => Promise.reject(err) );
	}	

	public testForAccountTypeByEmail( email:string) {
		console.log("*** Get user by Email ", email)
		let instance:any = new UserOperations();
		return instance.testForAccountType(email)
			.then( (user:any) => Promise.resolve(user) )
			.catch( (err:Error) => Promise.reject(err) );
	}	

	public updateUser(query:any, update:any, subType?:string ) {
		console.log("*** Update User ")
		let instance:any = new UserOperations();
		return instance.updateUser(query, update, subType)
			.then( () => Promise.resolve() )
			.catch( (err:Error) => Promise.reject(err) );
	}	

	public findUserSubDocument($query:Object, $filter:Object={}) {
		console.log("*** Find User Sub Document ", $query)		
		let instance:any = new UserOperations();
		return instance.findUserSubDocument($query, $filter)
			.then( (doc:any) => Promise.resolve(doc) )
			.catch( (err:Error) => Promise.reject(err) );

	}
}

export const userOperationsService:any = new ActionService();





