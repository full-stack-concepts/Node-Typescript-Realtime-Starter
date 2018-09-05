import { expect } from "chai";
import { Validator, validate } from "jsonSchema";

/***
 * Mongoose Subschemas we would like to test
 */
import {
	accountsSchema,
	configurationSchema,
	securitySchema
} from "../../../src/shared/schemas/children";

/***
 * Associated interfaces for our schemas
 */
import {
	IPersonAccounts,
	IPersonConfiguration,
	IPersonSecurity
} from "../../../src/shared/interfaces";

/***
 *
 */
const testResult = (result:any) => {
	expect(result.errors.length).to.equal(0);
	expect(result.throwError).to.be.undefined;
}

/***
 * Test for encryption methods 
 */
describe("Sub Schema", () => {

	describe("User Account IDS", () => {

		let accounts:IPersonAccounts;
		let result:any;

		it("should be a valid Mongoose Sub Schema", () => {		
			
			accounts = { googleID : '1234578910' }
			result = validate(accounts, accountsSchema);		
			testResult(result);			

			accounts = { googleID : '1234578910', facebookID: 'avuuyfveyfvye123', localID: "paulvermeer@gmail.com" }
			result = validate(accounts, accountsSchema);		
			testResult(result);
		});	
	});

	describe("Configuration", () => {

		let config:IPersonConfiguration;
		let result:any;

		it("should be a valid Mongoose Sub Schema", () => {		

			config = {
				isThumbnailSet: true,	
				isGooglePlusUser: false,
				isGoogleUser: true,
				isFacebookUser:false,
				hasExternalThumbnailUrl:true
			}

			result = validate(config, configurationSchema);		
			testResult(result);
		});
	});

	describe("Security ", () => {

		let security:IPersonSecurity;
		let result:any;

		it("should be a valid Mongoose Sub Schema", () => {		

		});

	});


});

