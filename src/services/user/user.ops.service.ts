/****
 * Core User Operations
 */
import Promise from "bluebird";
import fetch from "node-fetch";
import fileType from "file-type";
const uuidv1 = require("uuid/v1");

import {
	DB_HOSTS_PRIORITY,
	PERSON_SUBTYPES,
	PERSON_SUBTYPE_SYSTEM_USER
} from "../../util/secrets";

import { dbModelService } from "./../db/db.model.service";
import { proxyService } from "./../state/proxy.service";

import {
	encryptPassword,
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
  	isURL
} from "../../util";

import {
	IPerson, IUser, ISystemUser, IClient, ICustomer, IDatabasePriority, IRawThumbnail, IEncryption
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

		hostType =1;

		console.log("*** Start test for Current User: ", email, hostType)
		console.log(" Models ", this.readModels.length);
		console.log(" Subtypes: ", PERSON_SUBTYPES)

		// process thick: query all <Person> Subtype collections 
		
		return Promise.map( PERSON_SUBTYPES, ( personType:string) => {

			console.log( personType)

			return this.findUser( personType, email) 
				.then( (res:any) => { return { [personType]: res}; })
				.catch( (err:any) => '<errorNumber2>' );				
		})		
	
		// process thick: evaluate query results 
		.then( (results:any) => {	

			console.log(results);				
		
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
		// .then( (person:IUser|IClient|ICustomer) => Promise.resolve(person))		

		// error handler
		.catch( (err:any) => {		
			return Promise.reject(err);
		});		
		
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

	/***
	 * User Core && Security settings
	 */		
	protected configureDefaultUserProfile(
		u:any, 
		firstName:string,
		middleName:string,
		lastName:string,
		email:string,
		hash:string,
		method:number,
		role:number
	) {

		console.log(hash)
		console.log(method)

		let err:any;
		return new Promise( (resolve, reject) => {
			try {		
				
				u.core.identifier = uuidv1();    
				u.core.email = email
				u.core.role = role;

				/****
				 * Security
				 */
				u.password.value = hash;
				u.password.method = method;				
	        	u.security.accountType = role;           
	        	u.security.isAccountVerified = true; 
	        	u.security.isPasswordEncrypted = true;	        
	        	

	        	/***
	        	 * User Profile
	        	 */	
				u.profile.personalia.givenName = capitalizeString(firstName);				
				u.profile.personalia.familyName = capitalizeString(lastName);  	

	        	u.profile.displayNames.fullName = constructProfileFullName({
	        		givenName:firstName,
	        		middleName:middleName,
	        		familyName:lastName
	        	});
	        	

	        	u.profile.displayNames.sortName = constructProfileFullName({
	        		givenName:firstName,
	        		middleName:middleName,
	        		familyName:lastName
	        	});	        	

	        	/****
     			 * User credentials: userName && url 
     			 */
     			constructUserCredentials( u, (credentials:any) => {
        			u.core.userName = credentials.userName;
       				u.core.url = credentials.url;  
    			});

    			console.log(u)
			}
			catch(e) { err = e; }
			finally { if(err) {reject('<errorNumber6>');} else { resolve(u); } }		

		});		
	}	

	private _getDefaultThumbnail():IRawThumbnail {
		let rawThumbnail:IRawThumbnail = deepCloneObject(TI_RAW_THUMBNAIL);
    	return rawThumbnail;   	
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
		 * If provider profile has no imageURL we assign default user image
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
				console.log(err);
				console.log('<errorNumberX>'); 
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
			.catch( (err:any) => {
				console.log(err);
				console.error('<errorNumberX>'); 
			});				
		}	

		/***
		 * MLAB MongoDB Instance
		 */			
		if(hostType === 2) {			
			return model.remoteCreateUser( user, collection)
			.then( (res:any) => { return Promise.resolve(user); })
			.catch( (err:any) => console.error('<errorNumberXX>') );					
		}
	}	

	/***
	 * DB Role: Manage Current Operatons
	 */	


	/******
	 * Google Functions
	 */
	protected grabEmailFromGoogleProfile(profile:any):Promise<string> {        	  

	    let email:string, err:any
	    try { email = profile.emails[0].value;} 
	    catch(e) {err = e;  }
	    finally {       	       
	        if(err) {
	            return Promise.reject('errorGoogle1000');
	        } else {
	            return Promise.resolve(email);
	        }
	    }
	}

	/****
	 * Create User Profile from Google Authentication Response
	 */
	protected extractGoogleProfile(profile:any) {

		let newUser:IUser = deepCloneObject(TUSER),
			p:any = deepCloneObject(profile),
			errType:number;

	    /****
	     * Test if Profile contains essential params
	     */
	    if( !p.hasOwnProperty('id') || (p.id && typeof p.id != 'string') )

	    // invalid Google Profile
	    {
	        errType = 1031; 

	    } else {

	        // create 'personal' identifier, a UUID timestamp
	        newUser.core.identifier = uuidv1();

	        // configure security and account Type
	        newUser.security.accountType = 5;           
	        newUser.security.isAccountVerified = true; 
	        newUser.core.role = 5;

	        // update user configuration
	        newUser.configuration.isGoogleUser = true;
	        newUser.profile.social.facebook = p.url || "";

	        // set public facebook ID
	        newUser.accounts.googleID = p.id;

	        // set raw profile
	        newUser.profileRaw = p._raw;

	        /***
	         * Set user password
	         */
	         newUser.password.value = "";
	         newUser.security.isPasswordEncrypted = false; 
	    }   

		/****
		 * Test if google user is a person and not a business
		 */
		if( p._json 
			&& p._json.objectType 
			&& p._json.objectType.length 
			&& typeof p._json.objectType === 'string'
		) {
			newUser.security.accountType = 1;
		} else {
			errType = 1030; // user has to a natural person
		}		

		/****
		 * Test for rhumbnail or image
		 */
		if (p.photos && p.photos.length) {
		   newUser.profile.images.externalThumbnailUrl = p.photos[0].value;
	       newUser.configuration.hasExternalThumbnailUrl = true;
		}  	

		/****
		 * test for given and family name and email address  	
		 */
		if(p.name) {
			newUser.profile.personalia.givenName = capitalizeString(p.name.givenName) || "";
			newUser.profile.personalia.familyName = capitalizeString(p.name.familyName) || "";  			
		} else {
			errType = 1032; // user remains nameless
		}  		
		if(p.emails && p.emails.length) {
			newUser.core.email = p.emails[0].value;
		} else {
			errType = 1033; // no email account was provided
		}  	

		/****  	
		 * gender
		 */	
		if(p._json && p._json.gender && typeof p._json.gender === 'string') {
			if(p._json.gender === 'male') { newUser.profile.gender = 1; } 
			else if(p._json.gender === 'female') { newUser.profile.gender = 2; } 
			else { newUser.profile.gender = 0; }
		} else {
			newUser.profile.gender = 0;
		}

		/****
		 * Google Plus user
		 */
		if(p._json && p._json.url && p._json.url.length && typeof p._json.url === 'string') {
			newUser.profile.social.googleplus = p._json.url;
	        newUser.configuration.isGooglePlusUser = true;
		}  		

		/****
		 * Verified Google Account
		 */
		if(p._json && p._json.verified && p._json.verified.length && typeof p._json.verified === 'boolean' ) {
			newUser.security.isAccountVerified = p._json.verified;
		}

	    /****
	     * format display names 
	     */     
	    newUser.profile.displayNames.fullName = constructProfileFullName(p.name);
	    newUser.profile.displayNames.sortName = constructProfileSortName(p.name);

	      /****
	     * user credentials: userName && url 
	     */
	    constructUserCredentials( newUser, (credentials:any) => {
	        newUser.core.userName = credentials.userName;
	        newUser.core.url = credentials.url;  
	    }); 

		return new Promise( (resolve, reject) => {			
			(errType) ? reject(errType): resolve(newUser);		
		});
	}

	/*****
	 * Facebook functions
	 */
	protected grabEmailFromFacebookProfile (fProfile:any):Promise<string | number> {	
		let email:string = fProfile.emails[0].value;		
		if(email && isEmail(email) ) {
			return Promise.resolve(email)
		} else {
			return Promise.reject('<errorNumber1>');			
		}	
	}	

	protected extractFacebookProfile(profile:any) {

		// console.log(profile)

		let newUser:IUser = deepCloneObject(TUSER),
			p:any = deepCloneObject(profile),
			errType:number;

		console.log("*** url test")
		console.log(profile.profileUrl)
		console.log(isURL(profile.profileUrl))
		

		/****
		 * Test if FB Profile contains essential params
		 */
		if( !p.hasOwnProperty('id') || (p.id && typeof p.id != 'string') 
			|| (!p.profileUrl || (p.profileUrl && !isURL(p.profileUrl) ) )

		// invalid FB Profile
		) {
			errType = 1040; 

		} else {

			// create 'personal' identifier, a UUID timestamp
			newUser.core.identifier = uuidv1();

			// configure security and account Type
			newUser.security.accountType = 5;			
			newUser.security.isAccountVerified = true;
			newUser.core.role = 5;

			// update user configuration
			newUser.configuration.isFacebookUser = true;
			newUser.profile.social.facebook = p.profileUrl;

			// set public facebook ID
			newUser.accounts.facebookID = p.id;

			// set raw profile
			newUser.profileRaw = p._raw;

			/***
		  	 * Set user password
			 */
			 newUser.password.value = "";
			 newUser.security.isPasswordEncrypted = false; 
		}	

		/****
		 * Test for thumbnail or image  
		 */
			if (p.photos && p.photos.length) {
			newUser.profile.images.externalThumbnailUrl = p.photos[0].value;    	
			newUser.configuration.hasExternalThumbnailUrl = true;
			}

			/****
			 * test for given and family name 
			 */
			if(p.name) {

				// given name
				if( p.name.hasOwnProperty('givenName')) 
					newUser.profile.personalia.givenName = capitalizeString(p.name.givenName) || "";
				
				// middle name
				if( p.name.hasOwnProperty('middleName')) 
				newUser.profile.personalia.middleName = capitalizeString(p.name.middleName) || "";  		
			
			// family Name
			if( p.name.hasOwnProperty('familyName'))
					newUser.profile.personalia.familyName = capitalizeString(p.name.familyName) || "";  		

			} else {
				errType = 1042; // invalid name object
			} 

			/****
			 * Test for email address
			 */
			if(p.emails && p.emails.length) {
				newUser.core.email = p.emails[0].value;
			} else {
				errType = 1043; // no email account was provided
			}  	

			/****  	
			 * gender
			 */	
			newUser.profile.gender = 0;

		/****
		 * format display names 
		 */ 	
		newUser.profile.displayNames.fullName = constructProfileFullName(p.name);
		newUser.profile.displayNames.sortName = constructProfileSortName(p.name);
		
		/****
		 * user credentials: userName && url 
		 */
		constructUserCredentials( newUser, (credentials:any) => {
			newUser.core.userName = credentials.userName;
			newUser.core.url = credentials.url;  
		});	

		console.log("*** Profile Error ", errType)


		return new Promise( (resolve, reject) => {				
			// console.log(newUser);
			(errType) ? reject(errType): resolve(newUser);		
		});	
	}
}





