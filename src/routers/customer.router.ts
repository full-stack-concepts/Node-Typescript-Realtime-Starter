import express from "express";
import {Router, Request, Response, NextFunction} from "express";

import { DefaultRouter } from "./default.router";
import { logout } from "./middlewares";	

/***
 * Import Niddleware functions
 */
import { 
	allowCredentials,
	allowMethods,
	allowOrigin
} from '../util/middleware.util';

/***
 * Import Actions
 */
import {
	REGISTER_NEW_CUSTOMER,
	LOGIN_CUSTOMER,
	CREATE_WEBTOKEN
} from "../controllers/actions";

import { IUser, ILoginRequest } from "../shared/interfaces";
import { LOCAL_AUTH_CONFIG, STORE_WEBTOKEN_AS_COOKIE, WEBTOKEN_COOKIE, SEND_TOKEN_RESPONSE } from "../util/secrets";
import { IUserApplication } from "../shared/interfaces";

interface ICustomerApplication {
}

export class CustomerRouter extends DefaultRouter { 

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
	}

	private setRoutes():void {

		/*****
         * Client Authentication Routes
         */ 
       
       	// enable local authentication
        if(LOCAL_AUTH_CONFIG.enable) { 

        	// new user aplpication
			this.router.post('/register', (req:Request, res:Response, next:NextFunction) => 
				this.newCustomer (req, res, next)
			);        

			// user login
			this.router.post('/login', (req:Request, res:Response, next:NextFunction) => 
				this.loginCustomer(req, res, next)
			);

			// user logout
			this.router.post('/logout', logout );		
		}	
	}  

	/***
	 *
	 */
	private newCustomer(req:Request, res:Response, next:NextFunction):void {	
		
		const application:ICustomerApplication = req.body;	

		this.uaController[REGISTER_NEW_CUSTOMER](application)			
	  	.then( (token:string) => {
		
			// store webtoken as cookie
        	(STORE_WEBTOKEN_AS_COOKIE)?	res.cookie(WEBTOKEN_COOKIE, token):null;        

        	// store token in session to enable real-time authenticaion
        	res.locals.token = token;       

        	// send token with json response
        	res.json({token:token});

		})
		.catch( (err:any) => console.error(err) );				
	}

	 /****
	  *
	  */
	private loginCustomer(req:Request, res:Response, next:NextFunction) {

		let loginRequest:ILoginRequest = req.body;
		this.uaController[LOGIN_CUSTOMER](loginRequest)			
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
		.catch( (err:any) => console.error(err) );	
	}	
}

// Create Public Router and Export it 
const customerRouter = new CustomerRouter();
const router:Router = customerRouter.router;
export default router;
