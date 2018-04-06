import path from "path";
import express from "express";
import {Router, Request, Response, NextFunction} from "express";
import passport from "passport";

/***
 * Import Niddleware functions
 */
import { 
	allowCredentials,
	allowMethods,
	allowOrigin
} from '../util/middleware.util';

import { WebToken } from "./../services/token.service";
import { IUser } from "../shared/interfaces";

class UserRouter { 

	// ref tot Express instance
    public express: express.Application;
    public router:Router;

	constructor() {	    
	  
	    this.router = express.Router();  

	    this.middleware();
        this.setRoutes();    
	}

	private middleware():void {

		// Set Allowed Credentials for incoming http(s) requests
        this.router.use(allowCredentials); 
        this.router.use(allowMethods);

        // type req to any -> origin property unkown on Request
        this.router.use(allowOrigin);       

	}

	private setRoutes():void {

		/*****
         * Client Authentication Routes
         */       
     
        // google authorization url
        this.router.get( '/auth/google',  (req:Request, res:Response, next:NextFunction) => 
        	{	
				if (req.query.return) {
					req.session.oauth2return = req.query.return;
				}
    			next();
    		},

			// Start OAuth 2 flow using Passport.js
			passport.authenticate('google', { scope: ['email', 'profile'] }) 
		);

		/***
		 * OAuth 2 callback url. Use this url to configure your OAuth client 
		 * in the Google Developers console
		 */
		this.router.get( 
			'/auth/google/callback', 
			passport.authenticate('google'),   
			
  			(req:Request, res:Response, next:NextFunction) => {            

  				// passport has serialized user and formatted as req.user
                // we retreieve it and encrypt account types inside web token
                let user = req.user;  

                  WebToken.create( user.accounts, ( err:any, token:string) => {

                  	console.log(err, token)
                
                     // (1) set certificate as cookie
                     // (2) make token available for real-time (sockets) validation without reading cookies                    
                    if(!result.err) {       

                    	/*                                                            
                        res.cookie( keys.cookies.certificate, result.token);                        
                        res.locals.token = result.token;                       
                        */
                    }                   

                    res.json({});                      

                });    		                           
  			}
		);    
	}
}

// Create Public Router and Export it 
const userRouter = new UserRouter();
const router = userRouter.router;
export default router;
