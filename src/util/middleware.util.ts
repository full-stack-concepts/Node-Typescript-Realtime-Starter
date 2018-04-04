import compression from "compression";
import { Request, Response, NextFunction } from "express";

import { ENVIRONMENT, PORT, CLIENT_PORT, ADMIN_PORT } from "./secrets";

export function shouldCompress (req:Request, res:Response) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }
 
  // fallback to standard filter function
  return compression.filter(req, res);
}

export function allowCredentials(req:Request, res:Response, next:NextFunction) {    
	res.header('Access-Control-Allow-Credentials', 'true');
    next();
}

export function allowMethods(req:Request, res:Response, next:NextFunction) {               
   
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
};  

// remove http and https string from http headers origin
export function strip(str:string) {    
    if(!str) return;
    str.replace("http://", "").trim();
    str.replace("https://", "").trim();
    return str;
}

function __populate(a:Array<string>):Array<string> {
	
	a.push(`localhost:${PORT}`);
	a.push(`http://localhost:${PORT}`);
	a.push(`https://localhost:${PORT}`);
	a.push(`*.localhost:${PORT}`);
	a.push(`http://*.localhost:${PORT}`);
	a.push(`https://*.localhost:${PORT}`);

	a.push(`localhost:${CLIENT_PORT}`);
	a.push(`http://localhost:${CLIENT_PORT}`);
	a.push(`https://localhost:${CLIENT_PORT}`);
	a.push(`*.localhost:${CLIENT_PORT}`);
	a.push(`http://*.localhost:${CLIENT_PORT}`);
	a.push(`https://*.localhost:${CLIENT_PORT}`);

	a.push(`localhost:${ADMIN_PORT}`);
	a.push(`http://localhost:${ADMIN_PORT}`);
	a.push(`https://localhost:${ADMIN_PORT}`);
	a.push(`*.localhost:${ADMIN_PORT}`);
	a.push(`http://*.localhost:${ADMIN_PORT}`);
	a.push(`https://*.localhost:${ADMIN_PORT}`);

	return a;
}

function populate(a:Array<string>):Array<string> {
	return a;
}

// type req to any -> origin property unkown on Request
export function allowOrigin(req:Request, res:Response, next:NextFunction) {       	

	let allowedOrigins:any[] = [],
		env:string = ENVIRONMENT;

	if(env === 'dev') allowedOrigins = __populate(allowedOrigins);
	if(env === 'prod') allowedOrigins = populate(allowedOrigins);

	let origin = req.headers.origin || req.headers.host;  
	origin = strip(origin);

	 // do we recweive an url through postmen chrome dev toolk then continue
    if (origin.indexOf("chrome-extension") >= 0) {      
        res.locals.postmenTest = true;
        next();

    // test if (sub)domain is allowed to send requests
    } else if(allowedOrigins.indexOf(origin) > -1) { // match              
        res.setHeader('Access-Control-Allow-Origin', origin);        
        next();
    } else {
        res.json({

        });
    }

}