
export interface IBulk<T> {

	/***
	 *
	 */
    insertMany: (items: T[], callback: ( error:any, result: any) => void ) => void;

    /***
     *
     */
    remove: (cond:Object, callback: ( error:any) => void ) => void;
    
}