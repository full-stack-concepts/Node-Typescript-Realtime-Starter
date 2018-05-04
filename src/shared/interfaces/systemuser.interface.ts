import { Document } from "mongoose";
import { IPerson } from "./person.interface";

export interface ISystemUser extends IPerson {

	systemUser?:Function,	

	priviliges: {
			
		systemUsers?: {
		 	create?: boolean,
		 	read?: boolean,
		 	update?: boolean,
		 	delete?: boolean
		},

		users?: {
		 	create?: boolean,
		 	read?: boolean,
		 	update?: boolean,
		 	delete?: boolean
		},

		clients?: {
		 	create?: boolean,
		 	read?: boolean,
		 	update?: boolean,
		 	delete?: boolean
		},

		customers?: {
			create?: boolean,
		 	read?: boolean,
		 	update?: boolean,
		 	delete?: boolean
		}
	}
}




