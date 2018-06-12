import mongoose from "mongoose";

export interface IWrite<T> {

	/***
	 *
	 */
    create: (item: T, callback: (error: any, result: any) => void) => void;

    /***
     *
     */
    update: (_id: mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) => void;   

    /***
     *
     */
    delete: (_id: string, callback: (error: any, result: any) => void) => void;

    /***
     *
     */
    findOneAndDelete: (conditions:Object,  options: Object, callback: (error: any, result: any) => void) => void;

    /***
     *
     */
    findOneAndUpdate: (conditions:Object, update:Object, options:Object, callback: (error: any, result: any) => void) => void;

}