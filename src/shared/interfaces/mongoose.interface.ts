import mongoose from 'mongoose';
import Promise from "bluebird";
import { Schema } from "mongoose";
Promise.promisifyAll(mongoose);

export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export interface IRead<T> {
    retrieve: (callback: (error: any, result: any) => void) => void;
    findById: (id: string, callback: (error: any, result: T) => void) => void;
    findOne(cond?: Object, callback?: (err: any, res: T) => void): mongoose.Query<T>;
    find(cond: Object, fields: Object, options: Object, callback?: (err: any, res: T[]) => void): mongoose.Query<T[]>;
}

export interface IWrite<T> {
    create: (item: T, callback: (error: any, result: any) => void) => void;
    update: (_id: mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) => void;   
    delete: (_id: string, callback: (error: any, result: any) => void) => void;
}

export interface IManagement<T> {   
}

export interface IBulk<T> {
    insertMany: (items: T[], callback: ( error:any, result: any) => void ) => void;
    remove: (cond:Object, callback: ( error:any) => void ) => void;
}

/****
 * Seperate Repositoy Class for readOnly DB Connections and models
 */
export class MReadOnlyRespositoryBase<T extends mongoose.Document> implements IRead<T> {

    private _model: mongoose.Model<mongoose.Document>;

    constructor(schemaModel: mongoose.Model<mongoose.Document>) {
        this._model = schemaModel;
    }

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

/****
 * Repository Class for RedWrite Models
 */
export class RepositoryBase<T extends mongoose.Document> implements IRead<T>, IWrite<T>, IManagement<T>, IBulk<T>  {

    private _model: mongoose.Model<mongoose.Document>;

    constructor(schemaModel: mongoose.Model<mongoose.Document>) {
        this._model = schemaModel;
    }

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

    private toObjectId(_id: string): mongoose.Types.ObjectId {
        return mongoose.Types.ObjectId.createFromHexString(_id);
    } 

}




