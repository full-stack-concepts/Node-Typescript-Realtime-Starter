import mongoose from "mongoose";
import { Schema } from "mongoose";

/****
 * Child Devices Object
 */
const devices = {
	devices: { type:Array, required: false }	
};

/*****
 * Create Devices Schema
 */
const schema:Schema = new Schema( devices );

export const devicesSchema:Schema = schema;


