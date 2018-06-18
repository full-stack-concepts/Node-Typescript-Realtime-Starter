import {Router, Request, Response, NextFunction} from "express";
import { STORE_WEBTOKEN_AS_COOKIE, WEBTOKEN_COOKIE, SEND_TOKEN_RESPONSE } from "../util/secrets";
import { WebToken } from "../services";


/***
 * Import Niddleware functions
 */
import { 
	allowCredentials, 
	allowMethods, 
	allowOrigin
} from './middlewares';

/***
 * Services
 */
import { 
	proxyService 
} from "./../services";

export class DefaultRouter { 

	protected uaController:any;

	constructor() {	    

		this.configureSubsribers();	  
	     
	}

	private configureSubsribers():void {

		/****
		 * Await User Actions Controller: uses string TOKENS to launch action
		 */
        proxyService.uaController$.subscribe( (state:boolean) => {        	       	        
        	if(proxyService._uaController) this.uaController = proxyService._uaController;           
        });
    }    

	/****
	 *
	 */
	protected sendTokenResponse(req:Request, res:Response, next:NextFunction) {
	 	
	 	// passport has serialized user and formatted as req.user
        // we retreieve it and encrypt account types inside web token             

        return WebToken.createWebToken( req.user.accounts) 	
        .then( (token:string) => {

        	// store webtoken as cookie
			if(STORE_WEBTOKEN_AS_COOKIE) {
				res.cookie(WEBTOKEN_COOKIE, token);
			}                    	

        	// store token in session to enable real-time authenticaion
        	res.locals.token = token;   

        	// send token with json response
			res.status(200).json({token:token});    
        })
        .catch( (err:any) => console.error(err) );		

    }    

}