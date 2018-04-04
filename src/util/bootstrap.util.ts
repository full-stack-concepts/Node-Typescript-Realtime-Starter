import fs from "fs-extra";
import path from "path";

const appRoot = require("app-root-path"),
	  root = appRoot.path.toString();

export function test() {
	console.log("test");
}

const ENV:string = process.env.NODE_ENV;

export function testForConfiguration() {

	let devConfig = fs.existsSync( path.join( root, ".env"));
	let prodConfig = fs.existsSync( path.join( root, ".prod"));

	/***
	 * Test if  configuration settings have been loaded
	 */
	if(ENV.toString()==='dev' && !devConfig) {
		console.error("Envrionment settings could not be imported from .env file")
		process.exit(1);

	} else if(ENV==='prod' && !prodConfig) {
		console.error("Envrionment settings could not be imported from .prod file")
		process.exit(1);
	}
}