import { expect, assert } from 'chai';
import Validator from "validator";

const v:Validator = Validator;

import {
	ENVIRONMENT,
	EXPRESS_SERVER_MODE,
	PORT,
	SITE_NAME,
	SITE_URL,

} from "../../../src/util/secrets";

describe("Application", () => {

	it("should have an environmental variable", () => {
		expect(ENVIRONMENT).to.be.a('string');		
	});

	it("should have valid application core settings", () => {		
		expect(SITE_NAME).to.be.a('string');		
    	expect(SITE_URL).to.be.a('string');		
	});

	it("shoud have valid Express Port Number", () => {	
		const port = parseInt(PORT);
    	expect( Number.isInteger(port)).to.equal(true);    	
	});
});
