import { 
	IUserApplication, 	
	ILoginRequest, 
	ILogout, 
	IFindUser, 
	IDeleteUser 
} from "../../interfaces";


export interface IUserDefinitions {
	PASSWORD:string,
	application:IUserApplication,
	login:ILoginRequest,
	logout:ILogout,
	find:IFindUser,
	deleteObj:IDeleteUser
}
