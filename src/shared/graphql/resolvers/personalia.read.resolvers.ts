import {	
	profilePersonaliaDefinition
} from "../read.definitions";

import {
	ISystemUser, IUser, IClient, ICustomer, IUserPersonalia
} from "../../interfaces";

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

export const PersonaliaReadResolvers =  {	

	/***
	 * Query Person collections to find Personalia Object
	 */
    getPersonalia: async (root:any, args:any) => {    

    	let err:Error;
    	let user:any;;    
    		
		let $query:Object = { "profile._id" : args.id.toString()};		
		user = await uaController[FIND_USER_SUB_DOCUMENT]($query, profilePersonaliaDefinition.filter); 		
		console.log(user.profile.personalia)
    	return (user.profile.personalia || {});

    }	
}

