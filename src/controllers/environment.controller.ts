/****
 * Class EnvironmentController
 * 
 * Wrapper around dotenv: https://www.npmjs.com/package/dotenv
 * Loads environment files from env directory
 * 		=> change this.path for other location
 * 		=> environmental files with .example are ignored (example .env.redis.example)
 */

import dotenv from 'dotenv';
import Promise from "bluebird";
import fs from 'fs-extra';
import path from "path";
import jsonFile from  "jsonfile";
const rootPath  = require("app-root-path");

Promise.promisifyAll(jsonFile.readFile);

export class EnvironmentController {

	/***
	 * Application Root Path
	 */
	private rootPath:string = rootPath.path.toString();

	/***
	 * Path to development and productoinenvironment from app root
	 */
	private pathToDevelopmentSettingsDirectory:string = './env';
	private prodToProudctionSettingsDirectory:string = './prod';

	/***
	 * Path to for validation objects directory frmo app root
	 */
	private pathToValidationObjectsDirectory:string = './config/validation';

	/***
	 * File encoding
	 */
	private encoding:string = 'utf8';

	private parse:Function = dotenv.parse.bind(dotenv);

	constructor(path?:string, encoding?:string) {
		if(path) this.pathToDevelopmentSettingsDirectory = path;
		if(encoding) this.encoding = encoding;
	}

	/****
	 * @path: optional string
	 */
	public loadValidationFormObjects(
		pathToEnvDirectory?:string
	) {

		let err:Error;
		let files:string[];
		let validationObjects:any = [];

		if(pathToEnvDirectory) {
			this.pathToValidationObjectsDirectory = path.join(this.rootPath, pathToEnvDirectory);
		} else{
			this.pathToValidationObjectsDirectory = path.join(this.rootPath, this.pathToValidationObjectsDirectory);
		}
		
		/****
		 * Filter .json files
		 */	
		let dirContent:string[] = fs.readdirSync(this.pathToValidationObjectsDirectory);	
		files = dirContent.filter( (file:string) => file.match(/.*\.json/));	  		

		/****
		 * Filter example files
		 */
		files = files.filter( (file:string) => !file.match(/.*example/ig) );			

		/***
		 * Parse file and add them to validationObjects Array
		 */
		return Promise.map( files, (file:string) => {
			const pathToFile:string = path.join(this.pathToValidationObjectsDirectory, file);	
			let rawdata:Buffer = fs.readFileSync(pathToFile);  
			let data:any = JSON.parse(rawdata.toString('utf8'));
			validationObjects.push(data);				
		})			
		.then( (result:any) => Promise.resolve(validationObjects) )
		.catch( (err:Error) => { 

			/****
			 * Critical Error
			 */
			if(err) {				
				console.error("Critical Error: could not load form validation files", err.message)
				process.exit(1);
			}

		});		
	}


	/****
	 * @path: optional string
	 */
	public loadEnvironmentalVariables(
		pathToEnvDirectory?:string
	):string[]  {

		let err:Error;
		let files:string[];

		if(pathToEnvDirectory) {
			this.pathToDevelopmentSettingsDirectory = path.join(this.rootPath, pathToEnvDirectory);
		}

		try {	
		
			/****
			 * Filter .env. files
			 */
			let dirContent:string[] = fs.readdirSync(this.pathToDevelopmentSettingsDirectory)			
			files = dirContent.filter( (file:string) => {				
				return file.match(/.*\.env\./ig);
			});	    

			/****
			 * Filter example files
			 */
			files = files.filter( (file:string) => !file.match(/.*example/ig) );	 	
					
			/***
			 * Parse file
			 */
			files.forEach( (file:string) => {				
				const pathToFile:string = path.join(this.rootPath, "env", file);			
				if (fs.existsSync(pathToFile)) {   				
    				dotenv.config({ path: pathToFile });
				}
			});			
		}

		catch(e) {err = e;}

		finally {

			/****
			 * Critical Error
			 */
			if(err) {				
				console.error("Critical Error: could not load environmental files ", err.message)
				process.exit(1);

			/****
			 * Return to caller
			 */
			} else {
				return;		
			}
		}
	}	

	/****
	 * Load Environmental files into memory
	 * @files: string[]
	 */
	/*
	private async reloadEnvironment(files:string[]):Promise<boolean> {

		let err:Error;		

		files.forEach( async (file:string) => {

			try {

				let secrets:any = [];

				// construct absolute path to environmental file
				const pathToFile:string = path.join(this.rootPath, this.pathToDevelopmentSettingsDirectory, file );

				// get file data
				const data:any = await fs.readFile( pathToFile, this.encoding);

				// parse data 
				let values:any = this.parse(data);		
			
				// build settings array
				let keys:string[] = Object.keys(values);
				keys.forEach( (key:string) => {
					secrets.push({ [key.toUpperCase()]: values[key]})
				});

				console.log(secrets)

				// pump key into memory
				secrets.forEach( (secret:any) => {
					let key:string = Object.keys(secret)[0];
					process.env[key] = secret[key];
				});				
			}

			catch(e) { err = e; }					
		});	

		if(err) {
			return Promise.reject(err);
		} else {
			return Promise.resolve(true);
		}
	}
	*/	

}

export const environmentController:EnvironmentController = new EnvironmentController();



