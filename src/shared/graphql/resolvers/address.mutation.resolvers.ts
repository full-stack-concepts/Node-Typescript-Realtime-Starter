import { 	
	VERIFY_ADDRESS 	
} from "../../../controllers/actions";

import { UAController } from "../../../controllers";
import { proxyService } from "../../../services";
import { IUserAddress } from "../../interfaces";
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
export const changeAddress = async (root:any, args:any, context:any):Promise<any> => {


	console.log("*** Request to change address ")
	console.log(root, args)
	let err;	

	try { await uaController[VERIFY_ADDRESS](args); }
	catch(e) {err = e;}
	finally {
		if(err) {			
			const {errorID, data} = err;				
			return { error: true, status: false, errorID: errorID, formData:data };
		} else {
			 return Object.assign({}, args, { error: false, status: true});
		}
	}



	
	/*
	const ACTION:string = defineActionOnPersonChangePassword(subtype);
	let request:IChangePassword = { id: args.id, oldPassword: args.oldPassword, password: args.password, confirmPassword: args.confirmPassword };

	console.log(" => Performiong Action ", ACTION)	

	let err:any;
	try { await uaController[ACTION](request); } 
    catch(e) { err = e; }
    finally {             
    	console.log("FInal: ", err);
        if(err) return { error: true, status: false, errorID: err.errorID, message: err.message };
        if(!err) return Object.assign({}, args, { error: false, status: true});
    } 
    */   
}

/***
 *
 */
export const AddressMutationResolvers =  {	
	changeAddress
}
