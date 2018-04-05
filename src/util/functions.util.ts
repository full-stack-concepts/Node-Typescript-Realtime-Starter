
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

export const stringify = (obj:any) => { 
	if(typeof obj === "string") return obj;
	return JSON.stringify(obj); 
}

