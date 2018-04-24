import path from "path";
import fs from "fs-extra";
import Promise from "bluebird";

const mkdirp = require("mkdirp");
const appRoot = require("app-root-path");

Promise.promisifyAll(fs);
Promise.promisifyAll(mkdirp);

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
	PRIVATE_DATA_DIR,
	PUBLIC_USER_DIR,
	PUBLIC_USER_SUBDIRECTORIES,
	SITE_URL,
	DEFAULT_USER_THUMBNAIL
} from "./secrets";

import { 
	IUser,
	IClient,
	ICustomer,
	IRawThumbnail
} from "../shared/interfaces";

interface IAUserDirectory {
	dirCreated?: boolean, 
	err?:any
}

interface IAUserCreated {
	userCreated?:boolean,
	err?: any
}

interface IUserActions {
	imgResult?: IRawThumbnail,
	dirResult?: IAUserDirectory,
	insertResult?: IAUserCreated
}



/****
 * Set application root path;
 */
export const rootPath = appRoot.path.toString();
console.log(rootPath, PUBLIC_ROOT_DIR)


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
		return Promise.map( $dirs, (dir:string) => {
			let $dir:string = path.join( $private, dir.toString() );
			createDirectory( $dir );
		})		
	})

	// process thick: return a promise so this function can be chained in our bootstrap procedure
	.then( () => Promise.resolve() )

	// error handler
	.catch( err   => {
		console.error("Private Directories: could not construct all DataStore directories. Please check your error log.") 
		console.error("Private Directories: ", err );
		process.exit(1);		
	});		
}

export const pathToUsersDirectory = ():string => {
	return  path.join( rootPath, PUBLIC_ROOT_DIR, PUBLIC_USER_DIR);
}

export const createUserSubDirectories = ($userDir:string) => {

	Promise.map( PUBLIC_USER_SUBDIRECTORIES, (dir:string) => {
		let $dir:string = path.join( $userDir, dir.toString() );
		console.log(dir);
		createDirectory( $dir );
	})		
	.then( () => Promise.resolve() )
	.catch( (err:any) => Promise.reject(err) );  
}

export const pathToDefaultUserThumbnail = ():string => {
	return `${SITE_URL}${PUBLIC_ASSETS_DIR}/${PUBLIC_IMAGES_DIR}/${DEFAULT_USER_THUMBNAIL}`;
}

export const createUserDirectory = ($userName:string):PromiseLike<IAUserDirectory> => {

	const $users:string = pathToUsersDirectory();
	const $pathToUserDir:string = path.join( $users, $userName);

	return createDirectory( $pathToUserDir )
	.then( () => createUserSubDirectories( $pathToUserDir ))
	.then( () => Promise.resolve({ dirCreated:true }) )
	.catch( (err:any) => Promise.reject({ dirCreated: false, err: err }) );
}

/*****
 * Use this function only for Facebook and Google Authentication
 * or add checks for file size and image dimensions
 */
export const storeUserImage = ( rawThumbnail:IRawThumbnail, $userName:string)=> {

	// return to caller if user has default user thumbnail
	if(rawThumbnail.defaultImage) return Promise.resolve({stored:true});

	const $pathToUserDir:string = path.join(pathToUsersDirectory(), $userName);
	const $pathToFile:string = `${$pathToUserDir}/img/thumb.${rawThumbnail.fileName}`;		

	const writeStream = fs.createWriteStream($pathToFile); 
	writeStream.write( rawThumbnail.buffer, 'base64'); 

	return new Promise( (resolve, reject) => {
		writeStream.on('finish', () => resolve({stored:true}) );
		writeStream.on('error', (err:any) => reject({stored:false, err: err}) );
		writeStream.end( () => resolve({stored:true}) ); 
	})

	/*
	writeStream.on('finish', () => { return Promise.resolve({stored:true}); });
	writeStream.on('error', (err:any) => { 
		return Promise.reject({stored:false, err: err}); 
	});
	*/ 
	
}   	

export const pathToUserThumbnail = ( rawThumbnail:IRawThumbnail, $userName:string):string => {
	const $pathToUserDir:string = path.join(pathToUsersDirectory(), $userName);
	return  `${$pathToUserDir}/img/thumb.${rawThumbnail.fileName}`;
}

/****
 * Public Directory Manager: creates public directories if they do not exist
 */
export const publicDirectoryManager = () => {	

	//  define directories
	const $public:string = path.join( rootPath, PUBLIC_ROOT_DIR);
	const $assets:string = path.join( $public, PUBLIC_ASSETS_DIR);
	const $images:string = path.join( $assets, PUBLIC_IMAGES_DIR);
	const $styles:string = path.join( $assets, PUBLIC_STYLES_DIR);
	const $users:string = path.join( $public, PUBLIC_USER_DIR);
	
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
		return Promise.map( PUBLIC_ASSETS_DIRS, (dir:string) => {
			let $dir:string = path.join( $assets, dir );				
			createDirectory($dir);
		})	
		.catch( err => Promise.reject(err) );		
	})

	/****
	 * process thick: $public/$assets/$styles/$subDirs
	 */
	.then( () => {	
		return Promise.map( PUBLIC_STYLES_DIRS, (dir:string) => {
			let $dir:string = path.join( $styles, dir );				
			return createDirectory($dir);				
		})		
		.catch( err => Promise.reject(err) );
	})

	/****
	*  process thick: $public/$users
	*/
	.then( status => createDirectory($users) )

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

