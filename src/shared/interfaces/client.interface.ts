import { Document } from "mongoose";

import { IPerson } from "./person.interface";

export interface IClient extends IPerson {

	// unique identifier method
	client():Function,

	clientConfiguration: {	
		isThumbnailSet?: boolean,	
		isGooglePlusUser?: boolean,
		isAddressSet?:boolean,
	},

	company: {

		// company name
		name?: string,
		// organizational type
		type?: string,
		// company slogan	
		slogan?:string,
		// sub slogam
		subSlogan?:string,
		// job title
		jobTitle?:string,
		// job yype
		jobType?:string,

		address: {
			street?:string,
			houseNumber?:string,
			suffix?:string,
			addition?:string,
			areacode?:string,
			city?:string,
			county?:string,
			countyCode?:string,
			country?:string,
			countryCode?:string,
			addressLine1?:string,
			addressLine2?:string,
			addressLine3?:string
		},

		communication: {
			companyPhone?: string,
			companyEmail?: string,
			companyWebsite?: string
		},

		social: {
			facebook?:string,
			twitter?:string
		}
	}

}

