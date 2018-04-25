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

/***
 * Test ground for tests...
 */

/*
 const profile:any =  { 
    id: '114944884568254011931',
    displayName: 'paul vermeer',
    name: { familyName: 'vermeer', givenName: 'paul' },
     emails: [ { value: 'paulvermeer@gmail.com', type: 'account' } ],
    photos:
    [ { value: 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50' } ],
gender: 'male',
provider: 'google',
_raw: '{\n "kind": "plus#person",\n "etag": "\\"EhMivDE25UysA1ltNG8tqFM2v-A/757fkyLkY1DSVhrv_tXxhDCZDKI\\"",\n "gender": "male",\n "emails": [\n  {\n   "value": "paulvermeer@gmail.com",\n   "type": "account"\n  }\n ],\n "objectType": "person",\n "id": "114944884568254011931",\n "displayName": "paul vermeer",\n "name": {\n  "familyName": "vermeer",\n  "givenName": "paul"\n },\n "url": "https://plus.google.com/114944884568254011931",\n "image": {\n  "url": "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50",\n  "isDefault": true\n },\n "isPlusUser": true,\n "language": "en_GB",\n "circledByCount": 0,\n "verified": false\n}\n',
_json:
{ kind: 'plus#person',
etag: '"EhMivDE25UysA1ltNG8tqFM2v-A/757fkyLkY1DSVhrv_tXxhDCZDKI"',
gender: 'male',
emails: [ [Object] ],
objectType: 'person',
id: '114944884568254011931',
displayName: 'paul vermeer',
name: { familyName: 'vermeer', givenName: 'paul' },
url: 'https://plus.google.com/114944884568254011931',
    image:
    { url: 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50',
    isDefault: true },
    isPlusUser: true,
    language: 'en_GB',
    circledByCount: 0,
    verified: false } 
}
*/

/*
testGoogleserAuthentication({
    accessToken: '',
    refreshToken: '',
    profile:profile
}, (err:any, user:any) => {

    console.log("***************************************************************************")
    console.log(err, user) 

    WebToken.create( user.accounts, ( err:any, token:string) => {
        console.log(err, token)      
    });
})
*/

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




