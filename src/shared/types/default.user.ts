import {IUser} from  "../interfaces";

export const TUSER:IUser = <IUser | any> {

	user: () => {},
	
	core: {
		userName: null,
		url: null,
		email: null,
		role: null,
		identifier: null,
		archive: false,
		type: null		
	},

	password:null,

	logins:[],

	accounts: {
		googleID: null
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
		isFacebbokuser: false,
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



}

