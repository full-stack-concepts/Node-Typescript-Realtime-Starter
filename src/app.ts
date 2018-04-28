import path from 'path';
import express from 'express';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import logger from "morgan";
import passport from "passport";

// import passport for authentication support
require("./shared/auth-strategies/passport");

import {
    PUBLIC_ROOT_DIR,
    PRIVATE_DATA_DIR,
    CREATE_DATASTORE
} from "./util/secrets";

////////////////////
import { testFaceBookUserAuthentication, testGoogleserAuthentication } from "./services/user.service";
import { WebToken } from "./services/token.service";
import moment from "moment-timezone";
import {encryptPassword, comparePassword } from "./util";

let pw:string="12345678";
let hash:string="$2b$16$9n.Xbsr41tc/AiymYmzX0.HDz11MQ6lVKrap3074bz84XNIdyStT2";

encryptPassword(pw)
.then( (hash:string) => console.log(hash));

comparePassword(pw, hash)
.then( (valid:boolean) => console.log(valid));

import {
    TIME_ZONE,
    TIME_FORMAT,
    DATE_FORMAT
} from "./util/secrets";

/***
 * Test ground for tests...
 */
    let ts:number = Math.round(+new Date());
    let date:Date = new Date(ts);

   const login:any = {
        timestamp: ts,
        date: moment(date).tz( TIME_ZONE ).toString(),
        formattedDate:  moment(date).tz( TIME_ZONE ).format( DATE_FORMAT ),
        formattedTime: moment(date).tz( TIME_ZONE ).format( TIME_FORMAT ),
    } 

    console.log(login)

/***
 * Router Controllers
 */
import UserRouter from './routers/user.router';

import { shouldCompress } from './util/middleware.util'; 

import {u} from "./services/user.service";

import { publicDirectoryManager, createPrivateDataStore } from "./util";

/*
createPrivateDataStore()
.then( () => publicDirectoryManager() );

import { populateDatabase} from "./services/data.service";
populateDatabase();

*/


class App {

    // ref tot Express instance
    public express: express.Application;

    constructor() {   

        // create router app with express
        this.express  = express();
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

        /***
         * Sample logging engine: Morgan
         * https://www.npmjs.com/package/morgan
         */
        this.express.use(logger('dev'));
    }

    private routes():void {

        /**
         * Public Directories
         */
        this.express.use(express.static ( PUBLIC_ROOT_DIR ) );       

        if(CREATE_DATASTORE) {
            this.express.use( express.static ( PRIVATE_DATA_DIR ) );              
        }

        /***
         * User API
         */
        this.express.use('/api/user', UserRouter);

    }
}

export default new App().express;




