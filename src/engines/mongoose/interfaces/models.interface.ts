/****
 * Interface: create mongoose model for MOngoose Native Connection
 * @connection: Mongoose Native Connection
 */
import mongoose from "mongoose";

export interface IMongooseModels<T> {   

	/***\
	 * Read Write System User Model
	 */
    createSystemUserModel:  ( connection: mongoose.Model<mongoose.Document>, callback: () => void) => void;

    /***
     * Read Write User Model
     */
    createUserModel: ( connection: mongoose.Model<mongoose.Document>, callback: () => void) => void;

    /***
     * read Write Client Model
     */
    createClientModel:  ( connection: mongoose.Model<mongoose.Document>, callback: () => void) => void;

    /***
     * Read Write Cumstomer Model
     */
    createCustomerModel:  ( connection: mongoose.Model<mongoose.Document>, callback: () => void) => void;

     /***
     * Read Write Address Model
     */
    createAddressModel:  ( connection: mongoose.Model<mongoose.Document>, callback: () => void) => void;


}