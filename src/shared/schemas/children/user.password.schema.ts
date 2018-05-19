import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Object Password
 */
const password = {
	value: { type: String, required: false, match: /(?=.*[a-zA-Z])(?=.*[0-9]+).*/ },
	method: { type: Number, required: false},
	secret: { type:String, required:false}
};

/*****
 * Create Schema Password
 */
const schema:Schema = new Schema( password );

export const passwordSchema:Schema = schema;