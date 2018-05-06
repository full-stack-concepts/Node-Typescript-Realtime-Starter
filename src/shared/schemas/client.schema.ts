import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IClient } from "../interfaces";
import { userPrototype } from "../schemas";

/*****
 * Create default <client> object
 */
const client = Object.assign(userPrototype);

/****
 * Extend Mongoose <client> object: Company Configuration
 */
client.company = {

	name: 		{ type:String, required: false },
	type: 		{ type:String, required: false },
	slogan: 	{ type:String, required: false },
	subSlogan:	{ type:String, required: false }, 
	jobTitle:	{ type:String, required: false }, 
	jobType: 	{ type:String, required: false },

	address: {
		street:			{ type:String, required: false },
		houseNumber:	{ type:String, required: false },
		suffix:			{ type:String, required: false },
		addition:		{ type:String, required: false },
		areacode:		{ type:String, required: false }, 
		city:			{ type:String, required: false },
		county:			{ type:String, required: false },
		countyCode:		{ type:String, required: false },
		country:		{ type:String, required: false },
		countryCode:	{ type:String, required: false },
		addressLine1:	{ type:String, required: false },
		addressLine2:	{ type:String, required: false }, 
		addressLine3:	{ type:String, required: false }
	},

	communication: {

		companyPhone:	{ type:String, required: false },
		companyEmail:	{ type:String, required: false }, 
		companyWebsite:	{ type:String, required: false } 

	},

	social: {
		facebook:{ type:String, required: false }, 
		twitter:  { type:String, required: false }
	}
};

/*****
 * Create user Schema
 */
const schema:Schema = new Schema( client );

schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before student document is saved
	 */

	next();
});

export const clientSchema:Schema = schema;