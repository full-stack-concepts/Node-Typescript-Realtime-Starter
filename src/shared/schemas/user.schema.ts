import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IUser, ILoginTracker } from "../interfaces";

import {
	coreSchema,
	passwordSchema,
	loginsSchema,
	securitySchema,
	configurationSchema,	
	accountsSchema,
	profileSchema,
	devicesSchema	
} from "./children";


import {
	PASSWORD_MIN_LENGTH,
	PASSWORD_MAX_LENGTH
} from "../../util/secrets";


/******
 * User Schema
 */
export const user = {
	core: coreSchema,
	password:  passwordSchema,
	logins: loginsSchema,
	security: securitySchema,
	configuration: configurationSchema,
	accounts: accountsSchema,
	profile: profileSchema,
	devices: devicesSchema,
	createdAt: Date,
	modifiedAt: Date
};

/*****
 * Create default user object
 */
// const user = Object.assign(userPrototype);


/*****
 * Create user Schema
 */
const schema:Schema = new Schema( user );

/***
 * Model Middleware
 */
schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before student document is saved
	 */ 
	next();
});

import moment from "moment-timezone";
import { TIME_ZONE } from "../../util/secrets";

schema.pre('update', function() {

	console.log("*** Execute Update Middleware function ")

	let ts:number = Math.round(+new Date());
	let date:Date = new Date(ts);

	this.update({},{ $set: { updatedAt: new Date() } });
});

export const userSchema:Schema = schema;







	
	