import mongoose from "mongoose";
mongoose.Promise = global.Promise;

/****
 *
 */
import {
	ReadRepositoryBase, 
	ReadWriteRepositoryBase
} from "../../../src/engines";

/****
 *
 */
export class ReadRepository extends ReadRepositoryBase<any> {
	
	constructor(userType:string, connection:mongoose.Model<any>, redisClient:any) {
		super(userType, connection, redisClient);
	}
}

/****
 *
 */
export class ReadWriteRepository extends ReadWriteRepositoryBase<any> {

	constructor(userType:string, connection:mongoose.Model<any>, redisClient:any) {
		super(userType, connection, redisClient);
	}
}