import {
	systemUserService,
	userService, UserService,
	facebookUserService,
	googleUserService,
	clientService,
	customerService	
} from "../services";

export class UAController  {	

	constructor() {
	}

	// Use Proxy to broke acceess to puppeteer Page class	
	static async build() {		

		try {

			const controller:any = new UAController();

			return new Proxy( controller, { 
				get: await function(target:any, property:any) {
					console.log("==> REQUEST ", property)
					 return userService[property] || 
					 		facebookUserService[property] || 
					 		googleUserService[property] ||
					 		clientService[property] ||
					 		customerService[property] ||
					 		systemUserService[property] 
					 }
			});		

		} catch(e) {

			console.error("")
			process.exit(1)
		}
	}
}