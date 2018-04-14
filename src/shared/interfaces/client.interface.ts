import { Document } from "mongoose";

import { IPerson } from "./person.interface";

export interface IClient extends IPerson {

	// unique identifier method
	client():Function,

	clientConfiguration: {	
		isThumbnailSet: boolean,	
		isGooglePlusUser?: boolean,
		isAddressSet?:boolean,
	},

	company: any

}

