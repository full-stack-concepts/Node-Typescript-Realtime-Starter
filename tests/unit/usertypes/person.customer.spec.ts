import { expect } from "chai";
import { TCUSTOMER } from  "../../../src/shared/types";

/****
 * Test if default subtype has required properties
 */
describe("Person Subtype Customer", () => {

	/****
	 *
	 */
	it("should have these core section properties", () => {
		expect(TCUSTOMER.core).to.have.all.keys(
			'userName', 
			'url', 
			'email', 
			'role', 
			'identifier', 
			'archive',
			'type'
		);			
	});

	/****
	 *
	 */
	it("should have these properties in password section", () => {
		expect(TCUSTOMER.password).to.have.deep.property("value");
		expect(TCUSTOMER.password).to.have.deep.property("method");
	});

	/****
	 *
	 */
	it("should have these properties in accounts section", () => {
		expect(TCUSTOMER.accounts).to.have.deep.property("googleID");
		expect(TCUSTOMER.accounts).to.have.deep.property("facebookID");
		expect(TCUSTOMER.accounts).to.have.deep.property("localID");
	});

	/****
	 *
	 */
	it("should have these properties in security section", () => {
		expect(TCUSTOMER.security).to.have.deep.property("accountType");
		expect(TCUSTOMER.security).to.have.deep.property("isAccountVerified");
		expect(TCUSTOMER.security).to.have.deep.property("isPasswordEncrypted");
	});

	/****
	 * 
	 */
	it("should have these properties in configuration section ", () => {
		expect(TCUSTOMER.configuration).to.have.deep.property("isThumbnailSet", false);
		expect(TCUSTOMER.configuration).to.have.deep.property("isAddressSet", false);
		expect(TCUSTOMER.configuration).to.have.deep.property("isGooglePlusUser", false);
		expect(TCUSTOMER.configuration).to.have.deep.property("isGoogleUser", false);
		expect(TCUSTOMER.configuration).to.have.deep.property("isFacebookUser", false);
	});

	/****
	 *
	 */
	it("should have these predefined and nested properties in profile section", () => {

		/***
		 * Object Root
		 */
		expect(TCUSTOMER.profile).to.have.all.keys(
			'personalia', 
			'displayNames', 
			'address', 
			'location', 
			'images', 
			'social'			
		);	

		/***
		 * Personalia 
		 */
		expect(TCUSTOMER.profile.personalia).to.have.deep.property('givenName');
		expect(TCUSTOMER.profile.personalia).to.have.deep.property('middleName');
		expect(TCUSTOMER.profile.personalia).to.have.deep.property('familyName');

		/***
		 * Display Names
		 */
		expect(TCUSTOMER.profile.displayNames).to.have.deep.property('fullName');
		expect(TCUSTOMER.profile.displayNames).to.have.deep.property('sortName');

		/***
		 * Address
		 */
		expect(TCUSTOMER.profile.address).to.have.all.keys(
			'street', 
			'houseNumber', 
			'suffix', 
			'addition', 
			'areacode', 
			'city',
			'county',
			'country',
			'countryCode'		
		);
	});

	/***
	 *
	 */
	it("should have these predefined and nested properties in company section", () => {

	});

});