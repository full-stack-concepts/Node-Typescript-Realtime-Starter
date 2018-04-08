export interface IUpdateOptions {

    /***
     * collection
     */
    collection:string,

    /***
     * query: only update document(s) matching the specified JSON query
     */
    query?:Object,

    /***
     * all: update all documents collection or query (if specified). By default only one document is modified
     */
    all?:boolean,

    /***
     * Upsert or put: insert the document defined in the request body if none match the specified query
     */
    upsert?:boolean 
}