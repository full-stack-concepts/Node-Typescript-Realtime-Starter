import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child object Logins
 */
const logins = {
	logins: { type: Array, required: false }, 
};

/*****
 * Create Schema Logins
 */
const schema:Schema = new Schema( logins );

export const loginsSchema:Schema = schema;
