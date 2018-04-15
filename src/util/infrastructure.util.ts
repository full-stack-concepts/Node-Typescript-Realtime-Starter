import path from "path";
import fs from "fs-extra";
import Promise from "bluebird";

const mkdirp = require("mkdirp");
const appRoot = require("app-root-path");

/****
 * Import PATH Settings 
 */
import {
	SERVE_PUBLIC_RESOURCES,
	PUBLIC_ROOT_DIR,
	PUBLIC_ASSETS_DIR,
	PUBLIC_IMAGES_DIR,
	PUBLIC_STYLES_DIR,
	PUBLIC_ASSETS_DIRS,
	PUBLIC_STYLES_DIRS,
	CREATE_DATASTORE,
	PRIVATE_DATA_DIR
} from "./secrets";

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

/********
 * Create directories and return an ordinany Promise (bootstrapping so we do not neeed bluebird)
 */
export const createDirectory = ( $dir:string ):Promise<any> => {
	return new Promise ( (resolve, reject) => {		
		fs.stat ( $dir, ( err:any, stats:any) => {
			if(err) {
				mkdirp ( $dir, (err:any) => { (err) ? reject(err):resolve(true); })
			} else { 
				resolve(); 
			}
		});
	});
}

export const getPathToDataStore = ():string => {
	return path.join( rootPath, PRIVATE_DATA_DIR );
}

/****
 * Private Directory Manager: creates public directories if they do not exist
 */
export const createPrivateDataStore = () => {

	if(!CREATE_DATASTORE) return;

	const $private:string = path.join( rootPath, PRIVATE_DATA_DIR),
		  $dirs = ['1','2','3'];

	// process thick: create private directory
	return createDirectory( $private )

	// process thick: create three sub directories
	.then( () => {
		return Promise.all(
			$dirs.map( (dir:string) => {
				let $dir:string =  path.join( $private, dir.toString() );
				createDirectory( $dir );
			 }) 
		)
	})

	// process thick: return a promise so this function can be chained in our bootstrap procedure
	.then( () => {
		Promise.resolve() 
	})

	// error handler
	.catch( err   => {
		console.error("Private Directories: could not construct all DataStore directories. Please check your error log.") 
		console.error("Private Directories: ", err );
		process.exit(1);		
	});		
}


/****
 * Public Directory Manager: creates public directories if they do not exist
 */
export const publicDirectoryManager = () => {

	if(!SERVE_PUBLIC_RESOURCES) return;

	//  define directories
	const $public:string = path.join( rootPath, PUBLIC_ROOT_DIR);
	const $assets:string = path.join( $public, PUBLIC_ASSETS_DIR);
	const $images:string = path.join( $assets, PUBLIC_IMAGES_DIR);
	const $styles:string = path.join( $assets, PUBLIC_STYLES_DIR);
	
	/****
	 * process thick: public directory
	 */
	return createDirectory( $public )	

	/****
	 * process thick: $public/$assets directory
	 */
	.then( status => createDirectory($assets) )

	/****
	 * process thick: $public/$assets/$images directory
	 */
	.then( status => createDirectory($images) )

	/****
	 * process thick: $public/$assets/$styles directory
	 */
	.then( status => createDirectory($styles) )	


	/****
	 * process thick: $public/$assets/$subDirs
	 */
	.then( () => {	
		return Promise.all(
			PUBLIC_ASSETS_DIRS.map ( (dir:string) => {
				let $dir:string = path.join( $assets, dir );				
				createDirectory($dir);
			})
		)
		.catch( err => Promise.reject(err) );		
	})

	/****
	 * process thick: $public/$assets/$styles/$subDirs
	 */
	.then( () => {	
		return Promise.all(
			PUBLIC_STYLES_DIRS.map ( (dir:string) => {
				let $dir:string = path.join( $styles, dir );				
				return createDirectory($dir);				
			})
		)
		.catch( err => Promise.reject(err) );
	})

	/****
	 * proces thick: return a promise so this function can be chained in our bootstrap procedure
	 */
	.then( () => Promise.resolve() )

	/****
	 * Error Handler
	 */
	.catch( err   => {
		console.error("Public Directories: could not construct all directories. Please check your error log or provide ysstem priviliges.") 
		console.error("Public Directories: ", err );
		process.exit(1);		
	});	

}

