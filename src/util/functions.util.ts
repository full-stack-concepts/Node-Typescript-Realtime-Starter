
export const deepCloneObject = (obj:any):any => {
	return JSON.parse(JSON.stringify(obj));	
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