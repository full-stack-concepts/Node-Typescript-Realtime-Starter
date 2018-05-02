import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ISystemUser } from "../interfaces";
import { userPrototype } from "./user.schema";


/*****
 * Create default <client> object
 */
const systemUser = Object.assign(userPrototype);

/****
 * Extend Mongoose <System User> object: priviliges
 */
systemUser.priviliges = {

	/****
	 * Dataabse roles 
	 */
	manageOpRole: { type:Boolean, required: false, default: false},
	mongostatRole: { type:Boolean, required: false, default: false},
	dropSystemViewsAnyDatabase:  { type:Boolean, required: false, default: false},

	/****
	 * Collection management roles (CRUD)
	 * find, insert, remove, update, bypassDocumentValidation
	 */	
	systemUsers: {
	 	create: { type:Boolean, required: true},
	 	read: { type:Boolean, required: true},
	 	update: { type:Boolean, required: true},
	 	delete: { type:Boolean, required: true, default: false }
	},

	users: {
	 	create: { type:Boolean, required: true },
	 	read: { type:Boolean, required: true },
	 	update: { type:Boolean, required: true },
	 	delete: { type:Boolean, required: true }
	},

	clients: {
	 	create: { type:Boolean, required: true },
	 	read: { type:Boolean, required: true },
	 	update: { type:Boolean, required: true },
	 	delete: { type:Boolean, required: true }
	},

	customers: {
	 	create: { type:Boolean, required: true },
	 	read: { type:Boolean, required: true },
	 	update: { type:Boolean, required: true },
	 	delete: { type:Boolean, required: true }
	}
	
};

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

