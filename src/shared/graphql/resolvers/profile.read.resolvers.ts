import {	
	profilePersonaliaDefinition,
	profileDisplayNamesDefinition
} from "../read.definitions";

import {
	ISystemUser, IUser, IClient, ICustomer, IUserPersonalia, IUserDisplayNames
} from "../../interfaces";

import {
	ITypeDefinition
} from "../interfaces";

import { 	
	FIND_USER_SUB_DOCUMENT
} from "../../../controllers/actions";

import { UAController } from "../../../controllers";
import { proxyService } from "../../../services";

/****
 * Await User Actions Controller: uses string TOKENS to launch action
 */
var uaController:UAController;

proxyService.uaController$.subscribe( (state:boolean) => {                          
    if(proxyService._uaController) uaController = proxyService._uaController;           
});

/***
 * Presentational function
 */
const formatOutput = (personalia:IUserPersonalia):IUserPersonalia => {	
	return personalia;
}

/***
 * Default Person Match function
 * @id: Mongoose ObjectId
 */
const matchProfileSectionToSubDocumentId = async (
	profileSection:string,
	id:string,
	$filter:Object	
):Promise<ISystemUser | IUser | IClient | ICustomer> => {

	// build query
	let prop:string =  `${profileSection}._id`;
	let $query:Object = { "profile._id" : id.toString()};	
	
	// execute query
	let result  = await uaController[FIND_USER_SUB_DOCUMENT]($query, $filter); 		
	
	// return profile section
	return result.profile[profileSection];
}

export const ProfileReadResolvers =  {	

	/***
	 * Query Person collections to find Personalia Object
	 */
    getPersonalia: async (root:any, args:any):Promise<IUserPersonalia> => {   
    
    	let result = await matchProfileSectionToSubDocumentId('personalia', args.profileID.toString(), profilePersonaliaDefinition.filter );     
    	return profilePersonaliaDefinition.format(result) || {};   	
    },	

    /***
	 * Query Person collections to find Display Names Object
	 */
    getDisplayNames: async (root:any, args:any):Promise<IUserDisplayNames> => {    

    	let err:Error, user:any;
    	
    	let result = await matchProfileSectionToSubDocumentId('displayNames', args.profileID.toString(), profileDisplayNamesDefinition.filter );     
    	return profileDisplayNamesDefinition.format(result) || {};   	

    }	
}

