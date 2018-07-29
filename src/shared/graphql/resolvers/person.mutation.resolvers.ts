import { REGISTER_NEW_USER, REGISTER_NEW_CLIENT, REGISTER_NEW_CUSTOMER } from "../../../controllers/actions";
import { UAController } from "../../../controllers";
import { proxyService } from "../../../services";
import { IUserApplication } from "../../interfaces";
import { STORE_WEBTOKEN_AS_COOKIE, WEBTOKEN_COOKIE, SEND_TOKEN_RESPONSE } from "../../../util/secrets";


var uaController:UAController;

/****
 * Await User Actions Controller: uses string TOKENS to launch action
 */
proxyService.uaController$.subscribe( (state:boolean) => {                          
    if(proxyService._uaController) uaController = proxyService._uaController;           
});

const defineActionOnPersonAdd:Function = (subtype:string):string => {
	let action:string;
	switch(subtype) {
		case 'user': action = REGISTER_NEW_USER; break;
		case 'client': action = REGISTER_NEW_CLIENT; break;
		case 'customer': action = REGISTER_NEW_CUSTOMER; break;
	}
	return action;
}

/****
 *
 */
const addPerson = async (root:any, args:any, context:any, subtype:string):Promise<any> => {

	console.log(" => Incoming subtype ", subtype)

	// find action for subtype
	const ACTION:string = defineActionOnPersonAdd(subtype);

	console.log(" => Defined action ", ACTION)

	const application:IUserApplication = {
        firstName: args.firstName,
        middleName: args.middleName,
        lastName: args.lastName,
        email: args.email,
        password: args.password,
        confirmPassword: args.confirmPassword
    }

    console.log("*** Application ", args, application, ACTION)

    let err: any;
    let token:string;
    try { token = await uaController[ACTION](application); } 
    catch(e) { err = e; }
    finally {             
    	console.log("FInal: ", err);
        if(err) return { error: true, status: false, errorID: err.errorID, message: err.message };
        if(!err && token) return Object.assign({}, args, { error: false, status: true});
    }                      

}

/***
 *
 */
export const PersonMutationResolvers =  {

	addPerson: addPerson

}