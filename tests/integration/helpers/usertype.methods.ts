 
export class UserTypeMethods {	

	// Use Proxy to broke acceess to puppeteer Page class
	static async build() {	

		type property = keyof UserTypeMethods;
		
		const methods:any =  new UserTypeMethods();	

		return new Proxy( methods, {
			get: (target:any, property:any)  => {
				 return methods[property];
			}
		})
	}	
}
