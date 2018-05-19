import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ISystemUser } from "../interfaces";

import {
	coreSchema,
	passwordSchema,
	loginsSchema,
	securitySchema,
	configurationSchema,	
	accountsSchema,
	profileSchema,
	devicesSchema,
	priviligesSchema
} from "./children";

/****
 * Import Environmental settings for user Sub Types
 */
import {
	USE_PERSON_SUBTYPE_USER,
	USE_PERSON_SUBTYPE_CLIENT,
	USE_PERSON_SUBTYPE_CUSTOMER
} from "../../util/secrets";

/******
 * System User Schema
 */
export const systemUser = {
	core: coreSchema,
	password:  passwordSchema,
	logins: loginsSchema,
	security: securitySchema,
	configuration: configurationSchema,
	accounts: accountsSchema,
	profile: profileSchema,
	devices: devicesSchema,
	priviliges: priviligesSchema
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

export const systemUserSchema:Schema = schema;