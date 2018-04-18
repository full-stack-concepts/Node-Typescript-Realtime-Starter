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
	},

	password:null,

	accounts: {
		googleID: null
	},

	security: {	
		accountType: null,
		isAccountVerified: null,	
		isPasswordEncrypted: null
	},

	userConfiguration: {	
		isThumbnailSet: false,	
		isGooglePlusUser: false,
		isAddressSet: false
	},

	profile: {	

		personalia: {
			firstName: null,
			insertion: null,
			lastName:  null
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
     		avatar: null
		},

		social: {
			googleplus:null
		}
	},



}

