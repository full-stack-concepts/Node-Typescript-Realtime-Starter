import {
	REDIS_READ_QUERIES_EXPIRATION_TIME
} from "../../../util/secrets";


/***
 * Redis hash key: `@dataabseName-collectionName`
 * @model: Mongoose Model
 */
export const constructPrimaryKey = (model:any, cName:string) => {        
    let dbName:string = model.db.name;  
    return {
        dbName,        
        hashKey: `${dbName}-${cName}`
    };
}

/***
 * Secundary Redis key
 * @query: object
 * returns either stringified Object.keys(query)[0]query[key] or 'all'
 */
export const constructSecundaryKey = (query:Object, cName:string):string => {
    
    let key:string;
    let value:string;
    let redisKey:string;
    let keys:string[] = Object.keys(query);
   
    key = keys[0];        

    if(key) {
        key = key.replace('.', '');
        value = query[key].toString();
        value = value.replace(/[^\w\s]/gi, '');
        redisKey = `${key}${value}`;
    } else {
        redisKey = `collection-${cName}`;
    }
        
    return (keys[0]) ?
        redisKey :
        'all';           
}

/***
 * returns merged string without special characters
 */
export const constructTimeslotKey = (hashKey:string, key:string ):string => {
	return `${hashKey}.${key}`.replace(/[^\w\s]/gi, '');
}

/***
 *
 */
export const constructTimestamp = ():number => {
	return Math.round((new Date()).getTime() / 1000) + parseInt(REDIS_READ_QUERIES_EXPIRATION_TIME);
}
