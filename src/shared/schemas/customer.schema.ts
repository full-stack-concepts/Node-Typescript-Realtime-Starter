import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ICustomer } from "../interfaces";

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
 * System customer Schema
 */
export const customer = {
	core: coreSchema,
	password:  passwordSchema,
	logins: loginsSchema,
	security: securitySchema,
	configuration: configurationSchema,
	accounts: accountsSchema,
	profile: profileSchema,
	devices: devicesSchema,
	priviliges: priviligesSchema,

	/*****
	 * Preferred paymet method
	 * (1) credit card
	 * (2) payment service ( PayPal, Stripe, .....)
	 * (3) other
	 */
	preferredMethod: { type: Number, required:false },

	/*****
	 * Payment Methods
	 */
	customerPaymentMethods: { type: Array, required: false }
	
};

/*****
 * Create <customer> Schema
 */
const schema:Schema = new Schema( customer );

schema.pre('save', (next) => {

	/*
	 * Add here functions you would like to be executed
	 * before student document is saved
	 */

	next();
});

export const customerSchema:Schema = schema;