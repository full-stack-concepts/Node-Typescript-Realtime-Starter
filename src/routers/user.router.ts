import path from "path";
import express from "express";
import {Router} from "express";
import passport from "passport";

import { 
	allowCredentials,
	allowMethods,
	allowOrigin
} from '../util/middleware.util';

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
         * Client Routes
         */       
     
        // google authorization url
        this.router.get( 
        	'/auth/google',  
        	(req, res, next) => {	
				if (req.query.return) {
    				req.session.oauth2return = req.query.return;
    			}
    			next();
    		},

    		// Start OAuth 2 flow using Passport.js
  			passport.authenticate('google', { scope: ['email', 'profile'] }),

		);

		/***
		 * OAuth 2 callback url. Use this url to configure your OAuth client 
		 * in the Google Developers console
		 */
		this.router.get( 
			'/auth/google/callback', 
			passport.authenticate('google'),   
			
  			(req, res, next) => {            
                res.json({verified:true});               
  			}
		);    
	}
}

// Create Public Router and Export it 
const userRouter = new UserRouter();
const router = userRouter.router;
export default router;
