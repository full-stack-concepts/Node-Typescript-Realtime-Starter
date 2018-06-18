import { Request, Response, NextFunction } from "express";
import { HTTPLogger } from "../../../controllers";
import { clientDetectionService } from "../../../services";

/****
 * Analyse client on root router entry 
 */
export function analyse(req:Request, res:Response, next:NextFunction) {   

	console.log("*** Root entry") 

	clientDetectionService.analyse(req, res)
    .then( (info:any) => {
    	console.log(info)
    	let logString:string = ` ip: ${info.ip} - viewport: ${info.viewport}`;
    	if(info.osInfo.android)  logString += ` -android: ${info.osInfo.android}`;
    	if(info.osInfo.iOS)  logString += ` -iOS: ${info.osInfo.iOS}`;
    	if(info.osInfo.iPhone)  logString += ` -iPhone: ${info.osInfo.iPhone}`;
    	if(info.osInfo.webOS)  logString += ` -webOS: ${info.osInfo.webOS}`;
    	if(info.osInfo.mac)  logString += ` -mac: ${info.osInfo.mac}`;
    	if(info.osInfo.windows)  logString += ` -windows: ${info.osInfo.windows}`;

    	HTTPLogger.access(logString);    
    })
    .catch( (err:any) => {
    	// #TODO: log error
    	console.error("Error ", err);
    });	

    next();
    
}