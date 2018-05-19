import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IClient } from "../interfaces";

import {
	coreSchema,
	passwordSchema,
	loginsSchema,
	securitySchema,
	configurationSchema,	
	accountsSchema,
	profileSchema,
	devicesSchema,
	priviligesSchema,
	companySchema
} from "./children";

/******
 * System client Schema
 */
export const client = {
	core: coreSchema,
	password:  passwordSchema,
	logins: loginsSchema,
	security: securitySchema,
	configuration: configurationSchema,
	accounts: accountsSchema,
	profile: profileSchema,
	devices: devicesSchema,
	priviliges: priviligesSchema,
	company: companySchema
};

/*****
 * Create Client Schema
 */
const schema:Schema = new Schema( client );

schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before student document is saved
	 */

	next();
});

export const clientSchema:Schema = schema;