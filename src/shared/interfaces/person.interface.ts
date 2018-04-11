import { Document } from "mongoose";

import { 
	IUserAddress,
	IUserDevice
} from "../interfaces";

export interface IPerson extends Document  {

	core: {
		userName: string,
		url: string,
		email: string,
		role: number,
		identifier: string,
		archive: boolean
	},

	password:string,

	security: {
		latestLogOn?: Date,
		latestModification?: Date,
		accountType: number,
		isAccountVerified: boolean,
		isTemporaryPassword?:boolean,
		isPasswordEncrypted:boolean
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
			firstName: string,
			insertion: string,
			lastName:  string
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

	devices?: IUserDevice[]

}