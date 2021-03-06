/****
 * Core User Operations
 */
import Promise from "bluebird";
import fetch from "node-fetch";
import fileType from "file-type";
const uuidv1 = require("uuid/v1");

import moment from "moment-timezone";

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
	IPerson, IUser, ISystemUser, IClient, ICustomer, IDatabasePriority, IRawThumbnail, IEncryption, ILoginTracker
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

	private _userEmailQuery(email:string) {
		return { 'core.email': email  };
	}	

	/****
	 * @email:string
	 */
	protected testForAccountType( email:string) {	
		
		let query:any = this._userEmailQuery(email);
		let hostType:number = this.hostType;

		// only support localDB for now
		hostType =1;	

		// process thick: query all <Person> Subtype collections 		
		return Promise.map( PERSON_SUBTYPE_TO_MODELS, ( personType:string) => {	
			return this.findUser( personType, email) 
				.then( (res:any) => { return { [personType]: res}; })
				.catch( (err:Error) => Promise.reject(1100));				
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

				let person:ISystemUser|IUser|IClient|ICustomer;
				for(let i:number=0; i<items.length; i++) {
					let item:ISystemUser|IUser|IClient|ICustomer = items[i];		
				
					if(item && item.core && item.core.email && item.core.email === email) {					
						person = item;
					}
				};						
				return Promise.resolve( person );
			});			
		})
		
		// error handler
		.catch( (err:Error) => {		
			return Promise.reject(err);
		});				
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
			(v)?resolve(true):reject(1102);
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
		if( user.logins && Array.isArray(user.logins)) 
			_logins = cloneArray(user.logins);						
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
	                return Promise.reject(1030);
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
	                return Promise.reject(1031);
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
	                return Promise.reject(1032);
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

        if(forceMethod)
        	method = forceMethod;     

		if(user && !forceMethod) {
			return Promise.resolve({ user, encrypt });
		}

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
		.catch( (err:Error) => {		
			Promise.reject(err) 
		});		 
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
		.catch( (err:Error) => {		
			Promise.reject(err) 
		});		 
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
		.catch( (err:Error) => {		
			Promise.reject(err) 
		});		 
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
	 * Find User for this user SubType model
	 */
	protected findUser( userType:string, email:string) {

		/****
		 * Degine HostType
		 */
		const hostType:number = this.hostType;

		/****
		 * Find Model Setting for this User Type
		 */	
		const setting:IModelSetting = this._getReadModel(userType);	

		/****
		 * Define user subtype model
		 */
		const model:any = setting.model;	

		/****
		 * Define Collection
		 */
		const collection:string = setting.collection;	

		/***
		 * Define query
		 */
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
			.catch( (err:Error) => Promise.reject(1170));				
		}	

		/***
		 * MLAB MongoDB Instance
		 */			
		if(hostType === 2) {			
			return model.remoteCreateUser( user, collection)
			.then( (res:any) => { return Promise.resolve(user); })
			.catch( (err:Error) => Promise.reject(1171) );					
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

	/***
	 * Convert User Subtype to its associated DB Model
	 */
	protected convertUserSubTypeToDatabaseModel(subType:string) {
		return this._getWriteModel(subType).model;		
	}

	protected updateUser (query:any, update:any, subType?:string) {

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
				
				const model:any = this.convertUserSubTypeToDatabaseModel(subType);				
				
				return model.findOneAndUpdate (query, update)
				.then( (res:any) => Promise.resolve(res) )
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
					.catch( (err:Error) => Promise.reject(1181))	
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





