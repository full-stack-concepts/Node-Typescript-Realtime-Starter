import { Document } from "mongoose";

import { IPerson } from "./person.interface";

export interface IUser extends IPerson {

	userConfiguration: {	
		isThumbnailSet: boolean,	
		isGooglePlusUser?: boolean,
		isAddressSet?:boolean,
	}

}
