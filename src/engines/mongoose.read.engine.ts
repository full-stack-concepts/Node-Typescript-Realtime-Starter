
import mongoose from 'mongoose';
import { Schema } from "mongoose";

import { cache } from "./cache.engine";

import { RepositoryBase } from "./mongoose.base.engine";

/****
 * Redis Settings
 */
import {  
    
    PERSON_SUBTYPE_SYSTEM_USER,
    PERSON_SUBTYPE_USER,
    PERSON_SUBTYPE_CLIENT,
    PERSON_SUBTYPE_CUSTOMER,

    // Person Model related identifiers
    ADDRESS_TYPE,
 
} from "../util/secrets";


/****
 * Person SubType Mongoose Schemas
 */
import { 
    systemUserSchema, 
    userSchema, 
    clientSchema,
    customerSchema,
    addressSchema
} from "../shared/schemas";

import { IMongooseModels, IRead } from "./mongoose/interfaces";


export  class ReadRepositoryBase<T extends mongoose.Document>  
		implements 
			IMongooseModels<T>, 
			IRead<T> {
   
    public _model: any; // mongoose.Model<mongoose.Document>;    

    private client:any;

    private schemaIdentifier:string;

    private disableCaching:boolean=false;

    constructor(     

        // Schema Identifier    
        schemaIdentifier:string,
         
        // Native Model Connection    
        connection:mongoose.Model<mongoose.Document>,

        // Cache Query <optional setting for test environment
        disableCaching:boolean=false
       
    ) {            

        this.schemaIdentifier = schemaIdentifier.toLowerCase();   

        this.disableCaching = disableCaching;

        switch(this.schemaIdentifier) {
            case PERSON_SUBTYPE_SYSTEM_USER:    this.createSystemUserModel(connection);   break;
            case PERSON_SUBTYPE_USER:           this.createUserModel(connection);         break;            
            case PERSON_SUBTYPE_CLIENT:         this.createClientModel(connection);       break;
            case PERSON_SUBTYPE_CUSTOMER:       this.createCustomerModel(connection);     break;
            case ADDRESS_TYPE:                  this.createAddressModel(connection);      break;
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

    createAddressModel(connection:any):void {
         this._model = connection.model('Address', addressSchema, 'addresses', true);
    }      

    /***
     * Mongoose operations
     */
    retrieve(callback: (error: any, result: T) => void) {
        cache(this._model, {}, {}, {}, this._model.find, callback, this.disableCaching);      
    }

    findById(_id: string, fields:Object, callback: (error: any, result: T) => void) {
        cache(this._model, _id, null, null, this._model.findById, callback, this.disableCaching);    
    }  

    findOne(query:Object, callback?: (err: any, res: T) => void): any {      
        cache(this._model, query, {}, {}, this._model.findOne, callback, this.disableCaching);       
    }   

    find(query: Object, fields:Object={}, options:Object={}, callback: (err: any, res: T[]) => void): any {
        cache(this._model, query, fields, options, this._model.find, callback, this.disableCaching);        
    } 

    count(query: Object, options:Object={}, callback: (err: any, res: T[]) => void): any {      
        this._model.count({}, callback);       
    }     
    
}

