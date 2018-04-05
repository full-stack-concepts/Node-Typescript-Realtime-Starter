import { Document } from "mongoose";

export interface IUser extends Document  {

	/*
	increment:any;
	model:any,
	remove:Any,
	*/

	core: {
		userName: string,
		url: string,
		email: string,
		role: number,
		identifier: number,
		archive: boolean
	},

	security: {
		latestLogOn?: Date,
		latestModification?: Date,
		accountType: number,
		isAccountVerified: boolean
	},

	accounts?: {
		googleID: string,
		facebookID?: string
	},

	userConfiguration: {	
		isThumbnailSet: boolean,	
		isGooglePlusUser?: boolean
	},

	profile: {

		description?: string
		dateOfBirth?: Date,
		gender?: number,

		personalia: {
			firstName: string,
			insertion: string,
			lastName:  string
		},

		displayNames?: {
			fullName?: string,
			sortName?: string
		},

		images: {	     		     		
     		thumbnail: string		
		},

		social?: {
			googleplus?: string,
			facebook?:string,
			linkedin?:string,
			twitter?:string,
			instagram?:string,
			stackoverflow?:string,
		},
	}
}
