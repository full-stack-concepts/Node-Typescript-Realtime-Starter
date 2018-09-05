/****
 * Wrapper for Database Methods
 */

import mongoose from "mongoose";
mongoose.Promise = global.Promise;


export const constructUserDBConnectionString = (
	userDBAccount:any,
	maxPoolSize:number
):string => {
	const a:any = userDBAccount;
	console.log( `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${maxPoolSize}`)
	return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${maxPoolSize}`;	
}	

export const constructProductDBConnectionString = (
	productDBAccount:any,
	maxPoolSize:number
):string =>  {
	const a:any = productDBAccount;
	return `mongodb://${a.user}:${a.password}@${a.host}:${a.port}/${a.db}?maxPoolSize=${maxPoolSize}`;	
}	

export const closeConnection = ():void => {
	mongoose.connection.close();
}

export const initUserDatabase = (userDBAccount:any, maxPoolSize:any):Promise<any> => {	
	try {		
		
		const mongoURI:string = constructUserDBConnectionString(userDBAccount, maxPoolSize);	
		const db:any = 	mongoose.createConnection( mongoURI );	
		return Promise.resolve(db);
	} catch(e) {
		console.log(e);
	}		
}

/****
 *
 */
export const initProductDatabase = (productDBAccount:any, maxPoolSize:number):Promise<any> => {

	try {	

		const mongoURI:string = constructProductDBConnectionString(productDBAccount, maxPoolSize);			
		const db:any = 	mongoose.createConnection( mongoURI );			
		return Promise.resolve(db);

	} catch(e) {
		console.log(e);
	}	
}

