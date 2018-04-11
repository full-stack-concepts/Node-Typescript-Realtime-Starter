import { Document } from "mongoose";

import { IPerson } from "./person.interface";

export interface ICustomer extends IPerson {

	customerConfiguration: {	
		isThumbnailSet: boolean,	
		isGooglePlusUser?: boolean,
		isAddressSet?:boolean,
	}

}
