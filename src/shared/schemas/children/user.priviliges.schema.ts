import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Devices Object
 */

/****
 * Collection management roles (CRUD)	 
 */	
const priviliges = {
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

	clients:  {
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
}


/*****
 * Create Priviliges Schema
 */
const schema:Schema = new Schema( priviliges );

export const priviligesSchema:Schema = schema;


