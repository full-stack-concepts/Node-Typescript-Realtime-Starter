import mongoose from 'mongoose';

export const toObjectId = (_id: string):mongoose.Types.ObjectId => {
    return mongoose.Types.ObjectId.createFromHexString(_id);
} 

export const testForObjectId = (id:any) => {

    let testString:string = id.toString().toLowerCase();
   
    const ObjectID:any = require('mongoose').Types.ObjectId;

    if(!ObjectID.isValid(testString)) {
        return false;
    }

    let testID:mongoose.Types.ObjectId;
    let err:Error;

    try { testID = this.toObjectId(testString); }
    catch (e) { err = e;}
    finally {
        if(err) return false;
        return true;
    }      
}