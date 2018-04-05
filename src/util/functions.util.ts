
export const deepCloneObject = (obj:any):any => {
	return JSON.parse(JSON.stringify(obj));	
}

export const capitalizeString = (str:string):string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}