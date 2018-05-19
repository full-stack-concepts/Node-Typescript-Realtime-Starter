import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Object Accounts
 */
const accounts = {
	googleID: { type:String, required:false },
	facebookID: { type:String, required:false },
	localID: { type:String, required:false }  	
};

/*****
 * Create Schema Accounts
 */
const schema:Schema = new Schema( accounts );

export const accountsSchema:Schema = schema;