import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Schema Company
 */
const core = {
	userName: { type: String, required: true, index: { unique:true} },
	url: { type: String, required: true, index: { unique:true} },
	email: { type: String, required: true, index: { unique:true} },
	role: { type: Number, required: true},
	identifier: { type: String, required: true },
	archived: { type: Boolean, required:true, default: false}
};

/*****
 * Create user Schema
 */
const schema:Schema = new Schema( core );

export const coreSchema:Schema = schema;