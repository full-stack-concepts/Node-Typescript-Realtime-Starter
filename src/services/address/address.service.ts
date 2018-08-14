
// #TODO NEEDS MORE SCENARIO TESTS

import NodeGeocoder  from "node-geocoder";
import valdiator from "validator";
import path from "path";
import jsonFile from  "jsonfile";
const rootPath  = require("app-root-path");

import { UAController } from "../../controllers";
import { proxyService } from "../../services";
import { IUser, IClient, ICustomer, IUserAddress} from "../../shared/interfaces";
import { addressModel} from "../../shared/models";
import { testForObjectId } from "../../engines/mongoose/helpers";
import { FormValidation, validateFormObject, sanitizeFormObject } from "../../util";

import { 
	TEST_FOR_ACCOUNT_BY_ID,
	TEST_FOR_ACCOUNT_BY_EMAIL,
	UPDATE_USER
} from "../../controllers/actions";

import {
	PERSON_SUBTYPES_TO_ROLE,
	USE_GEOCODER_PROVIDER,
	GEOCODER_PROVIDER,
	GEOCODER_HTTP_ADAPTER,
	GEOCODER_API_KEY,
	GEOCODER_CONFIDENCE_LEVEL,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER
} from "../../util/secrets";

/****
 * Await User Actions Controller: uses string TOKENS to launch action
 */
var uaController:UAController;

proxyService.uaController$.subscribe( (state:boolean) => {                          
    if(proxyService._uaController) uaController = proxyService._uaController;           
});

export class AddressService {

	private person:IUser|IClient|ICustomer;

	private address:IUserAddress;

	private rootPath:string = rootPath.path.toString();

	private validationAddressObject:any;	

	private GEOCODER_OPTIONS:any;

	constructor() {

		/***
		 * Set up External Geo Provider Options
		 */
		if(USE_GEOCODER_PROVIDER) {
			this.GEOCODER_OPTIONS = {
				provider: GEOCODER_PROVIDER,
	 			httpAdapter: GEOCODER_HTTP_ADAPTER,
	 			apiKey: GEOCODER_API_KEY.toString(), 
			};
		}
	}


	private mapPersonTypeToAddressQuery(subtype:string, arg:string):Object {

		let query:Object;

		if(FormValidation.isEmail(arg)) {
			query =  { userEmail: arg};
		} else {
			switch(subtype) {
				case 'user': query = { userID: arg}; break;
				case 'client': query = { clientID: arg}; break;
				case 'customer': query = { customerID: arg}; break;
			};
		}

		return query;
	}	

	private getAddressValidationObject() {
		this.validationAddressObject = proxyService.validationObjects
			.find( (obj:any) => ( obj.type === "new-adddress-form") );	
	}	
	
 	private buildQueryString(address:any):string {

		let q:string = ``;
		if(address.street) q += `${address.street}`;
		if(address.houseNumber) q += ` ${address.houseNumber}`;
		if(address.suffix) q += ` ${address.suffix}`;
		if(address.areacode) q += ` ${address.areacode}`;
		if(address.city) q += ` ${address.city}`;
		if(address.country) q += ` ${address.country}`;

		return q;
	}	

	private async validateAddressWithProvider(address:any) {		

		/****
		 * Build query string
		 */
		let q:string = this.buildQueryString(address);	
		console.log(q);

		/****
		 * Create instance NodeGeocoder
		 */
		const geocoder = NodeGeocoder(this.GEOCODER_OPTIONS);

		/***
		 * Execute query
		 * @r:any => Provider Response type may change
		 */
		const r:any = await geocoder.geocode(q);	
		console.log(r);
	
		/***
		 * Validate Respone Object
		 */
		let valid:boolean=true;

		// test if nested confidence property exists
		if(!r.extra || (r.extra && !r.extra.hasOwnProperty("confidence"))) valid=false;	
		if(!valid) return Promise.reject({errorID: 11310});	

		// test if result contains longitude, latitude and placeID	
		if(!r.latitude || !r.longitude || !r.extra.googlePlaceId) valid=false;
		if(!valid) return Promise.reject({errorID: 11310});

		/***
		 * Evaluate confidence level
		 */
		let confidence:number = r.extra.confidence;
		if(confidence < GEOCODER_CONFIDENCE_LEVEL) 
			return Promise.reject({errorID: 11311});

		/***
		 * Return to caller
		 */
		return Promise.resolve({
			valid: true,
			confidence: r.extra.confidence,
			latitude:  Number.parseFloat(r.latitude).toFixed(8),
			longitude:Number.parseFloat(r.longitude).toFixed(8),
			placeID: r.extra.googlePlaceId
		});	
	}

