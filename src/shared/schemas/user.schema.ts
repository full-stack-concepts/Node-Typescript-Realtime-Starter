import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IUser} from "../interfaces";

let schema: Schema = new Schema({

	core: {
		userName: { type: String, required: true, index: { unique:true} },
		url: { type: String, required: true, index: { unique:true} },
		email: { type: String, required: true, index: { unique:true} },
		role: { type: Number, required: true},
		identifier: { type: String, required: true },
		archived: { type: Boolean, required:true, default: false}
	},

	security: {
		latestLogOn: { type:Date, required: false },
		latestModification: { type:Date, required: false},
		accountType: { type:Number, required:true},
		isAccountVerified: { type: Boolean, required: true, default: false}		
	},

	accounts: {
		googleID: { type:String, required:false, index: { unique: true} },
		facebookID: { type:String, required:false, index: { unique: true} }
	},

	userConfiguration: {	
		isGooglePlusUser: { type: Boolean, required: false, default: false},
		isThumbnailSet: { type: Boolean, required: true, default: false}					
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

		social: {
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
		}

	}
}, 

{ 
    timestamps: true,
    collection: 'users' 

});	

schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before student document is saved
	 */

	next();
});

export let userSchema = mongoose.model<IUser>('User', schema, 'users', true);







	
	