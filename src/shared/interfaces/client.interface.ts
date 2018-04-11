import { Document } from "mongoose";

import { IPerson } from "./person.interface";

export interface IClient extends IPerson {

	clientConfiguration: {	
		isThumbnailSet: boolean,	
		isGooglePlusUser?: boolean,
		isAddressSet?:boolean,
	}

}
