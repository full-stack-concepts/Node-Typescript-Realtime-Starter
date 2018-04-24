import { Document } from "mongoose";
import { IPerson } from "./person.interface";

export interface IUser extends IPerson {

	// unique identifier method
	user:Function,
	
}




