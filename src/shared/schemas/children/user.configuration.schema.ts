import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Object Configuration
 */
const configuration = {
	isGoogleUser: { type: Boolean, required: false, default: false},
	isGooglePlusUser: { type: Boolean, required: false, default: false},
	isThumbnailSet: { type: Boolean, required: true, default: false},
	isAddressSet: { type: Boolean, required: false, default: false }		
};

/*****
 * Create Schema Congiguration
 */
const schema:Schema = new Schema( configuration );

export const configurationSchema:Schema = schema;
