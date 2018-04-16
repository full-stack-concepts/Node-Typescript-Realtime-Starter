import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IUser} from "../interfaces";

/******
 * Default User Object, used to prototype
 * @user schema
 * @client schema
 * @customer schema
 */
export const userPrototype = {

	core: {
		userName: { type: String, required: true, index: { unique:true} },
		url: { type: String, required: true, index: { unique:true} },
		email: { type: String, required: true, index: { unique:true} },
		role: { type: Number, required: true},
		identifier: { type: String, required: true },
		archived: { type: Boolean, required:true, default: false}
	},

	password:  { type: String, required: true },

	security: {
		latestLogOn: { type:Date, required: false },
		latestModification: { type:Date, required: false},
		accountType: { type:Number, required:true},
		isAccountVerified: { type: Boolean, required: true, default: false},
		isTemporaryPassword: { type: Boolean, required: false, default: false},
		isPasswordEncrypted: { type: Boolean, required: true, default: false},
	},

	accounts: {
		googleID: { type:String, required:false, index: { unique: true} },
		facebookID: { type:String, required:false, index: { unique: true} }
	},	

	profile: {

		dateOfBirth:  { type: Date, required: false },
		gender:  { type: Number, required: false },
		description: { type: String, required: false, default: "" },		

		personalia: {
			firstName:  { type: String, required: true },
			insertion: { type: String, required: false },
			lastName: { type: String, required: true }
		},

		displayNames: {
			fullName:  {type: String, required: true },
			sortName:  {type: String, required: false }
		},	

		address: {
			street: 		{type: String, required: false },
			houseNumber:	{type: String, required: false },
			suffix:			{type: String, required: false },
			addition:		{type: String, required: false },
			areacode:		{type: String, required: false },
			city:			{type: String, required: false },
			county:			{type: String, required: false },
			country:		{type: String, required: false },
			countryCode:	{type: String, required: false },
		},		

		location: {
			latitude:		{type: Number, required: false }, 
			longitude: 		{type: String, required: false }
		},

		/****
		 * Google Geo Object
		 */
		geo: { type:Object, required:false, default: {} },

		social: {
			googleplus:  {type: String, required: false },
			facebook:  {type: String, required: false },
			linkedin:  {type: String, required: false },
			twitter:  {type: String, required: false },
			instagram:  {type: String, required: false },
			stackoverflow:  {type: String, required: false },
		},

		communication: {
			email: { type: String, required: false, default: ""},
			website: { type: String, required: false, default: ""},
			mobile: { type: String, required: false, dafault:""},
			phone: { type: String, required: false, default: ""}
		},

		images: {			
		    thumbnail: { type: String, required: false},
		    avatar: { type: String, required: false},
		}

	},

	devices: { type:Array, required: false }
};

/*****
 * Create default user object
 */
const user = Object.create(userPrototype);

/****
 * Extend Mongoose <user> object: User Configuration
 */
user.userConfiguration = {	
	isGooglePlusUser: { type: Boolean, required: false, default: false},
	isThumbnailSet: { type: Boolean, required: true, default: false},
	isAddressSet: { type: Boolean, required: false, default: false }									
};

/*****
 * Create user Schema
 */
const schema:Schema = new Schema( user );

schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before student document is saved
	 */

	next();
});

export const userSchema = mongoose.model<IUser>('User', schema, 'users', true);







	
	