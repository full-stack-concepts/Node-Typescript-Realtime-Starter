import {IUser} from  "../interfaces";

export const TUSER:IUser = {

	core: {
		userName: null,
		url: null,
		email: null,
		role: null,
		identifier: null,
		archive: false,
	},

	accounts: {
		googleID: null
	},

	security: {	
		accountType: null,
		isAccountVerified: null
	},

	userConfiguration: {	
		isThumbnailSet: false,	
		isGooglePlusUser: false
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

		images: {	     		     		
     		thumbnail: null		
		},

		social: {
			googleplus:null
		}
	}

}

