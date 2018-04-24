import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ICustomer } from "../interfaces";
import { userPrototype } from "../schemas";

/*****
 * Create default <customer> object
 */
const customer = Object.assign(userPrototype);

/****
 * Extend Mongoose <customer> object: payment Methods
 */
customer.customerPaymentMethods =  {

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
	paymentMethods: { type: Array, required: false }

}


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

export const customerSchema = mongoose.model<ICustomer>('Customer', schema, 'customers', true);