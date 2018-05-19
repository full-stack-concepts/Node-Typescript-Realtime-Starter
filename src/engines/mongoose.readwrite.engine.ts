/************************
 * $TODO: add storage factory before implementing REDIS
 * (1) have class listening to all db connections
 * (2) subscribe to providers
 * (3) switch between storage solutions (redis versus mongodb)
 * (4) switch between localhost/mlab etc
 */

import mongoose from 'mongoose';
import { Schema } from "mongoose";

/****
 * Person SubType Mongoose Schemas
 */
import { systemUserSchema } from "../shared/schemas/systemuser.schema";
import { userSchema } from "../shared/schemas/user.schema";
import { clientSchema} from "../shared/schemas/client.schema";
import { customerSchema } from "../shared/schemas/customer.schema";

import { IMongooseModels, IRead, IWrite, IBulk } from "./mongoose";

export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export 	class ReadWriteRepositoryBase<T extends mongoose.Document>  
		implements 
			IMongooseModels<T>, 
			IRead<T>,  
			IWrite<T>,  
			IBulk<T> {
   
    private _model: mongoose.Model<mongoose.Document>;   

    constructor(     

        // Schema Identifier    
        schemaIdentifier:string,
         
        // Native Model Connection    
        conn:mongoose.Model<mongoose.Document>
    ) {                    

        switch(schemaIdentifier) {
            case 'SystemUser':  
                this.createSystemUserModel(conn); 
            break;
            case 'User': 
                this.createUserModel(conn); 
            break;            
            case 'Client':             
                this.createClientModel(conn);        
            break;
            case 'Customer':
                this.createCustomerModel(conn);               
            break;
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

    private toObjectId(_id: string): mongoose.Types.ObjectId {
        return mongoose.Types.ObjectId.createFromHexString(_id);
    } 

    /***
     * Mongoose operations
     */
     create(item: T, callback: (error: any, result: T) => void) {     	
        this._model.create(item, callback);
    }

    retrieve(callback: (error: any, result: T) => void) {
        this._model.find({}, callback);
    }

    update(_id: mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) {
        this._model.update({ _id: _id }, item, callback);
    }  

    delete(_id: string, callback: (error: any, result: any) => void) {
        this._model.remove({ _id: this.toObjectId(_id) }, (err:any) => callback(err, null));
    }

    findById(_id: string, callback: (error: any, result: T) => void) {
        this._model.findById(_id, callback);
    }

    findOne(cond?: Object, callback?: (err: any, res: T) => void): any {
        return this._model.findOne(cond, callback);
    }

    find(cond?: Object, fields?: Object, options?: Object, callback?: (err: any, res: T[]) => void): any {
        return this._model.find(cond, options, callback);
    }   

    insertMany( items: T[], callback: (error: any, result: T) => void ) {
        return this._model.insertMany( items, { ordered:true}, callback)
    }

    remove(cond:Object, callback: ( error:any) => any ) {
        return this._model.remove( cond, callback);
    }   
}

