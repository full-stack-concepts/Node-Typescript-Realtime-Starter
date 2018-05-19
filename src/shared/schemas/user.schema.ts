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
	devices: devicesSchema
};

/*****
 * Create default user object
 */
// const user = Object.assign(userPrototype);


/*****
 * Create user Schema
 */
const schema:Schema = new Schema( user );

schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before student document is saved
	 */

	next();
});

export const userSchema:Schema = schema;








	
	