import {
	readDevConfiguration,
	readProdConfiguration
} from "../util";

const ENV:string = process.env.NODE_ENV;

export function testForConfiguration() {

	let devConfig = readDevConfiguration();
	let prodConfig = readProdConfiguration();

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