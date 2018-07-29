import path from 'path';
import express from 'express';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import logger from "morgan";
import passport from "passport";
import morgan from "morgan";
import { Router, Request, Response, NextFunction} from "express";
import graphQLHTTP from "express-graphql";
const cors = require("cors");

// import passport for authentication support
require("../shared/auth-strategies/passport");

import { graphqlSchema } from "../shared/graphql/index.ql";
import { printSchema } from 'graphql/utilities/schemaPrinter';

import {
    ENVIRONMENT,
    PUBLIC_ROOT_DIR,
    PRIVATE_DATA_DIR,
    CREATE_DATASTORE,
    TIME_ZONE
} from "../util/secrets";

/***
 * Router Controllers
 */
import SystemUserRouter from "../routers/systemuser.router";
import UserRouter from '../routers/user.router';
import ClientRouter from '../routers/client.router';
import CustomerRouter from '../routers/customer.router';
import { loggerController } from "../controllers";

/***
 * Import Niddleware functions
 */
import { shouldCompress } from "../routers/middlewares";
import { HTTPLoggerStream } from "../controllers";


const  env:string=ENVIRONMENT.toString();


class ExpressController {

    // ref tot Express instance
    public express: express.Application;
    public router:Router; 

    constructor() {   
        
        // create router app with express
        this.express  = express();
        this.router = express.Router();    
        this.initPassPort();
        this.middleware();
        this.routes();          
    }   

    private initPassPort():void {
        this.express.use(passport.initialize());
    }

    private middleware():void {       

        /***
         * secure your Express apps by setting various HTTP headers
         * info: https://www.npmjs.com/package/helmet
         */
        this.express.use(helmet() );

         /***
         * Compress server output, supported types
         * @deflate
         * @gzip (default)
         */
        this.express.use(compression({
            filter: shouldCompress
        }));

        /***
         * Cookie-parser: Parse Cookie header and populate req.cookies with an object keyed by the cookie names. 
         * https://www.npmjs.com/package/cookie-parser
         */
        this.express.use(cookieParser());

        /***
         * Body-parser: Parse incoming request bodies in a middleware before your handlers, available under the req.body property (post requesst).
         * https://www.npmjs.com/package/body-parser
         */  
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));             
    }

    private routes():void {      


        /****
         * Main graphql route needs a schema with datatypes
         */
        this.express.use('/ql',
            cors(),   
            graphQLHTTP( (request:Request, response:Response) => {
                const startTime = Date.now();
                return {
                    schema: graphqlSchema,
                    graphiql: true,
                    context: { request, response },
                    extensions({ document, variables, operationName, result }) {
                        return { runTime: Date.now() - startTime };
                    }
                };
            })
        );

        /*****
         * Graphql Schema
         */
        /*
        this.express.use('/schema',    ,
            (request:Request, response:Response, next:NextFunction) => {
                response.set('Content-Type', 'text/plain');
                response.send(printSchema(graphqlSchema));
            }
        );
        */

        /**
         * Public Directories
         */
        this.express.use(express.static ( PUBLIC_ROOT_DIR ) );   

         /**
         * Private Directories
         */    
        if(CREATE_DATASTORE) {
            this.express.use( express.static ( PRIVATE_DATA_DIR ) );              
        }      

         /***
         * System User API
         */
        this.express.use('/api/systemuser', SystemUserRouter);

        /***
         * User API
         */
        this.express.use('/api/user', UserRouter);

        /***
         * Client API
         */
        this.express.use('/api/client', ClientRouter);


        /***
         * Customer API
         */
        this.express.use('/api/customer', CustomerRouter);





    }
}

export default new ExpressController().express;




