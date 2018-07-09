/****
 * Class EnvironmentController
 * 
 * Wrapper around dotenv: https://www.npmjs.com/package/dotenv
 * Loads environment files from env directory
 * 		=> change this.path for other location
 * 		=> environmental files with .example are ignored (example .env.redis.example)
 */

import dotenv from 'dotenv';
import fs from 'fs-extra';
import {promisify} from "util";
import path from "path";
const rootPath  = require("app-root-path");

promisify(fs.readdir).bind(fs);
promisify(fs.readFile).bind(fs);

export class EnvironmentController {

	private rootPath:string = rootPath.path.toString();

	private path:string = './env';

	private encoding:string = 'utf8';

	private parse:Function = dotenv.parse.bind(dotenv);

	constructor(path?:string, encoding?:string) {
		if(path) this.path = path;
		if(encoding) this.encoding = encoding;
	}

	/****
	 * @path: optional string
	 */
	public loadEnvironmentalVariables(
		pathToEnvDirectory?:string
	):string[]  {

		let err:any;
		let files:string[];

		if(pathToEnvDirectory) {
			this.path = path.join(this.rootPath, pathToEnvDirectory);
		}

		try {	
		
			/****
			 * Filter .env. files
			 */
			let dirContent:string[] = fs.readdirSync(this.path)			
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

	private async reloadEnvironment(files:string[]):Promise<boolean> {

		let err:any;		

		files.forEach( async (file:string) => {

			try {

				let secrets:any = [];

				// construct absolute path to environmental file
				const pathToFile:string = path.join(this.rootPath, this.path, file );

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

			catch(e) {
				err = e; 
			}					

		});	

		if(err) {
			return Promise.resolve(err);
		} else {
			return Promise.resolve(true);
		}
	}	

}

export const environmentController:EnvironmentController = new EnvironmentController();



