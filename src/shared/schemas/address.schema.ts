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
	street: 		{type: String, required: false },
	houseNumber:	{type: String, required: false },
	suffix:			{type: String, required: false },
	addition:		{type: String, required: false },
	areacode:		{type: String, required: false },
	city:			{type: String, required: false },
	county:			{type: String, required: false },
	country:		{type: String, required: false },
	countryCode:	{type: String, required: false },
};

/*****
 * Create Address Schema
 */
const schema:Schema = new Schema( addressObject );

export const addressSchema:Schema = schema;

