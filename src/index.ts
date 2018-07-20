import { createServer } from "./server";

const init = async () => {

	try {
		await createServer();  
	}
	catch(err) {
		if(err) {
			console.error("*** Critical Error: ", err.message )
			process.exit(1);
		}
	}
}

/***
 * Initialize HTTP(S) Server
 */
init();









