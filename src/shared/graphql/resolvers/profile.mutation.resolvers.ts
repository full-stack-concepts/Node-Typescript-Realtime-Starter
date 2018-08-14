import { 	
		
} from "../../../controllers/actions";

import { UAController } from "../../../controllers";
import { proxyService } from "../../../services";
import { IUserPersonalia } from "../../interfaces";
import { addressModel} from "../../models";


/****
 * Await User Actions Controller: uses string TOKENS to launch action
 */
var uaController:UAController;

proxyService.uaController$.subscribe( (state:boolean) => {                          
    if(proxyService._uaController) uaController = proxyService._uaController;           
});


/****
 * 
 */
export const changePersonalia = async (root:any, args:any, context:any) => {
	
	let err;	

	return {};
}

/***
 *
 */
export const ProfileMutationResolvers =  {	
	changePersonalia
}
