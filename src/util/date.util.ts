import moment from "moment-timezone";

/***
 * Application Settings
 */
import {  	
    TIME_ZONE,
} from "./secrets";

export const tsFormatter = ():number => {
	return Math.round((new Date()).getTime() / 1000);
}

export const timestampToString = ():string => {

	let ts:number = Math.round(+new Date());
    let date:Date = new Date(ts);
    return moment(date).tz( TIME_ZONE ).format('DD-MM-YYYY HH:mm:ss:ssss').toString();     
}