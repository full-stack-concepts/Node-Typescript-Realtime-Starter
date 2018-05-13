import mongoose from "mongoose";

export interface IRead<T> {

	/***
	 *
	 */    
    retrieve: (callback: (error: any, result: any) => void) => void;
    
    /***
     * Finds a single document by its _id field
     */
    findById: (id: string, callback: (error: any, result: T) => void) => void;

    /***
     * Finds one document
     */    
    findOne(cond?: Object, callback?: (err: any, res: T) => void): mongoose.Query<T>;
    
    /***
     * Finds document
     */
    find(cond: Object, fields: Object, options: Object, callback?: (err: any, res: T[]) => void): mongoose.Query<T[]>;
}