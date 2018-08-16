/************************
 * $TODO: add storage factory before implementing REDIS
 * (1) have class listening to all db connections
 * (2) subscribe to providers
 * (3) switch between storage solutions (redis versus mongodb)
 * (4) switch between localhost/mlab etc
 */
import mongoose from 'mongoose';
import { Document, Schema, ModelPopulateOptions } from "mongoose";

import { cache } from "./cache.engine";


import {     

    /****
     * Person Model Identifiers
     */
    PERSON_SUBTYPE_SYSTEM_USER,
    PERSON_SUBTYPE_USER,
    PERSON_SUBTYPE_CLIENT,
    PERSON_SUBTYPE_CUSTOMER,

    // Person Model related identifiers
    ADDRESS_TYPE   

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
import { 
    systemUserSchema, 
    userSchema, 
    clientSchema,
    customerSchema,
    addressSchema
} from "../shared/schemas";


import { IMongooseModels, IRead, IWrite, IBulk } from "./mongoose/interfaces";

export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export 	class ReadWriteRepositoryBase<T extends mongoose.Document>  
		implements 
			IMongooseModels<T>, 
			IRead<T>,  
			IWrite<T>,  
			IBulk<T> {
   
    public _model: any; // mongoose.Model<mongoose.Document>;   

    private client:any;

    private schemaIdentifier:string;

    constructor(     

        // Schema Identifier    
        schemaIdentifier:string,
         
        // Native Model Connection    
        connection:mongoose.Model<mongoose.Document>

    ) {          

        this.schemaIdentifier = schemaIdentifier.toLowerCase();    

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
     * Mongoose Write Operations
     */
    create(item: T, callback: (error: any, result: T) => void) {     	
        this._model.create(item, callback);
    }

    update(_id: mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) {
        this._model.update({ _id: _id }, item, callback);
    }  

    delete(_id: string, callback: (error: any, result: any) => void) {
        this._model.remove({ _id: toObjectId(_id) }, (err:Error) => callback(err, null));
    }

    findOneAndDelete(conditions:Object={}, options:Object={}, callback: (error: any, result: any) => void) {         
        this._model.findOneAndRemove( conditions, options, (err:Error, result:any) => callback(err, result));
    }

    findOneAndUpdate(conditions:Object={}, update:Object={}, options:Object={}, callback: (error: any, result: any) => void) {         
        this._model.findOneAndUpdate( conditions, update, options, (err:Error, result:any) => callback(err, result));
    }   

     /***
     * Mongoose Read Operations
     */
    findById(_id: string, fields:Object, callback: (error: any, result: T) => void) {
        cache(this._model, _id, fields, null, this._model.findById, callback);    
    }

    findOne(query:Object, callback?: (err: any, res: T) => void): any {
        cache(this._model, query, {}, {}, this._model.findOne, callback);       
    }

    find(query: Object, fields:Object={}, options:Object={}, callback: (err: any, res: T[]) => void): any {    
        cache(this._model, query, fields, options, this._model.find, callback);        
    }  
    
    retrieve( callback: (error: any, result: T) => void) {    
         cache(this._model, {}, {}, {}, this._model.find, callback);      
    } 

    count(query: Object, options:Object={}, callback: (err: any, res: T[]) => void): any {
        this._model.count({}, callback);       
    }   

    /***
     * Mongoose Bulk operations
     */
    insertMany( items: T[], callback: (error: any, result: T) => void ) {
        this._model.insertMany( items, { ordered:true}, callback)
    }

    remove(query:Object, callback: ( error:any) => any ) {
        this._model.remove( query, callback);
    }   

    populate(item:T, options:ModelPopulateOptions|ModelPopulateOptions[], callback: ( error:any) => any ) {
        this._model.populate(item, options, callback)
    }

    updateMany( query:Object={}, update:Object={}, options:Object={}, callback: (error:any, result:any) => any) {      
        this._model.updateMany(query, update, callback);
    }
  
}

