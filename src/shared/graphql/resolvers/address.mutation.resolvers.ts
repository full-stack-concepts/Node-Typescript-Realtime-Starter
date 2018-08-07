import { 	
} from "../../../controllers/actions";
import { UAController } from "../../../controllers";
import { proxyService } from "../../../services";
import { IUserAddress } from "../../interfaces";
import { } from "../../../util/secrets";


var uaController:UAController;

/****
 * Await User Actions Controller: uses string TOKENS to launch action
 */
proxyService.uaController$.subscribe( (state:boolean) => {                          
    if(proxyService._uaController) uaController = proxyService._uaController;           
});

/***
 *
 */
export const AddressMutationResolvers =  {	
}
