import express from "express";
import {Router, Request, Response, NextFunction} from "express";

import { DefaultRouter } from "./default.router";

/***
 * Import Niddleware functions
 */
import { 
	analyse,
	logout, 
	allowCredentials, 
	allowMethods, 
	allowOrigin 
} from "./middlewares";

/***
 * Import Actions
 */
import {
	REGISTER_NEW_CUSTOMER,
	LOGIN_SYSTEM_USER,
	CREATE_WEBTOKEN
} from "../controllers/actions";

import { ISystemUser, ILoginRequest } from "../shared/interfaces";
import { LOCAL_AUTH_CONFIG, STORE_WEBTOKEN_AS_COOKIE, WEBTOKEN_COOKIE, SEND_TOKEN_RESPONSE } from "../util/secrets";
import { IUserApplication } from "../shared/interfaces";

export class SystemUserRouter extends DefaultRouter { 

	// ref tot Express instance
    public express: express.Application;
    public router:Router;  

    constructor() {	    

    	super();

	    this.router = express.Router();  	   
	    this.middleware();
        this.setRoutes();    
	}	

	private staticRoutes():void {}

	private middleware():void {

		// Set Allowed Credentials for incoming http(s) requests
        this.router.use(allowCredentials); 
        this.router.use(allowMethods);

        // type req to any -> origin property unkown on Request
        this.router.use(allowOrigin);  

         /*****
		 *  Analyse client on root entry
		 */		
		this.router.use(analyse);      
	}

	private setRoutes():void {	
       
       	// enable local authentication
        if(LOCAL_AUTH_CONFIG.enable) {        	      

			// user login
			this.router.post('/login', (req:Request, res:Response, next:NextFunction) => 
				this.loginSystemUser(req, res, next)
			);

			// user logout
			this.router.post('/logout', logout );		
		}	
	}  

	 /****
	  *
	  */
	private loginSystemUser(req:Request, res:Response, next:NextFunction) {

		let loginRequest:ILoginRequest = req.body;
		this.uaController[LOGIN_SYSTEM_USER](loginRequest)			
		.then( (token:string) => {
		
			// store webtoken as cookie
        	if(STORE_WEBTOKEN_AS_COOKIE) {
        		res.cookie(WEBTOKEN_COOKIE, token);
        	}                    	

        	// store token in session to enable real-time authenticaion
        	res.locals.token = token;       

        	// send token with json response
        	res.json({token:token});

		})
		.catch( (err:Error) => console.error(err) );	
	}
	
}

// Create Public Router and Export it 
const systemUserRouter = new SystemUserRouter();
const router:Router = systemUserRouter.router;
export default router;