	/***
	 *
	 */
	private async saveNewAddress(id:string, subtype:string, currentAddress:IUserAddress, newAddress:any) {

		
		let err:Error;

		const add = ($add:Object, $update:Object):Object => {		 
			 let primaryKey:string = Object.keys($update)[0];
			 let secundaryKey:string = Object.keys($add)[0];
			 $update[primaryKey][secundaryKey] = $add[secundaryKey];
			 return $update;
		}

		try {

			/***
			 * Default update with required fields
			 */		
			let $query:Object = {'_id': id };
			let $update:Object = {		
				$set: {
					'street': newAddress.street,
					'houseNumber': newAddress.houseNumber.toString(),					
					'areacode': newAddress.areacode,
					'city': newAddress.city
				}			
			};

			/***
			 * Extend update query if optional data was provided
			 */
			let optionFields:string[] = ["suffix", "county", "country", "countryCode"];

			optionFields.forEach( (field:string) => { 
				if(newAddress[field]) {
					add( { [field]: newAddress[field] || "" }, $update);
				} else {
					add( { [field]: "" }, $update);
				}
			});	

			/***
			 * Extend update query for <Location>			 
			 */
			let locationFields:string[] = ["latitude", "longitude", "placeID"];
			locationFields.forEach( (field:string) => { 
				let prop:string = "location."+[field];
				(newAddress[field]) ? add( { [prop]: newAddress[field] }, $update): null;				
			});	

			/*
			console.log(newAddress)
			console.log($query)
			console.log($update);	
			*/

			await addressModel.findOneAndUpdate($query, $update);
		} 

		catch(e) {err = e; }

		finally {
			if(err) { console.log(err); } 
			else {	return Promise.resolve(); }
		}
	}
	

	private getPersonID(form:any):string {
		return (form.userID || form.clientID || form.customerID);
	}

	private getPersonEmail(form:any):string {
		return (form.userEmail);
	}

	private getAddressID(form:any):string {
		return (form.addressID);
	}

	private mapPersonRoleToSubType(role:number):string {
		let t:any = PERSON_SUBTYPES_TO_ROLE.find( (item:any) => item.role === role);
		return t.type;
	}

	private mapToPersonSubtype(obj:any):string {
		let subtype:string;
		if(obj.userID)		return PERSON_SUBTYPE_USER;
		if(obj.clientID) 	return PERSON_SUBTYPE_CLIENT;
		if(obj.clientID) 	return PERSON_SUBTYPE_CUSTOMER;
	}

	private async getPerson(userAction:string, arg:string) {
		
		let result:any;
		let err:Error;

		try { result = await uaController[userAction](arg); } 
		catch(e) {err = e; }
		finally {
			return new Promise( (resolve, reject) => {
				if(err || !result) {
					reject({errorID: 11303, data: null});
				} else {
					resolve(result)
				}
			});				
		}	
	}

	private async findAddressWithPersonIdentifier(subtype:string, arg:string) {		
	
		const $query:Object = this.mapPersonTypeToAddressQuery(subtype, arg);			
		const a = await addressModel.find($query);
		return a[0];			
	}

	private async findAddressWithID(id:string) {
		const a = await addressModel.findById(id.toString());
		return a;
	}

	private async updateUserAddressAttribute(personID:string, subtype:string) {

		let $query:Object = {'_id': personID };
		let $update:Object = {	$set: { "configuration.isAddressSet" : true	} };
		await uaController[UPDATE_USER]($query, $update, subtype);
		return Promise.resolve();
	}

