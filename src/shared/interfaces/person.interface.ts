import { Document } from "mongoose";

import { 
	IUserAddress,
	IUserDevice,
	ILoginTracker,
	IPasswordTracker
} from "../interfaces";

export interface IPersonSecurity {
	latestLogOn?: Date,
	latestModification?: Date,
	accountType: number,
	isAccountVerified: boolean,
	isTemporaryPassword?:boolean,
	isPasswordEncrypted:boolean
}

export interface IPersonAccounts {
	googleID?: string,
	facebookID?: string,
	localID?:string
}

export interface IPersonConfiguration {
	isThumbnailSet?: boolean,	
	isGooglePlusUser?: boolean,
	isGoogleUser?: boolean,
	isFacebookUser?:boolean,
	isAddressSet?:boolean,
	hasExternalThumbnailUrl?:boolean
}

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
		method: number,
		secret?: string,
		history: IPasswordTracker[]
	}

	logins: ILoginTracker[],

	security: IPersonSecurity,

	configuration: IPersonConfiguration,

	accounts?: IPersonAccounts,

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

	devices?: IUserDevice[],

	createdAt: Date,
	modifiedAt: Date

}