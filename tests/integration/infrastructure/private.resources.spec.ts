import { expect } from "chai";
import path from "path";
import Validator from "validator";
const isValidPath:any = require("is-valid-path");
const v:any = Validator;


import {
	EXPRESS_SERVER_MODE,
	DO_NOT_OVERWRITE_PRIVATE_DIRECTORIES,	
	CREATE_DATASTORE,
	PRIVATE_ROOT_DIR,
	PRIVATE_USERS_DIR,
	PRIVATE_DATA_DIR
} from "../../../src/util/secrets";

import {	
	getRootPath,
	fileStatistics,	
	deleteFolderRecursive,
	privateDirectoryManager,
	createPrivateDataStore
} from "../../../src/util";

const rootPath:string = getRootPath();

describe( "Private Directories Manager", () => {

	let privateInfratructureExists:boolean;

	const $rootDir:string = path.join(rootPath, PRIVATE_ROOT_DIR);		
	const $usersDir:string = path.join(rootPath, PRIVATE_ROOT_DIR, PRIVATE_USERS_DIR);	
	const $dataDir =  path.join(rootPath, PRIVATE_ROOT_DIR, PRIVATE_DATA_DIR);	
	const $dirs:string[] = [ $rootDir, $usersDir, $dataDir];

	/****
	 * Before starting tests we want to if private infrastructure exists
	 */
	before( async () => {

		let err:any;	

		try {		
			const r:any = await fileStatistics($rootDir);
			const u:any = await fileStatistics($usersDir);
			const d:any = await fileStatistics($dataDir);
			if(r && u && d) privateInfratructureExists = true;
		}
		catch(e) { err =e; }
		finally {
			if(!err && !DO_NOT_OVERWRITE_PRIVATE_DIRECTORIES) {
				await deleteFolderRecursive(_path);
			}
		}
	});

	it( "should be capable of creating private directories with datastore", async() => {

		let err:any;
		let obj:Object;

		try { 

			// create private directories
			await privateDirectoryManager();  

			// create data store directories
			if(CREATE_DATASTORE)
				await createPrivateDataStore();

		}		
		catch(e) { err=e; }		
		finally {
			if(err) return;
			$dirs.forEach( async ($dir:string) => {
				obj = await fileStatistics($dir);		
				expect(obj).to.have.property('size');
			});
		}
	});

});

