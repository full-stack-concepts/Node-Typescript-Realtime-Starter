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
        this.api_routes();    
	}

	private middleware():void {

		// Set Allowed Credentials for incoming http(s) requests
        this.router.use(allowCredentials); 
        this.router.use(allowMethods);

        // type req to any -> origin property unkown on Request
        this.router.use(allowOrigin);       

	}

	private api_routes():void {

	}


}

// Create Public Router and Export it 
const userRouter = new UserRouter();
const router = userRouter.router;

console.log("==> export user router ", userRouter)
export default router;
