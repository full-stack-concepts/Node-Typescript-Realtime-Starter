import { IUserCompany } from "../interfaces";

export const TCOMPANY:IUserCompany = {

	// company name
	name: null,
	
	// organizational type
	type: null,
	
	// company slogan	
	slogan: null,
	
	// sub slogam
	subSlogan: null,
	
	// job title
	jobTitle: null,
	
	// job type
	jobType: null,

	address: {
		street: null,
		houseNumber: null,
		suffix: null,
		addition: null,
		areacode: null,
		city: null,
		county: null,	
		country: null,
		countryCode: null,
		addressLine1: null,
		addressLine2: null,
		addressLine3: null
	},

	communication: {
		companyPhone: null,
		companyEmail: null,
		companyWebsite: null
	},

	social: {
		facebook: null,
		twitter: null
	}
}