	public async verify(address:any) {		

		let userAction:string;
		let arg:string;	
		let err: any;

		try {	

		/***
		 * Load Address Validaton Object
		 */
		this.getAddressValidationObject();					

		/***
		 * Validate Form Object
		 */
		const errors = validateFormObject(address, this.validationAddressObject);
		if(errors.length) return Promise.reject({errorID: 11300, data:errors});

		/***
		 * Sanitize Address Object
		 */
		address = sanitizeFormObject(
			address,  
			this.validationAddressObject
		);

		/***
	 	 * Verify new address with new Provider and evaluate confidence level
	 	 */
		if(USE_GEOCODER_PROVIDER) { 

			console.log("(1) Validate with Provider")

			// #TODO: ANALYSE ADDRESS RESULT
			const {valid, confidence, latitude, longitude, placeID }:any = await this.validateAddressWithProvider(address);			

			address.longitude = longitude;
			address.latitude = latitude;
			address.placeID = placeID;
		}			

		/***
		 * Identify what kind of User Action we need to execute to find the <Person> that own this address
		 */		
		const personID:string = this.getPersonID(address);
		const personEmail:string = this.getPersonEmail(address);
		const addressID:string = this.getAddressID(address);

		/***
		 * Define Action for UA Controller
		 */
		if(personID) userAction = TEST_FOR_ACCOUNT_BY_ID;
		if(personEmail) userAction = TEST_FOR_ACCOUNT_BY_EMAIL;	

		/***
		 * Define argument for Action
		 */
		 if(personID) arg = personID;
		 if(personEmail) arg = personEmail;		

		/***
		 * Update address with Person Identifier
		 */
		if(userAction) {			

			// (1) Identify Person Mongoose ID
			const person:any = await this.getPerson(userAction, arg);			
			if(!person) return Promise.reject({errorID: 11303, data: null});	

			// (2) Identify Peson subtype 
			const personID:string = person._id.toString();	
			const subtype:string = this.mapPersonRoleToSubType(person.core.role);		
			if(!subtype || !personID) return Promise.reject({errorID: 11304, data: null});					

			// (3) Retrieve current address for this person
			const currentAddress = await this.findAddressWithPersonIdentifier(subtype, personID);			
			const addressID:string = currentAddress._id;
			if(!currentAddress) return Promise.reject({errorID: 11305});

			// (4) Save new address
			await this.saveNewAddress(addressID, subtype, currentAddress, address);

			// (5) Update user configuration object
			await this.updateUserAddressAttribute(personID, subtype);			

			return Promise.resolve();			

		/***
		 * Update address with Address Identifier
		 */
		} else  {		

			// (1) Find current address
			const currentAddress = await this.findAddressWithID(addressID);	
			if(!currentAddress) return Promise.reject({errorID: 11305});				

			// (2) Identify Peson subtype 
			const subtype:string = this.mapToPersonSubtype(currentAddress);

			// (3) Identify Person Mongoose ID
			const ownerID:string = this.getPersonID(currentAddress);	

			// (4) Test if owner for this address exists
			const person:any = await this.getPerson( TEST_FOR_ACCOUNT_BY_ID, ownerID);	
			if(!person) return Promise.reject({errorID: 11303, data: null});	

			// (5) Save new address
			await this.saveNewAddress(addressID, subtype, currentAddress, address);	

			// (6) Update user configuration object
			await this.updateUserAddressAttribute(ownerID, subtype);		

			return Promise.resolve();		
		}
	}
	
	catch(e) { err = e; }				

	finally {
		if(err) {
			console.log(err)
			if(!err.errorID) {
				return  Promise.reject({errorID: 11303, data: null});
			} else {
				return Promise.reject(err);
			}
		} 
	}
	}
}

/****
 * Public Interface for User Actions Controller
 */
class ActionService {	

	verifyAddress(address:any) {
		let instance:any = new AddressService();
		return instance.verify(address).then( () => Promise.resolve() ).catch( (err:Error) => Promise.reject(err) );
	}
	
}

export const addressService:any = new ActionService();


