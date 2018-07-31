
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
    PERSON_SUBTYPE_CUSTOMER,
    EXCLUDE_FROM_CACHING_COLLECTIONS
} from "../util/secrets";

import {
    constructPrimaryKey,
    constructSecundaryKey,
    constructTimeslotKey,
    constructTimestamp,
    toObjectId, 
    testForObjectId
} from "./mongoose/helpers";

/****
 * Person SubType Mongoose Schemas
 */
import { systemUserSchema } from "../shared/schemas/systemuser.schema";
import { userSchema } from "../shared/schemas/user.schema";
import { clientSchema} from "../shared/schemas/client.schema";
import { customerSchema } from "../shared/schemas/customer.schema";

import { IMongooseModels, IRead } from "./mongoose/interfaces";

export 	class ReadRepositoryBase<T extends mongoose.Document>  
		implements 
			IMongooseModels<T>, 
			IRead<T> {
   
    public _model: any; // mongoose.Model<mongoose.Document>;    

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

        this.schemaIdentifier = schemaIdentifier.toLowerCase();   

        switch(this.schemaIdentifier) {
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
    private constructArgs(condition:any, fields:Object, options:Object) {

        let isReadByIdFunction:boolean;
        let searchID:mongoose.Types.ObjectId;

        if( testForObjectId(condition) ) 
            isReadByIdFunction=true;

        let args:any = [];
        if(isReadByIdFunction) {
            searchID = toObjectId(condition);            
        } else {
            if(condition) args.push(condition);
            if(fields) args.push(fields);
            if(options) args.push(options);
        }

        return {
            isReadByIdFunction,
            args,
            searchID
        };
    }

    /***
     *
     */
    private async queryDontCache (
        condition:any, 
        fields:any, 
        options:any,
        exec?:Function, 
        callback?:any
    ) {

        let result:Document|Document[]; 
        let err:Error;

        try {

            /****
             * @isReadByIdFunction:boolean
             * Set to true if Model Mongoose Method searches by ObjectId
             * @searchID: mongoose.Types.ObjectId
             * Stores Mongoose Document ObjectID;
             * @args: []
             * Stores arguments for Mongoose exec method
             */
            const { isReadByIdFunction, 
                    args, 
                    searchID }:any = this.constructArgs(condition, fields, options);

            if(!isReadByIdFunction) {
                result = await exec.apply( this._model, args); 
            } else {
                result = await exec.call( this._model, searchID );  
            }            

            return callback.call(this, null, result);  
        }
        catch (e) { err=e;}
        finally {
            return callback.call(this, null, result);               
        }
    }

    /***
     * Try to findCachedQuery
     */
    private async getCacheValue (        
        condition:Object, 
        fields:Object, 
        options:any,   
        model:any
    ) {

        /**
         * grab dbName and collection Name from Mongoose connection
         * to construct redis hashkey
         */
        const {dbName, collectionName, hashKey}:any = constructPrimaryKey(model); 

        /***
         * Retrieve first property of <condition> object
         * @key:string|number
         */
        let key:string|number = constructSecundaryKey(condition);
        let timeslotKey:string = constructTimeslotKey(hashKey, key);         
      
        /****
         * @isReadByIdFunction:boolean
         * Set to true if Model Mongoose Method searches by ObjectId
         * @searchID: mongoose.Types.ObjectId
         * Stores Mongoose Document ObjectID;
         * @args: []
         * Stores arguments for Mongoose exec method
         */
        const { isReadByIdFunction, 
                args, 
                searchID }:any = this.constructArgs(condition, fields, options);                     
       
        let cacheValue:any = await this.client.hget(hashKey, key);
        let expireValue:any = await this.client.get(timeslotKey);  

        console.log("==> READ Engine")
        console.log("(0) Condition: ", condition)
        console.log("(1) Hash Key: ", hashKey)
        console.log("(2) Key: ", key)
        console.log("(3) TS Key: ", timeslotKey)
        console.log("(4) Expire Value ", expireValue  ) 
        console.log("(5) Cache Value, ", cacheValue)      

        return {
            isReadByIdFunction,
            hashKey,
            key,
            timeslotKey,
            args,
            searchID,
            cacheValue,
            expireValue
        }
    }

    /***
     * (1) Execute Mongoose model Function
     * (2) Store Query result in Redis Cache
     * (3) Store Twin key with expiration in Redis Cache
     * (4) Return callback to caller
     */
    private async queryThenCache(
        isReadByIdFunction:boolean,
        hashKey:string,
        key: string,
        timeslotKey:string,
        searchID: mongoose.Types.ObjectId,
        args: any,
        exec: Function,
        callback: any
    ) {

        let result:Document|Document[]; 
        let err:Error;

        try {

            // (1) Execute Mongoose model Function        
            if(!isReadByIdFunction) { 
                result = await exec.apply( this._model, args);  } 
            else {
                result = await exec.call( this._model, searchID );  
            }           

            // (2) Store result in Redis Cache
            this.client.hset( hashKey, key, JSON.stringify(result) );

            // (3) Store Twin key with expiration in Redis Cache
            let ts:number =  constructTimestamp();        
            this.client.set( timeslotKey, ts, 'EX', 40 );
        } 

        catch (e) { err = e; }

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

    /***
     * Caching Configuration
     * (1)  Only cacche if setting <USE_LOCAL_REDIS_SERVER> is set to true
     * (2)  Do not cache excluded collections defined in EXCLUDE_FROM_CACHING_COLLECTIONS
     *      Only cache subdocument queries associated with these collections
     * (3)  All datastore queries are cached by default
     */
    async cache (condition:any, fields:any, options:any, exec?:Function, callback?:any) {    
  
        /***
         * Determine if collection is protected 
         */
        let isProtectedCollection:boolean;
        let cName:string = this._model.collection.collectionName;    
        isProtectedCollection = EXCLUDE_FROM_CACHING_COLLECTIONS.includes( cName )       

        /***
         * NO CACHING        
         */  
        if(!USE_LOCAL_REDIS_SERVER || isProtectedCollection ) {
            console.log("*** Execute Database Query Only ") 
            return this.queryDontCache(condition, fields, options, exec, callback);           

        /***
         * REDIS CACHING
         */
        } else {                  

            const {

                // is findById method or regular query
                isReadByIdFunction, 
                
                // Primary <HSET> key
                hashKey,
                
                // Secundary <HSET> Key
                key,

                // Primary <SET> key for matching keyh value with expiration value
                timeslotKey,

                // Arguments array for Mongoose Query Method
                args, 

                // Mongoose Object ID
                searchID, 

                // Redis cache value for this database query
                cacheValue, 

                // Redis cache value for twin key with expiration value 
                expireValue 

            }:any = await this.getCacheValue( condition, fields, options, this._model );          
     

            /***
             * Redis Cache has stored value for this query
             */
            if(cacheValue && expireValue) {        
 
                console.log(" ==> Serving from Cache");               
                // parse cache value to json
                const doc = JSON.parse(cacheValue);        
                
                // return array of Mongoose Documents
                const result = Array.isArray(doc)
                    ? doc.map(d => new this._model(d))
                    : new this._model(doc);
                  console.log(result)
                return callback(null, result);
            }       
        
            /***
             * Execute Mongoose Query,
             * store its result and matching expiration key in Redis 
             */
            console.log(" ==> Serving from Database ")    
            return this.queryThenCache(
                isReadByIdFunction,
                hashKey,
                key,
                timeslotKey,
                searchID,
                args,
                exec,
                callback
            );             
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

    findById(_id: string, fields:Object, callback: (error: any, result: T) => void) {
        this.cache(_id, null, null, this._model.findById, callback);    
    }  

    findOne(query:Object, callback?: (err: any, res: T) => void): any {      
        this.cache(query, {}, {}, this._model.findOne, callback);       
    }   

    find(query: Object, fields:Object={}, options:Object={}, callback: (err: any, res: T[]) => void): any {
        this.cache(query, fields, options, this._model.find, callback);        
    } 

    count(query: Object, options:Object={}, callback: (err: any, res: T[]) => void): any {
        this._model.count({}, callback);       
    }     
    
}

