import { expect } from "chai";
import { TCLIENT } from  "../../../src/shared/types";

/****
 * Test if default subtype has required properties
 */
describe("Person Subtype Client", () => {

	/****
	 *
	 */
	it("should have these core section properties", () => {
		expect(TCLIENT.core).to.have.all.keys(
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
		expect(TCLIENT.password).to.have.deep.property("value");
		expect(TCLIENT.password).to.have.deep.property("method");
	});

	/****
	 *
	 */
	it("should have these properties in accounts section", () => {
		expect(TCLIENT.accounts).to.have.deep.property("googleID");
		expect(TCLIENT.accounts).to.have.deep.property("facebookID");
		expect(TCLIENT.accounts).to.have.deep.property("localID");
	});

	/****
	 *
	 */
	it("should have these properties in security section", () => {
		expect(TCLIENT.security).to.have.deep.property("accountType");
		expect(TCLIENT.security).to.have.deep.property("isAccountVerified");
		expect(TCLIENT.security).to.have.deep.property("isPasswordEncrypted");
	});

	/****
	 * 
	 */
	it("should have these properties in configuration section ", () => {
		expect(TCLIENT.configuration).to.have.deep.property("isThumbnailSet", false);
		expect(TCLIENT.configuration).to.have.deep.property("isAddressSet", false);
		expect(TCLIENT.configuration).to.have.deep.property("isGooglePlusUser", false);
		expect(TCLIENT.configuration).to.have.deep.property("isGoogleUser", false);
		expect(TCLIENT.configuration).to.have.deep.property("isFacebookUser", false);
	});

	/****
	 *
	 */
	it("should have these predefined and nested properties in profile section", () => {

		/***
		 * Object Root
		 */
		expect(TCLIENT.profile).to.have.all.keys(
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
		expect(TCLIENT.profile.personalia).to.have.deep.property('givenName');
		expect(TCLIENT.profile.personalia).to.have.deep.property('middleName');
		expect(TCLIENT.profile.personalia).to.have.deep.property('familyName');

		/***
		 * Display Names
		 */
		expect(TCLIENT.profile.displayNames).to.have.deep.property('fullName');
		expect(TCLIENT.profile.displayNames).to.have.deep.property('sortName');

		/***
		 * Address
		 */
		expect(TCLIENT.profile.address).to.have.all.keys(
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


});