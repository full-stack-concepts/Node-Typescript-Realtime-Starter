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
	REGISTER_NEW_CLIENT,
	LOGIN_CLIENT,		
	FIND_CLIENT,
	DELETE_CLIENT,
	CREATE_WEBTOKEN
} from "../controllers/actions";

import { IClient, ILoginRequest } from "../shared/interfaces";
import { LOCAL_AUTH_CONFIG, STORE_WEBTOKEN_AS_COOKIE, WEBTOKEN_COOKIE, SEND_TOKEN_RESPONSE } from "../util/secrets";
import { IClientApplication, IFindUser, IDeleteUser } from "../shared/interfaces";

export class ClientRouter extends DefaultRouter{ 

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

        	// new user aplpication
			this.router.post('/register', (req:Request, res:Response, next:NextFunction) => 
				this.newClient (req, res, next)
			);       			      

			// user login
			this.router.post('/login', (req:Request, res:Response, next:NextFunction) => 
				this.loginClient(req, res, next)
			);

			// user logout
			this.router.post('/logout', logout );	

			// find client
			this.router.post('/findone', (req:Request, res:Response, next:NextFunction) => 
				this.findSingleClient(req, res, next)
			);	

			// delete client
			this.router.post('/delete', (req:Request, res:Response, next:NextFunction) => 
				this.deleteSingleClient(req, res, next)
			)
		}	
	}  

	private newClient(req:Request, res:Response, next:NextFunction):void {	
	
		/***
		 *
		 */
		const application:IClientApplication = req.body;	

		this.uaController[REGISTER_NEW_CLIENT](application)			
	  	.then( (token:string) => {
		
			// store webtoken as cookie
        	(STORE_WEBTOKEN_AS_COOKIE)?	res.cookie(WEBTOKEN_COOKIE, token):null;        

        	// store token in session to enable real-time authenticaion
        	res.locals.token = token;       

        	// send token with json response
        	res.status(200).json({token:token});        	

		})
		.catch( (err:Error) => console.error(err) );				
	}

	 /****
	  *
	  */
	private loginClient(req:Request, res:Response, next:NextFunction) {

		let loginRequest:ILoginRequest = req.body;
		this.uaController[LOGIN_CLIENT](loginRequest)			
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
		.catch( (err:Error) => console.error(err) );	
	}	

	/****
	 *
	 */
	private findSingleClient(req: Request, res: Response, next: NextFunction) {
		let findRequest:IFindUser = req.body;
		this.uaController[FIND_CLIENT](findRequest)			
		.then( (client:IClient) => res.status(200).json({client}) )
		.catch( (err:Error) => console.error(err) );		
	}

	/****
	 *
	 */
	private deleteSingleClient(req: Request, res: Response, next: NextFunction) {
		let deleteRequest:IDeleteUser = req.body;
		this.uaController[DELETE_CLIENT](deleteRequest)			
		.then( () => res.status(200).json({isClientDeleted:true}) )
		.catch( (err:Error) => console.error(err) );		

	}
}

// Create Public Router and Export it 
const clientRouter = new ClientRouter();
const router:Router = clientRouter.router;
export default router;
