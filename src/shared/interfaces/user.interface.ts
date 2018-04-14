import { Document } from "mongoose";

import { IPerson } from "./person.interface";

export interface IUser extends IPerson {

	// unique identifier method
	user();

	userConfiguration: {	
		isThumbnailSet: boolean,	
		isGooglePlusUser?: boolean,
		isAddressSet?:boolean,
	}

}
