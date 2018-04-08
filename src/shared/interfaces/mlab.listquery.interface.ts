export interface IListOptions {
    collection?:string,
    query?: Object,
    count?: boolean,
    fields?: Object,
    findOneOnly?: boolean,
    sort?:Object,
    skip?:number,
    limit?:number
}