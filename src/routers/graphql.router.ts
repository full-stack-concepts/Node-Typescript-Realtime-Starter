import express from "express";
import { Router, Request, Response, NextFunction} from "express";
import passport from "passport";
import graphQLHTTP from "express-graphql";
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


class GraphQLRouter extends DefaultRouter { 

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

		
	}
}


// Create Public Router and Export it 
const graphQLRouter = new GraphQLRouter();
const router:Router = graphQLRouter.router;
export default router;