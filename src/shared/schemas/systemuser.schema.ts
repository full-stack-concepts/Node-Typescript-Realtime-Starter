import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ISystemUser } from "../interfaces";
import { userPrototype } from "./user.schema";

/****
 * Import Environmental settings for user Sub Types
 */
import {
	USE_PERSON_SUBTYPE_USER,
	USE_PERSON_SUBTYPE_CLIENT,
	USE_PERSON_SUBTYPE_CUSTOMER
} from "../../util/secrets";

/*****
 * Create default <client> object
 */
const systemUser = Object.assign(userPrototype);

/****
 * Extend Mongoose <System User> object: priviliges
 */
systemUser.priviliges = {	
}

/****
 * Collection management roles (CRUD)	 
 */	
systemUser.priviliges.systemUsers =  {
 	create: { type:Boolean, required: true},
 	read: { type:Boolean, required: true},
 	update: { type:Boolean, required: true},
 	delete: { type:Boolean, required: true, default: false }
};

if(USE_PERSON_SUBTYPE_USER) {
	systemUser.priviliges.users =  {
	 	create: { type:Boolean, required: true },
	 	read: { type:Boolean, required: true },
	 	update: { type:Boolean, required: true },
	 	delete: { type:Boolean, required: true }
	};
}

if(USE_PERSON_SUBTYPE_CLIENT) {
	systemUser.priviliges.clients =  {
	 	create: { type:Boolean, required: true },
	 	read: { type:Boolean, required: true },
	 	update: { type:Boolean, required: true },
	 	delete: { type:Boolean, required: true }
	};
}

if(USE_PERSON_SUBTYPE_CUSTOMER) {
	systemUser.priviliges.customers = {
	 	create: { type:Boolean, required: true },
	 	read: { type:Boolean, required: true },
	 	update: { type:Boolean, required: true },
	 	delete: { type:Boolean, required: true }
	};	
}

/*****
 * Create Schema
 */
const schema:Schema = new Schema( systemUser );

schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before document is saved
	 */

	next();
});

export const systemUserSchema = mongoose.model<ISystemUser>('SystemUser', schema, 'systemusers', true);

