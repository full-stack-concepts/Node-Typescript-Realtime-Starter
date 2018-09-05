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
	

	public model:any;

	constructor(userType:string, connection:mongoose.Model<any>) {
		super(userType, connection, false);		
	}

	public getModel() {
		this.model = this._model;
		return this.model;
	}
}

/****
 *
 */
export class ReadWriteRepository extends ReadWriteRepositoryBase<any> {

	public model:any;

	constructor(userType:string, connection:mongoose.Model<any>) {
		super(userType, connection, false);
	}

	public getModel() {
		this.model = this._model;
		return this.model;
	}
}