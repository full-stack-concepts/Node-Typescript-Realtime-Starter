import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Object Security
 */
const security = {
	latestLogOn: { type:Date, required: false },
	latestModification: { type:Date, required: false},
	accountType: { type:Number, required:true},
	isAccountVerified: { type: Boolean, required: true, default: false},
	isTemporaryPassword: { type: Boolean, required: false, default: false},
	isPasswordEncrypted: { type: Boolean, required: true, default: false},
};

/*****
 * CreateSchema Security
 */
const schema:Schema = new Schema( security );

export const securitySchema:Schema = schema;


