import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Object Profile
 */
const profile = {
	dateOfBirth:  { type: Date, required: false },
	gender:  { type: Number, required: false },
	description: { type: String, required: false, default: "" },		

	personalia: {
		givenName:  { type: String, required: true },
		middleName: { type: String, required: false },
		familyName: { type: String, required: true }
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
};

/*****
 * Create Profile Schema
 */
const schema:Schema = new Schema( profile );

export const profileSchema:Schema = schema;



		