import { IClient } from  "../interfaces";
import { TCOMPANY } from "./default.company";

export const TCLIENT:IClient = <IClient | any> {
	
	client: () => {},

	core: {
		userName: null,
		url: null,
		email: null,
		role: null,
		identifier: null,
		archive: false,
		type: null				
	},

	password: {
		value: null, 
		method: null
	},

	accounts: {
		googleID: null,
		facebookID: null,
		localID: null
	},

	security: {	
		accountType: null,
		isAccountVerified: null,	
		isPasswordEncrypted: null
	},

	configuration: {	
		isThumbnailSet: false,		
		isAddressSet: false,
		isGooglePlusUser: false,
		isGoogleUser: false,
		isFacebookUser: false,
	},

	profile: {	

		personalia: {
			givenName: null,
			middleName: null,
			familyName:  null
		},	

		displayNames: {
			fullName: null,
			sortName: null
		},

		address: {
			street:null,
			houseNumber:null,
			suffix:null,
			addition:null,
			areacode:null,
			city:null,
			county:null,
			country:null,
			countryCode:null
		},

		location: {
			latitude:null,
			longitude: null
		},

		images: {	     		     		
     		thumbnail: null,
     		externalThumbnailUrl: null,
     		avatar: null
		},

		social: {
			googleplus:null
		}
	},

	company: TCOMPANY



}

