import express from "express";
import {Router, Request, Response, NextFunction} from "express";
import passport from "passport";

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
	CREATE_WEBTOKEN,
	REGISTER_NEW_USER,
	LOGIN_USER,	
	FIND_USER,
	DELETE_USER
} from "../controllers/actions";

import { IUser, ILoginRequest, IFindUser, IDeleteUser } from "../shared/interfaces";
import { LOCAL_AUTH_CONFIG, STORE_WEBTOKEN_AS_COOKIE, WEBTOKEN_COOKIE, SEND_TOKEN_RESPONSE } from "../util/secrets";
import { IUserApplication } from "../shared/interfaces";

class UserRouter extends DefaultRouter { 

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
				this.newUser (req, res, next)
			);        

			// user login
			this.router.post('/login', (req:Request, res:Response, next:NextFunction) => 
				this.loginUser(req, res, next)
			);

			// user logout
			this.router.post('/logout', logout );		

			// find user 
			this.router.post('/findone', (req:Request, res:Response, next:NextFunction) => 
				this.findOne(req, res, next)
			);

			// delete user
			this.router.post('/delete', (req:Request, res:Response, next:NextFunction) => 
				this.deleteSingleUser(req, res, next)
			)
		}	      
     
        /****
         * Google authorization url
         */
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
		 * Google OAuth 2 callback url. Use this url to configure your OAuth client 
		 * in the Google Developers console
		 */
		this.router.get( '/auth/google/callback', passport.authenticate('google'),   			
  			(req:Request, res:Response, next:NextFunction) => this.sendTokenResponse(req, res, next)  			
		);  

		/***
		 * Facebook authorization url
		 */
		this.router.get( '/auth/facebook',  (req:Request, res:Response, next:NextFunction) => 
        	{	
				if (req.query.return) {
					req.session.oauth2return = req.query.return;
				}
    			next();
    		},

			// Start OAuth 2 flow using Passport.js
			passport.authenticate('facebook', { scope: ['email', 'public_profile'] }) 
		);	

		/***
		 * Google OAuth 2 callback url. Use this url to configure your OAuth client 
		 * in the Google Developers console
		 */
		this.router.get( '/auth/facebook/callback', passport.authenticate('facebook'),   			
  			(req:Request, res:Response, next:NextFunction) => this.sendTokenResponse(req, res, next)  		
		);  
	}

	private newUser(req:Request, res:Response, next:NextFunction) {
	
		const application:IUserApplication = req.body;	

		console.log("Incoming request ", req.body)

		this.uaController[REGISTER_NEW_USER](application)			
	  	.then( (token:string) => {
		
			// store webtoken as cookie
        	(STORE_WEBTOKEN_AS_COOKIE)?	res.cookie(WEBTOKEN_COOKIE, token):null;        

        	// store token in session to enable real-time authenticaion
        	res.locals.token = token;       

        	// send token with json response
        	res.status(200).json({token:token});

		})
		.catch( (err:any) => console.error(err) );				
	}	

    /****
     *
     */
	private loginUser( req: Request, res: Response, next: NextFunction) {        
		let loginRequest:ILoginRequest = req.body;
		this.uaController[LOGIN_USER](loginRequest)			
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

	/****
	 *
	 */
	private findOne(req: Request, res: Response, next: NextFunction) {
		let findRequest:IFindUser = req.body;
		this.uaController[FIND_USER](findRequest)			
		.then( (user:IUser) => {

        	// send user 
        	res.status(200).json({user});
		})
		.catch( (err:any) => console.error(err) );		
	}

	/****
	 *
	 */
	private deleteSingleUser(req: Request, res: Response, next: NextFunction) {
		let deleteRequest:IDeleteUser = req.body;
		this.uaController[DELETE_USER](deleteRequest)			
		.then( (user:IUser) => res.status(200).json({isUserDeleted:true}) )
		.catch( (err:any) => console.error(err) );		

	}
}

// Create Public Router and Export it 
const userRouter = new UserRouter();
const router:Router = userRouter.router;
export default router;
