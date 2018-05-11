import { Document } from "mongoose";

import { 
	IUserAddress,
	IUserDevice,
	ILoginTracker
} from "../interfaces";

export interface IPerson extends Document  {

	// unique identifier method
	person?:Function,
	
	core: {
		userName: string,
		url: string,
		email: string,
		role: number,
		identifier: string,
		archive: boolean,
		type?:string
	},

	password: {
		value: string,
		method: string,
		secret?: string
	}

	logins: ILoginTracker[],

	security: {
		latestLogOn?: Date,
		latestModification?: Date,
		accountType: number,
		isAccountVerified: boolean,
		isTemporaryPassword?:boolean,
		isPasswordEncrypted:boolean
	},

	configuration: {
		isThumbnailSet?: boolean,	
		isGooglePlusUser?: boolean,
		isGoogleUser?: boolean,
		isFacebookUser?:boolean,
		isAddressSet?:boolean,
		hasExternalThumbnailUrl?:boolean
	},


	accounts?: {
		googleID: string,
		facebookID?: string
	},

	profile: {

		description?: string
		dateOfBirth?: Date,
		gender?: number,

		personalia: {
			givenName: string,
			middleName: string,
			familyName:  string
		},

		address?:IUserAddress,

		location?:{
			longitude?:number,
			latitude:number
		},

		displayNames?: {
			fullName?: string,
			sortName?: string
		},

		images: {	     		     		
     		thumbnail?: string,
     		externalThumbnailUrl?: string,
     		avatar?: string	
		},

		social?: {
			googleplus?: string,
			facebook?:string,
			linkedin?:string,
			twitter?:string,
			instagram?:string,
			stackoverflow?:string,
		}	
	},

	profileRaw?:Object,

	devices?: IUserDevice[]

}