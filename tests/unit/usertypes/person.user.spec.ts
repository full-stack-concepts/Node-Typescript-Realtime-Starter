import { expect } from "chai";
import { TUSER } from  "../../../src/shared/types";

/****
 * Test if default subtype has required properties
 */
describe("Person Subtype User", () => {

	/****
	 *
	 */
	it("should have these core section properties", () => {
		expect(TUSER.core).to.have.all.keys(
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
		expect(TUSER.password).to.have.deep.property("value");
		expect(TUSER.password).to.have.deep.property("method");
	});

	/****
	 *
	 */
	it("should have these properties in accounts section", () => {
		expect(TUSER.accounts).to.have.deep.property("googleID");
		expect(TUSER.accounts).to.have.deep.property("facebookID");
		expect(TUSER.accounts).to.have.deep.property("localID");
	});

	/****
	 *
	 */
	it("should have these properties in security section", () => {
		expect(TUSER.security).to.have.deep.property("accountType");
		expect(TUSER.security).to.have.deep.property("isAccountVerified");
		expect(TUSER.security).to.have.deep.property("isPasswordEncrypted");
	});

	/****
	 * 
	 */
	it("should have these properties in configuration section ", () => {
		expect(TUSER.configuration).to.have.deep.property("isThumbnailSet", false);
		expect(TUSER.configuration).to.have.deep.property("isAddressSet", false);
		expect(TUSER.configuration).to.have.deep.property("isGooglePlusUser", false);
		expect(TUSER.configuration).to.have.deep.property("isGoogleUser", false);
		expect(TUSER.configuration).to.have.deep.property("isFacebookUser", false);
	});

	/****
	 *
	 */
	it("should have these predefined and nested properties in profile section", () => {

		/***
		 * Object Root
		 */
		expect(TUSER.profile).to.have.all.keys(
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
		expect(TUSER.profile.personalia).to.have.deep.property('givenName');
		expect(TUSER.profile.personalia).to.have.deep.property('middleName');
		expect(TUSER.profile.personalia).to.have.deep.property('familyName');

		/***
		 * Display Names
		 */
		expect(TUSER.profile.displayNames).to.have.deep.property('fullName');
		expect(TUSER.profile.displayNames).to.have.deep.property('sortName');

		/***
		 * Address
		 */
		expect(TUSER.profile.address).to.have.all.keys(
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



