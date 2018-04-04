import path from 'path';
import express from 'express';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import logger from "morgan";

// import * as UserRouter from './routers/user.router';

import UserRouter from './routers/user.router';

console.log(UserRouter)

import { shouldCompress } from './util/middleware.util';

class App {

    // ref tot Express instance
    public express: express.Application;

    constructor() {   

        // create router app with express
        this.express  = express();

        this.middleware();
        this.routes();    
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

        /***
         * Sample logging engine: Morgan
         * https://www.npmjs.com/package/morgan
         */
        this.express.use(logger('dev'));
    }

    private routes():void {

        /***
         * User API
         */
        this.express.use('/api/user', UserRouter);



    }


}


export default new App().express;




/*
import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import * as path from 'path';

import {A_SECRET} from '../config/secrets';

console.log(A_SECRET);
// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== "/login" &&
        req.path !== "/signup" &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user &&
        req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

export default app;


*/