import path from "path";
import fs from "fs-extra";
const appRoot = require('app-root-path');

/****
 * Set application root path;
 */
export const rootPath = appRoot.path.toString();

/****
 * Get SSL Certificate
 */
export const getCertificate = (pathToKey:string):Buffer => { 	
    return fs.readFileSync( path.join ( rootPath, pathToKey));
}

/****
 * Get Private Key for token authentication when server is bootstrapping
 */
export const readPrivateKeyForTokenAuthentication = ():Buffer => {

	let file:string = `private.pem`;
	let filePath:string= path.join( rootPath, 'config', 'webtoken', file );	
	return fs.readFileSync(filePath);
}

/****
 * Environmental files: development
 */
export const readDevConfiguration=() => {
	return fs.existsSync( path.join( rootPath, ".env"));
}

/****
 * Environmental files: production
 */
export const readProdConfiguration=() => {
	return fs.existsSync( path.join( rootPath, ".prod"));
}


