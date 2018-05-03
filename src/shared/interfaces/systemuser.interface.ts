import { Document } from "mongoose";
import { IPerson } from "./person.interface";

export interface ISystemUser extends IPerson {

	systemUser?:Function,	

	priviliges: {

		/****
		 * Dataabse roles 
		 */
		manageOpRole?: boolean,
		mongostatRole?: boolean,
		dropSystemViewsAnyDatabase?: boolean,

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




