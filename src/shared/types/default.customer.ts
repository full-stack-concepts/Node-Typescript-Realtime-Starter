import {ICustomer} from  "../interfaces";

export const TCUSTOMER:ICustomer = <ICustomer | any>{

	customer: () => {},

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
				
		images: {	     		     		
     		thumbnail: null,
     		externalThumbnailUrl: null,
     		avatar: null
		},

		social: {
			googleplus:null
		}
	},

	customerPaymentMethods: {
		preferredMethod:null,		
		paymentMethods:null
	},



}

