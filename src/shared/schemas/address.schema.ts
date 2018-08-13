import mongoose from "mongoose";
import { Schema } from "mongoose";

const ObjectID = mongoose.Schema.Types.ObjectId;

/****
 * Schema Object
 */
const addressObject = {
	userID:			{type: String, required: false},
	clientID:		{type: String, required: false},
	customerID:		{type: String, required: false},
	street: 		{type: String, required: true },
	houseNumber:	{type: String, required: true },
	suffix:			{type: String, required: false },
	areacode:		{type: String, required: true },
	city:			{type: String, required: true },
	county:			{type: String, required: false },
	country:		{type: String, required: false },
	countryCode:	{type: String, required: false },
	location:	{
		latitude: { type: Number},
		longitude: {type: Number},
		placeID: { type:String}
	}
};

/*****
 * Create Address Schema
 */
const schema:Schema = new Schema( addressObject );

export const addressSchema:Schema = schema;

