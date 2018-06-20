import { createServer } from "./server";

import {
    environmentController
} from "./controllers/environment.controller";

const init = async () => {

	// environmentController.load();

	createServer();  
}

init();









