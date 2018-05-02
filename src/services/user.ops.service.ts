/****
 * Core User Operations
 */
import Promise from "bluebird";
import fetch from "node-fetch";
import fileType from "file-type";
const uuidv1 = require("uuid/v1");

import {
	DB_HOSTS_PRIORITY
} from "../util/secrets";

import { dbModelService } from "./db.model.service";

import {
	encryptPassword,
	FormValidation,
	constructUserCredentials,
	constructProfileFullName,
	capitalizeString,
	deepCloneObject,
	pathToDefaultUserThumbnail,
	pathToUserThumbnail
} from "../util";

import {
	IPerson, IUser, ISystemUser, IClient, ICustomer, IDatabasePriority, IRawThumbnail
} from "../shared/interfaces"; 

import {
	TI_RAW_THUMBNAIL
} from "../shared/types";

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
	private hostType:number;

	/****
	 * All Database models
	 */
	protected models:IModelSetting[];

	/****
	 * Data Model Service
	 */
	private dbModelService:any = dbModelService;

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
	private testForDatabaseHosts():Promise<number> {

		let host:IDatabasePriority = DB_HOSTS_PRIORITY[0];
		return Promise.resolve( this.hostType = host.type );		
	}

	/****
	 * Class subscribers
	 */
	private configureMySubscribers():void {

		this.dbModelService.models$.subscribe( (models:IModelSetting[]) => this.models = models );
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
	protected encryptPassword(pw:string):Promise<string>  {
		return encryptPassword(pw)
		.then( (hash:any) => Promise.resolve(hash.toString()) )
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
		role:number
	) {

		let err:any;
		return new Promise( (resolve, reject) => {
			try {			

				u.password = hash;
				u.core.identifier = uuidv1();    
				u.core.email = email
				u.core.role = role;
				
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

	private _getModelSetting(userType:string):IModelSetting{

		const setting:IModelSetting = this.models.find( (setting:IModelSetting) => {
			return (setting.type === userType);
		});

		return setting;	
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
		const setting:IModelSetting = this._getModelSetting(userType);

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
		const setting:IModelSetting = this._getModelSetting(userType);

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
			.then( (res:any) => { return Promise.resolve(user) })
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
}



