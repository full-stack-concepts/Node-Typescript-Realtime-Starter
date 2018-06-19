import {
	ICustomLevels
} from "./levels.interface";

export const customLevels:ICustomLevels = { 
	levels: {
        error: 0, 
  		warn: 1, 
  		info: 2, 
  		verbose: 3, 
  		debug: 4, 
  		application: 5,
  		access: 6,
        tests:7
	}
};