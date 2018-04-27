import randomNumber from "random-number";
import moment from "moment-timezone";

import { 
    TIME_ZONE, 
    DATE_FORMAT,
    TIME_FORMAT,
    MAX_LENGTH_USER_LOGINS_EVENTS
} from "./secrets";

import { deepCloneObject, cloneArray } from "../util";
import { IUser, IClient, ICustomer, ILoginTracker } from "../shared/interfaces";

interface IName  {
    givenName:string,
    middleName:string,
    familyName:string
}

/*****
 * Configure any date to start at 00:00 
 */
export const configureDate = (date:Date):string=> {
    let TZ = this.siteConfiguration.TIME_ZONE_AMS;              
       return moment
                .tz(date, TZ )
                .startOf('day')
                .add(1, 'day')
                .startOf('day')
                .format();
    }

export const sliceMe = (obj:any, prop:string, pos:number) => {
    return obj[prop].toString().slice(0, pos).trim().toLowerCase();
}

export const randomInt = (min:number, max:number):number => {
    return randomNumber({min:1001, max:8999, integer:true});
}

export const constructUserCredentials = (user:IUser, done:Function):any => {   

    let uPolicy:any = {
        'givenName': sliceMe( user.profile.personalia, 'givenName', 4),
        'familyName': sliceMe( user.profile.personalia, 'familyName', 5),
        'number': randomInt(1001, 3999)
    }

    return done({
        userName: `${uPolicy.givenName}${uPolicy.familyName}${uPolicy.number}`,
        url:  `${uPolicy.givenName}_${uPolicy.familyName}_${uPolicy.number}`
    });
}

export const constructProfileFullName = ( {givenName, middleName, familyName }:IName ):string => {
    let n:string = givenName;
    if(middleName) n+= ` ${middleName}`;
    if(familyName) n+= ` ${familyName}`;
    return n;
}

export const constructProfileSortName = ( {givenName, middleName, familyName }:IName ):string => {   
    return `${familyName}`;
}

export const validateInfrastructure = (user:IUser|IClient|ICustomer):Promise<boolean> => {
    return Promise.resolve(true);
}

/****
 * 
 */
export const validateUserIntegrity = (user:IUser|IClient|ICustomer):Promise<boolean> =>  {

    // TODO: writer Promise.join and add test for devices
    let l:number = user.logins.length;
    if(user.logins && l > MAX_LENGTH_USER_LOGINS_EVENTS ) {        
        let toSlice:number = (l - MAX_LENGTH_USER_LOGINS_EVENTS);
        let arr:any = cloneArray(user.logins);
        arr.slice(0, toSlice);
    }

    return Promise.resolve(true);
}

/****
 * Update User profile
 */
export const authenticationTracker= ():Promise<ILoginTracker> =>  { 

    let ts:number = Math.round(+new Date());
    let date:Date = new Date(ts);
    let login:ILoginTracker;
    let err:any;
  
    try {
        login = {
            timestamp: ts,
            date: moment(date).tz( TIME_ZONE ).toString(),
            formattedDate:  moment(date).tz( TIME_ZONE ).format( DATE_FORMAT ),
            formattedTime: moment(date).tz( TIME_ZONE ).format( TIME_FORMAT )
        };   
    }
    catch(e) { err =e; }
    finally {
        console.log(err, login);
        if(err) return Promise.reject('errorNumberAuthenticationTracker');
        if(!err) return Promise.resolve(login);
    }  
}


export const updateUserForAuthenticationProvider = (
    profile:any,
    user:IUser|IClient|ICustomer
):Promise<IUser|IClient|ICustomer> => {    

    const p=profile;   

    /****
     * Test for Google Provider
     */
    if( profile.provider && 
        typeof(profile.provider === 'string') && 
        profile.provider === 'google'
    ) {

        // test if user is registered as a Google User
        if(!user.configuration.isGoogleUser) {

            // update user configuration
            user.configuration.isGoogleUser = true;
            user.profile.social.googleplus = p.url || "";

            // set public google ID
            user.accounts.googleID = p.id;

            /****
             * Google Plus user
             */
            if(p._json && p._json.url && p._json.url.length && typeof p._json.url === 'string') {
                user.profile.social.googleplus = p._json.url;
                user.configuration.isGooglePlusUser = true;
            }       

            /****
             * Verified Google Account
             */
            if(p._json && p._json.verified && p._json.verified.length && typeof p._json.verified === 'boolean' ) {
                user.security.isAccountVerified = p._json.verified;
            }

            // set raw profile
            user.profileRaw = p._raw;

            // update configuration
            user.configuration.isGoogleUser = true;
        }

    }

    /***
     * Test for Facebook Provider
     */
    else if( profile.profileUrl && 
             typeof (profile.profileUrl) === 'string' &&
             profile.profileUrl.includes('facebook') 
    ) {

        console.log("==> This is an facebook account")

        // test if user is registered as a Facebook User
        if(!user.configuration.isFacebookUser) {

            // update user configuration
            user.configuration.isFacebookUser = true;
            user.profile.social.facebook = p.profileUrl;

            // set public facebook ID
            user.accounts.facebookID = p.id;

            // set raw profile
            user.profileRaw = p._raw;

            // update configuration
            user.configuration.isFacebookUser=true;
        }    
    } else {
        console.log("==> This is NOT an facebook account")
    }

    return Promise.resolve(user);

}



