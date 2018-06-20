/*
 * Import NODE Modules
 */
import * as http from 'http';
import * as https from 'https';
import * as debug from 'debug';
import dotenv from 'dotenv';
import  path from 'path';

// interfaces
import { ServerOptions, ProcessEnv } from './shared/interfaces/';

/****
 * App Services
 */
import { serviceManager} from "./services/services.manager";
import { proxyService } from "./services";

/****
 * Bootstrap Controller
 */
import { bootstrapController } from "./controllers";
import { DAController, ErrorLogger } from "./controllers";

/**
 * EXPRESS APPLICATION CODE
 */
import App from './controllers/express.controller';

import { 
    getCertificate,
    publicDirectoryManager,
    privateDirectoryManager,
    createPrivateDataStore,
} from "./util";

import { testForConfiguration } from './util/bootstrap.util';
import { 
    ENVIRONMENT,
    EXPRESS_SERVER_MODE,
    PORT,
    PATH_TO_DEV_PRIVATE_KEY,
    PATH_TO_DEV_CERTIFICATE,
    PATH_TO_PROD_PRIVATE_KEY,
    PATH_TO_PROD_CERTIFICATE
} from './util/secrets';

/***
 * Inject DB operation Service
 */
const AdminService:any = serviceManager.inject("adminDB");

/****
 * 
 */
// typescript fix for global
const myGlobal:any = global;
myGlobal.userDB
myGlobal.productDB;

/***
 * Test if Environment variables for this development mode dev|prod are loaded
 * if no configuration for this environment was found exit with error message
 */
testForConfiguration();

/** 
 * SERVER containers
 */
let 
    httpServer:any,
	cluster:any,
    env:string=ENVIRONMENT.toString(),
	options:ServerOptions = {};


/****
 * For node application with multiple instances
 */
function setCluster(i:number) {    
    setTimeout ( () => {             
        let worker = cluster.fork();       
    }, i * 5000 );
}


/**
 * Error Handler
 */
function onError(error: NodeJS.ErrnoException):void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof PORT === 'string') ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch(error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
        break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
        break;
        default:
            throw error;
    }
}

/***
 * SSL Certificates
 */ 
function getSSL():ServerOptions {

    let options:ServerOptions = { key: null, cert:null };

    switch (ENVIRONMENT) {
        case 'dev': 
            options.key = getCertificate(PATH_TO_DEV_PRIVATE_KEY);
            options.cert =  getCertificate( PATH_TO_DEV_CERTIFICATE);
            break;

        case 'prod': 
            options.key = getCertificate( PATH_TO_PROD_PRIVATE_KEY,);
            options.cert =  getCertificate(  PATH_TO_PROD_CERTIFICATE);
            break;
    }

    return options;    
}


/****
 * On Listening: called when our express app has inittialzied
 */
function onListening():void {

    let addr = httpServer.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    console.error(`Listening on ${bind}`);

   /*****
    * BOOTSTRAP APPLICATION  
    */       
    bootstrapController.init();

}

/***
 * Test Server: http protocol only
 */
export const createTestServer = ():Promise<any> => { 

    const httpServer:any = http.createServer(App);
    const server:any = httpServer.listen(PORT);    

    /***
     * Flag that application runs in test mode
     * so bootstrap controller can skip steps
     */
    proxyService.setTestStatus();

    return Promise.resolve({
        httpServer,
        server
    });
}


/***
 * Create server instance
 */
export const createServer = ():Promise<any> => { 

    /* Log stack trace on worker dead */
    process.on('uncaughtException', (err) => {

        /***
         * Log Critical System Error
         */
        ErrorLogger.error({
            section: 'Application',
            eventID: 1,
            status: `Critical Error: ${err.message}`,
            stack: JSON.stringify(err.stack)
        });    

        /***
         * Terminate Application
         */
        process.exit(1);
    });  

    /**
     * Create HTTPS server.
     */
    if(EXPRESS_SERVER_MODE==='https') {     

        let options:ServerOptions = getSSL();
        httpServer = https.createServer(options, App);      

    /**
     * Create HTTP server.
     */
    } else if(EXPRESS_SERVER_MODE==='http') {       
        
       httpServer = http.createServer(App);    

    }       

    /**
     * Listen on provided port, on all network interfaces.
     */
    let server = httpServer.listen(PORT);
    httpServer.on('error', onError);
    httpServer.on('listening', onListening);      

    return Promise.resolve(server);    
}






