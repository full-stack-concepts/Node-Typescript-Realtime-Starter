/****
 * Core User Operations
 */
import Promise from "bluebird";
import fetch from "node-fetch";
import fileType from "file-type";
const uuidv1 = require("uuid/v1");

import moment from "moment-timezone";

import {
	DB_HOSTS_PRIORITY,
	PERSON_SUBTYPES,
	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER,
	TIME_ZONE, 
    DATE_FORMAT,
    TIME_FORMAT,
    MAX_LENGTH_USER_LOGINS_EVENTS,   
} from "../../util/secrets";

import { 
	userModel, clientModel, customerModel,
	UserModel, ClientModel, CustomerModel 
} from "../../shared/models";


import { dbModelService } from "./../db/db.model.service";
import { proxyService } from "./../state/proxy.service"; 

import {
	cloneArray,
	encryptPassword,
	decryptPassword,
	encryptWithInitializationVector,
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
  	storeUserImage
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

export class UserOperations {

	/***
	 * User Actions Controller
	 */
	protected uaController:any;

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
		return Promise.map( PERSON_SUBTYPES, ( personType:string) => {	

			return this.findUser( personType, email) 
				.then( (res:any) => { return { [personType]: res}; })
				.catch( (err:any) => '<errorNumber2>');				
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
				items.forEach( (item:ISystemUser|IUser|IClient|ICustomer, index: number | string) => {
					if(item) person = item;
				});				
				return Promise.resolve( person );
			})
			
		})

		// process thick: return to caller
		// .then( (person:IUser|IClient|ICustomer) => Promise.resolve(person))		

		// error handler
		.catch( (err:any) => {		
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
			(v)?resolve(true):reject('<errorNumber1>');
		});
	}

	/***
	 *
	 */
	protected hashMethod(u:any) {		
		let method = u.password.method;		
		const hash:string = encryptWithInitializationVector(method);
		u.password.method = hash;		
		return Promise.resolve(u);		
	}

	/***
	 *
	 */
	protected testPassword(pw:string):Promise<boolean> {
		let v:boolean;
		v = FormValidation.testPassword(pw);	
		return new Promise ( (resolve, reject) => {
			(v)?resolve(true):reject('<errorNumber2>');
		});		
	}	

	/****
     * Authenticatoin Tracker
     */
	protected authenticationTracker():ILoginTracker { 

	    let ts:number = Math.round(+new Date());
	    let date:Date = new Date(ts);
	    let login:ILoginTracker;
	    let err:any;
	  
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
	        if(err) throw new Error('errorNumberAuthenticationTracker');
	        if(!err) return login;
	    }  
	}

	/***
	 *
	 */
	protected testFirstName({ value, required, minLength, maxLength}:any):Promise<boolean> {		
		return this.testString(value, required, minLength, maxLength)
		.then( () => Promise.resolve(true) )
		.catch( (state:boolean) => Promise.reject('<errorNumber3>'));
	}

	/***
	 *
	 */
	protected testLastName({ value, required, minLength, maxLength}:any):Promise<boolean> {		
		return this.testString(value, required, minLength, maxLength)
		.then( () => Promise.resolve(true) )
		.catch( (state:boolean) => Promise.reject('<errorNumber4>'));
	}

	/***
	 *
	 */
	protected encryptPassword(pw:string)  {
		
		return encryptPassword(pw)		
		.then( ({hash, method}:any) => Promise.resolve( { hash, method }) )
		.catch( (err:any) => Promise.resolve('<errorNumber5>'))
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
	protected newClient(client:IClient):Promise<any> {

		// process thick: execute tasks (1, 2)					  
		return Promise.join<any>(
			this.fetchUserImage(client),
			createPublicUserDirectory (client.core.userName),	
			this.authenticationTracker()		
		).spread( (thumbnail:IRawThumbnail, userDirectory:any, login:ILoginTracker) => {				

			// ** Error: User Directories could not be created
			if(!userDirectory.dirCreated) {
				return Promise.reject('<errorNumber4>');
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
		.catch( (err:any) => {		
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
				return Promise.reject('<errorNumber4>');
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
		.catch( (err:any) => {		
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
	protected newUser( user:IUser):Promise<any> { 	
 
		// process thick: execute tasks (1, 2)					  
		return Promise.join<any>(
			this.fetchUserImage( user),
			createPublicUserDirectory (user.core.userName),	
			this.authenticationTracker()		
		).spread( (thumbnail:IRawThumbnail, userDirectory:any, login:ILoginTracker) => {				

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
		.catch( (err:any) => {		
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

		let err:any;
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
			.catch( (err:any) => {		
				console.error('<errorNumberX>'); 
			});				
		}	

		/***
		 * MLAB MongoDB instance
		 */
		if(hostType === 2) {			
			return model.remoteFindOneOnly(query, collection)	
			.then(  (user:IUser) => { return Promise.resolve(user); })
			.catch( (err:any)    => { return Promise.reject(err); });
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
			.catch( (err:any) => '<errorNumberX>');				
		}	

		/***
		 * MLAB MongoDB Instance
		 */			
		if(hostType === 2) {			
			return model.remoteCreateUser( user, collection)
			.then( (res:any) => { return Promise.resolve(user); })
			.catch( (err:any) => '<errorNumberXX>' );					
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
			return Promise.resolve(user);
		})		

		
		// process thick: update user for Authentication Provider
		.then( (user:IUser|IClient|ICustomer) => updateUserForAuthenticationProvider(profile, user) )	

		.then( ( user:IUser|IClient|ICustomer) => {

			return this.updateUser(user) 
		})
		
		// process thick: return to caller so webtoken can be created
		.then( ( user:IUser|IClient|ICustomer|any) => {					
			return Promise.resolve(user); 
		})

		.catch( (err:any) => {		
			Promise.reject(err);
		});	
	}

	protected updateUser (user:any) {

		/*****
		 * Update on local mongoDB instance
		 */
		if(this.hostType === 1) {	
			return new Promise ( (resolve, reject) => {
				user.save( (err:any) => {					
					if(err) { reject(err); } else { resolve(user); }
				});
			});		
		}

		/*****
		 * Update on MLAB
		 * TODO: test this feature
		 */
		if(this.hostType===2) {
			let userID:string = user._id;
			let _user:any = this.cloneAndRemoveDatabaseID( user);
			return userModel.remoteUpdateEntireUserObject( 'users', user._id, _user)
			.then( (res:any) => Promise.resolve(user))
			.catch( (err:any) => Promise.reject(err));
		}
	}	
	
}





