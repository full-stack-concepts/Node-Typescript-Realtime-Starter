import fetch from "node-fetch";
import Promise from "bluebird";
import urlRegex from "url-regex";

/****
 * Function helper: deep clone object
 * #TODO: replace with spread operator
 */
export const deepCloneObject = (obj:any):any => {
	return JSON.parse(JSON.stringify(obj));	
}

export const cloneArray= (arr:any):Array<any> => {	
	if(!arr || (arr && !Array.isArray(arr))) return [];	
	return arr.slice(0) || [];
}

export const capitalizeString = (str:string):string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const objectKeysLength = (obj:any):number => { 
	let keys:any = Object.keys(obj);
	return keys.length;
}

export const stringify = (obj:any):string => { 
	if(typeof obj === "string") return obj;
	return JSON.stringify(obj); 
}

export const isEmail = (str:string):boolean => {
	if(!str || str && typeof str != 'string') return false;	
	let emailRegEx:RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return emailRegEx.test(str);		
}

export const isURL = (url:string):boolean => {	
	if(!url) return false; // only test url, not if is required
	return urlRegex().test( url.toString() )
}

/****
 * Function helper: countArrayItems for data service
 * use with Array.prototype.reduce
 */
export const countArrayItems = (accum:any, current:any) => {
    if(current.amount) accum.count += current.amount;
    return accum;
}

/******
 * Node Fetch Operations
 */
export const get = (url:string) => {
	 return fetch(url)
	 .then( res => res.json())
	 .then( data => Promise.resolve(data) )
	 .catch( err => Promise.reject(err) );
}

export const post = () => {
	return true;
}

export const set = () => {
	return true;
}