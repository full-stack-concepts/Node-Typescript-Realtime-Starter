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
import { FormValidation, validateFormObject } from "../../util";

import { 
	TEST_FOR_ACCOUNT_BY_ID,
	TEST_FOR_ACCOUNT_BY_EMAIL,
} from "../../controllers/actions";

import {
	PERSON_SUBTYPES_TO_ROLE,
	GEOCODER_PROVIDER,
	GEOCODER_HTTP_ADAPTER,
	GEOCODER_API_KEY
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

		this.GEOCODER_OPTIONS = {
			provider: GEOCODER_PROVIDER,
 			httpAdapter: GEOCODER_HTTP_ADAPTER,
 			apiKey: GEOCODER_API_KEY, 
		};
	}

	private mapPersonRoleToSubType(role:number):string {
		let t:any = PERSON_SUBTYPES_TO_ROLE.find( (item:any) => item.role === role);
		return t.type;
	}

	private mapPersonTypeToAddressQuery(subtype:string, id:string):Object {
		let query:Object;
		switch(subtype) {
			case 'user': query = { userID: id}; break;
			case 'client': query = { clientID: id}; break;
			case 'customer': query = { customerID: id}; break;
		};
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

	/*********
	 * formatAddress
 	 * @address: object
 	 * returns formatted address object
 	 */
 	private formatAddress(queryResult:any) { 	

 		/***
 		 * Get confidence level of address
 		 */
 		if(!Array.isArray(queryResult) || !queryResult[0] || !queryResult[0].hasOwnProperty('formattedAddress') ) {
 			console.log("**** Invalid Address ")
 		}

 		/*
 	 	var aObj = {
 	 		formattedAddress: address.formattedAddress,
 	 		address: {
 	 			street: address.streetName,
 	 			number: address.streetNumber,
 	 			areacode: address.zipcode,
 	 			city: address.city,
 	 			county: address.administrativeLevels.level1long, 	 			
 	 			countyCode: address.administrativeLevels.level1short,
 	 			countryCode: address.countryCode
 	 		},
 	 		location: {
 	 			latitude: address.latitude,
 	 			longitude: address.longitude
 	 		},
 	 		confidence: address.extra.confidence,
 	 		googlePlaceId: address.extra.googlePlaceId
 	 	};
 	 	return aObj;
 	 	*/
 	 }

	private validateAddressWithProvider(address:any) {

		/****
		 * Build query string
		 */
		let q:string = this.buildQueryString(address);	

		console.log(q)
		console.log(GEOCODER_API_KEY)

		/****
		 * Create instance NodeGeocoder
		 */
		const geocoder = NodeGeocoder(this.GEOCODER_OPTIONS);

		/***
		 * Execute query
		 */
		geocoder.geocode(q)
		.then( (result:any) => Promise.resolve(result) )
		.catch( (err:Error) => {
			console.log(err);
			Promise.reject(err) 
		});
	}

	public async verify(address:any) {		

		let userAction:string;
		let arg:string;		

		/***
		 * Load Address Validaton Object
		 */
		this.getAddressValidationObject();			

		/***
		 * Try to find user/client/customer
		 */
		if(address.userID) {
			userAction = TEST_FOR_ACCOUNT_BY_ID;
			arg= address.userID;
		}

		if(address.email) {
			userAction = TEST_FOR_ACCOUNT_BY_EMAIL;
			arg = address.email;
		}

		/***
		 * Validate Form Object
		 */
		const errors = validateFormObject(address, this.validationAddressObject);
		if(errors.length) return Promise.reject({errorID: 11300, data:errors});

		/***
		 * Allocate:
		 * @person:IUser|IClient|ICustomer
		 * @subtype: string identifoer
		 * @query: Mongoose query object
		 * @address: IUserAddress
		 */
		if(userAction) {

			/***
			 * Verify <Person> Mongoose ID
			 */
			let testID = address.userID || address.clientID || address.customerID;
			if(testID) {
				if(!testForObjectId(testID)) {
					return Promise.reject({errorID: 11301, data: address.userID || address.clientID || address.customerID});
				}
			}

			/***
			 * Verify <Person> EMail identifier
			 */
			if(address.email) {
				if(!validator.isEmail(address.email.toString())) 
					return Promise.reject({errorID: 11302, data: address.email});
			}			
	
			/***
			 * Find Person for this query
			 */
			const person:any = await uaController[userAction](arg);
			if(!person) return Promise.reject({errorID: 11303, data: null});		

			const subtype:string = this.mapPersonRoleToSubType(person.core.role);
			if(!subtype) return Promise.reject({errorID: 11304, data: null});	

			/***
			 * Find current Address Object
			 */			
			const query:Object = this.mapPersonTypeToAddressQuery(subtype, arg);
		
			const myAddress:IUserAddress = await addressModel.find(query);
			if(!myAddress) return Promise.reject({errorID: 11305, data: query});

			console.log(myAddress);

			/***
			 * Verify Address
			 */
			const queryResult = await this.validateAddressWithProvider(address);

			
			



			
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


/*
let userAction:string,
		addressAction:string,
		arg:string;

	if(args.userID) {
		userAction = TEST_FOR_ACCOUNT_BY_ID;
		arg= args.userID;
	}
	if(args.email) {
		userAction = TEST_FOR_ACCOUNT_BY_EMAIL;
		arg = args.email;
	}

	console.log(userAction)	

	if(userAction) {
		console.log("==> get user ..... ")
		const person:any = await uaController[userAction](arg);
		console.log(person)
	}

*/