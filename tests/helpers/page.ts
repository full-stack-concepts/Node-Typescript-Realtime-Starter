import puppeteer from "puppeteer";

interface IndexSignature {
  [key: string]: any;
}

/****
 * Wrap base Page class and return Proxy to manage direct access
 * to customPage methods, Puppeteer Page methods and browser
 */
export class CustomPage {

	page:any;
	credentials:any;
	headers:any;

	constructor(page:any) {
		this.page = page;
		this.credentials =  'same-origin';
		this.headers = { 'Content-Type': 'application/json' };
	}

	/****
	 * Use JS Proxy to broke access to puppeteer's Page class
	 */
	static async build() {

		// load browse before create(callbackFunc: (callback: () => any) => any, selector?: void, scheduler?: IScheduler): ()eatign a page
		const browser:any = await puppeteer.launch({

			// use chromium instance
			headless: true,

			/****
			 * Travis CI Config
			 */
			args: ['--no-sandbox']
		});

		/****
		 * Create a Puppeteer Page instance
		 */ 
		const page:any = await browser.newPage();
		const customPage:any = new CustomPage(page);

		/****
		 * Return a new proxy that encapsulates
		 * (1) Custom page instance
		 * (2) Browser instance
		 * (3) Puppeteer page instance
		 */
		return new Proxy ( customPage, {
			get: (target:any, property:any)  => {
		 		return customPage[property] || browser[property] || page[property];
		 	}
		 });
	}

	/***
	 * Wrapped http get request in Chromium
	 */
	async get(path:string):Promise<any> {

		const credentials:any = this.credentials;
		const headers:any = this.headers;

		return this.page.evaluate( ( _path:string) => {

			return fetch( _path, {
				method: 'GET',
				credentials: credentials,
				headers: headers				
			})
			.then( res => res.json() ); 
			
		}, path );
	}

	/***
	 * Wrapped http post request in chromium
	 */
	async post(path:string, data:any) {

		const credentials:any = this.credentials;
		const headers:any = this.headers;

		return this.page.evaluate( ( _path:string, _data:any) => {
			return fetch( _path, {
				method: 'POST',
				credentials: credentials,
				headers: headers,
				body: JSON.stringify(_data)
			})
			.then( (res:any) => res.json() ); 
		}, path, data );
	}

	/*
	async execRequests(actions:any) {
		return Promise.all(
			actions.map( ({ method, path, data }:any) => {
				return this[method](path, data)
			})
		);
	}
	*/
}

