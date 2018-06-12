import { ModelPopulateOptions } from "mongoose";


export interface IBulk<T> {

	/***
	 *
	 */
    insertMany: (items: T[], callback: ( error:any, result: any) => void ) => void;

    /***
     *
     */
    remove: (cond:Object, callback: ( error:any) => void ) => void;

    /***
     *
     */
    populate: ( item:T, options:ModelPopulateOptions|ModelPopulateOptions[], callback: (error:any) => void) => void;

    /***
     *
     */
    updateMany: ( cond:Object,  update:Object, options:Object, callback: (error: any, result: any) => void) => void;
   
    
}