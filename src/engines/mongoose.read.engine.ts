
import mongoose from 'mongoose';
import { Schema } from "mongoose";


/****
 * Redis Settings
 */
import { 
    USE_LOCAL_REDIS_SERVER,
    REDIS_READ_QUERIES_EXPIRATION_TYPE,
    REDIS_READ_QUERIES_EXPIRATION_TIME,
    PERSON_SUBTYPE_SYSTEM_USER,
    PERSON_SUBTYPE_USER,
    PERSON_SUBTYPE_CLIENT,
    PERSON_SUBTYPE_CUSTOMER
} from "../util/secrets";

/****
 * Person SubType Mongoose Schemas
 */
import { systemUserSchema } from "../shared/schemas/systemuser.schema";
import { userSchema } from "../shared/schemas/user.schema";
import { clientSchema} from "../shared/schemas/client.schema";
import { customerSchema } from "../shared/schemas/customer.schema";

import { IMongooseModels, IRead } from "./mongoose/interfaces";
import { toObjectId, testForObjectId } from "./mongoose/helpers";


export 	class ReadRepositoryBase<T extends mongoose.Document>  
		implements 
			IMongooseModels<T>, 
			IRead<T> {
   
    private _model: any; // mongoose.Model<mongoose.Document>;    

    private client:any;

    private schemaIdentifier:string;

    constructor(     

        // Schema Identifier    
        schemaIdentifier:string,
         
        // Native Model Connection    
        conn:mongoose.Model<mongoose.Document>,

         // redisClient
        redisClient:any
    ) {       

        this.schemaIdentifier = schemaIdentifier;   

        switch(schemaIdentifier) {
            case PERSON_SUBTYPE_SYSTEM_USER:  
                this.createSystemUserModel(conn); 
            break;
            case PERSON_SUBTYPE_USER: 
                this.createUserModel(conn); 
            break;            
            case PERSON_SUBTYPE_CLIENT: 
                this.createClientModel(conn);        
            break;
            case PERSON_SUBTYPE_CUSTOMER:
                this.createCustomerModel(conn);               
            break;
        }        

        this.client = redisClient;
    }

    /***
     *
     */
    _constructRedisHashKey() {        
        let dbName:string = this._model.db.name;
        let collectionName:string = this._model.collection.collectionName;    
        return {
            dbName,
            collectionName,
            hashKey: `${dbName}-${collectionName}`
        };
    }

    /***
     *
     */
    getKey (query:any):string {
     
        let key:string;
        let keys:string[] = Object.keys(query);
            
        return (keys[0]) ?
            keys[0].toString() :
            'all';       
    }

    /***
     *
     */
    async cache (condition:any, fields:any, options:any, exec?:Function, callback?:any) {  

         /***
         * Set to true if Model Mongoose Method searches by ObjectId
         * @isReadByIdFunction:boolean
         */
        let isReadByIdFunction:boolean=false;

        /***
         * Stores Mongoose Document ObjectID;
         * @searchID: mongoose.Types.ObjectId
         */
        let searchID:mongoose.Types.ObjectId;

        /***
         * Query or Cache result
         */
        let result:Document|Document[]; 

        /***
         * Return default query if we are not caching db queries
         */
        if(!USE_LOCAL_REDIS_SERVER) {

            console.log("*** Execute Database Query Only ")

            let err:any;

            try {

                if( testForObjectId(condition) ) 
                    isReadByIdFunction=true;

                var args:any = [];
                if(isReadByIdFunction) {
                    searchID = toObjectId(condition);            
                } else {
                    if(condition) args.push(condition);
                    if(fields) args.push(fields);
                    if(options) args.push(options);
                }

                if(!isReadByIdFunction) {
                    result = await exec.apply( this._model, args); 
                } else {
                    result = await exec.call( this._model, searchID );  
                }  

                console.log(result)

                return callback.call(this, null, result);  
            }
            catch (e) { err=e;}
            finally {
                return callback.call(this, null, result);               
            }           
        
        } else {      

            /**
             * grab dbName and collection Name from Mongoose connection
             * to construct redis hashkey
             */
            const {dbName, collectionName, hashKey}:any = this._constructRedisHashKey();

            /***
             * Retrieve first property of <condition> object
             * @key:string|number
             */
            let key:string|number = this.getKey(condition);

            /**
             *  Test condition argument to identify Mongoose ID or Object with nested property
             */
            if( testForObjectId(condition) ) 
                isReadByIdFunction=true;

            /***
             * Build argyments list depending whether model method is
             * (1)
             * (2)
             */
            var args:any = [];
            if(isReadByIdFunction) {
                searchID = toObjectId(condition);            
            } else {
                if(condition) args.push(condition);
                if(fields) args.push(fields);
                if(options) args.push(options);
            }
           
           /*
            console.log("==> ReadWrite Engine")
            console.log("(0) Condition: ", condition)
            console.log("(1) Hash Key: ", hashKey)
            console.log("(2) Key: ", key)
            console.log("(3) Args ",  args)     
            console.log("(4) Callback ", callback)
           */
            let cacheValue:any = await this.client.hget(hashKey, key);


            /***
             * Redis Cache has stored value for this query
             */
            if(cacheValue) {        

                // parse cache value to json
                const doc = JSON.parse(cacheValue);        
                
                // return array of Mongoose Documents
                const result = Array.isArray(doc)
                    ? doc.map(d => new this._model(d))
                    : new this._model(doc);

                return callback(null, result);
            }       
        
            let err:any;        

            try {

                /***
                 * Execute Mongoose model Function
                 */
                if(!isReadByIdFunction) {
                    result = await exec.apply( this._model, args); 
                } else {
                   result = await exec.call( this._model, searchID );  
                }           

                /***
                 * Store result in Redis Cache
                 */
                this.client.hset( 
                    hashKey, 
                    key, 
                    JSON.stringify(result),  
                    REDIS_READ_QUERIES_EXPIRATION_TYPE,
                    REDIS_READ_QUERIES_EXPIRATION_TIME 
                );
            } 

            catch (e) {
                err = e;
            }

            finally {

                /***
                 * Bind arguments with <apply> method
                 * provides given this value and arguments as
                 * an array or array-like object()
                 */
                if(err) {
                    return callback.apply(this, [err]);

                /***
                 * Bind arguments with <call> method
                 * provides given this value and arguments individually
                 */
                } else {                
                    return callback.call(this, null, result);                
                }
            }

        }
    }

    /***
     * Model functions
     */
    createSystemUserModel( connection:any):void{
         this._model = connection.model('SystemUser', systemUserSchema, 'systemusers', true);
    }

    createUserModel(connection:any):void {
         this._model = connection.model('User', userSchema, 'users', true);
    }

    createClientModel(connection:any):void {
         this._model = connection.model('Client', clientSchema, 'clients', true);
    }

    createCustomerModel(connection:any):void {
         this._model = connection.model('Customer', customerSchema, 'customers', true);
    }      

    /***
     * Mongoose operations
     */
    retrieve(callback: (error: any, result: T) => void) {
        this._model.find({}, callback);
    }

    findById(_id: string, callback: (error: any, result: T) => void) {
        this.cache(_id, null, null, this._model.findById, callback);    
    }

    
    findOne(cond: Object, callback: (err: any, res: T) => void): any {
        return this._model.findOne(cond, callback);
    }
    

    /*
    findOne(query:Object, callback?: (err: any, res: T) => void): any {
        this.cache(query, {}, {}, this._model.findOne, callback);       
    }
    */

    find(query: Object, fields:Object={}, options:Object={}, callback: (err: any, res: T[]) => void): any {
        this.cache(query, fields, options, this._model.find, callback);        
    }  
    
}

