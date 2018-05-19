import { Request, Response, NextFunction } from "express";
import { WEBTOKEN_COOKIE} from "../../../util/secrets";

export function logout(req:Request, res:Response, next:NextFunction):void {    
	const logoutRequest:any = req.body;          
    res.clearCookie(WEBTOKEN_COOKIE);              
    res.json({loggedout:true});	
}
