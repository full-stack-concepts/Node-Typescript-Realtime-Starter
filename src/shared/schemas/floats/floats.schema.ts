import mongoose from "mongoose";

/***
 * Currencies
 */
export const EURO_SCHEMA = require("mongoose-float").loadType(mongoose, 2);
export const DOLLAR_SCHEMA = require("mongoose-float").loadType(mongoose, 2);

