
import mongoose from 'mongoose';
import { Schema } from "mongoose";

/****
 * Person SubType Mongoose Schemas
 */
import { systemUserSchema } from "../shared/schemas/systemuser.schema";
import { userSchema } from "../shared/schemas/user.schema";
import { clientSchema} from "../shared/schemas/client.schema";
import { customerSchema } from "../shared/schemas/customer.schema";

import { IMongooseModels, IRead } from "./mongoose";


export 	class ReadRepositoryBase<T extends mongoose.Document>  
		implements 
			IMongooseModels<T>, 
			IRead<T> {
   
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
    retrieve(callback: (error: any, result: T) => void) {
        this._model.find({}, callback);
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
    
}

