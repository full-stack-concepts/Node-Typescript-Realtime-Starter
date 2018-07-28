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
    findOne(query: Object, callback?: (err: any, res: T) => mongoose.Document): mongoose.Query<T>;
    
    /***
     * Finds document
     */
    find( query: Object, fields?: Object, options?: Object, callback?: (err: any, res: T[]) => void): mongoose.Query<T[]>;

    count( query: Object, options?: Object, callback?: (err: any, res: T[]) => void): mongoose.Query<T[]>;
}