import {	
	dataUtilitiesService,
	DataStore
} from "../services";

/****
 * Data Actions Controller
 */
export class DAController  {	

	constructor() {
	}

	// Use Proxy to broke acceess
	static async build() {		

		try {

			const controller:any = new DAController();

			return new Proxy( controller, {
				get: await function(target:any, property:any) {
					/****
					 *
					 */
					 return dataUtilitiesService[property] ||
					 		DataStore[property];			 		
				}
			});		

		} catch(e) {	
			process.exit(1)
		}
	}
}