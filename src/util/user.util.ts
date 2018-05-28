import randomNumber from "random-number";
import moment from "moment-timezone";


import { 
    TIME_ZONE,
    DATE_FORMAT,
    TIME_FORMAT,
    MAX_LENGTH_USER_LOGINS_EVENTS,
    RANDOMIZE_PASSWORD_ENCRYPTION 
} from "./secrets";

import { deepCloneObject, cloneArray, 
    encryptWithInitializationVector,
    decryptWithInitializationVector,
    encryptWithCrypto,
    decryptWithCrypto,
    encryptWithBcrypt,
    decryptWithBcrypt
} from "../util";

import { IUser, IClient, ICustomer, ILoginTracker, IEncryption } from "../shared/interfaces";

interface IName  {
    givenName:string,
    middleName:string,
    familyName:string
}

interface encryptPasswordFunction {
    (passord:string):Promise<{method:number, hash:String|Buffer, data:any}>
}

// #TODO: promisify crypto methods
/*
export const encryptPassword = (password:string) => {

    let method:number = this.__pickPasswordEncryptionMethod();
    let err:any;
    let hash:Buffer|string;  
  
    if(!RANDOMIZE_PASSWORD_ENCRYPTION)
        method = 3;   

    // #TODO: encrypt mehtod with Initialization Vector
    // method=1;    
    
    //Method 1: Crypt with Initialization Vector
    if(method===1) {       
        return encryptWithInitializationVector(password)
        .then( (hash:string|Buffer) => Promise.resolve({method:method, hash:hash, data:null}) ) 
        .catch( (err:any) => Promise.reject("<errorNumber>"))
    }

    // Method 2: Crypto  
    else if(method === 2) {
        return encryptWithCrypto(password)
        .then( (hash:string|Buffer) => Promise.resolve({method:method, hash:hash, data:null}) ) 
        .catch( (err:any) => Promise.reject("<errorNumber>"))
    }   

    // Method 3: Bcrypt/
    else if(method === 3) {      
        return encryptWithBcrypt(password)
        .then( (hash:string|Buffer) => Promise.resolve({method:method, hash:hash, data:null}) ) 
        .catch( (err:any) => Promise.reject("<errorNumber>"))
    }       
}
*/

/*
export const decryptPassword = ({method, hash, data}:IEncryption)=> {
    console.log("==> (4) decrypt password ", method, data)
    let err:any;
    let pw:Buffer|string; 

    //Method 1: Decrypt with Initialization Vector
    if(method===1) {    
        return decryptWithInitializationVector(String(hash))
        .then( (decrypted:string) => {  
            console.log(decrypted, data)        
            if( decrypted===data) {
                return Promise.resolve(true)
            } else {
                return Promise.reject("<errorNumber>");
            }
        })
        .catch( (err:any) => Promise.reject(err));
    }

    // Method 2: Crypto  
    else if(method === 2) {    
        return decryptWithCrypto(hash)
        .then( (decrypted:string|Buffer) => {
            if( decrypted === data) {
                return Promise.resolve(true)
            } else {
                return Promise.reject("<errorNumber>");
            }
        })
        .catch( (err:any) => Promise.reject(err));      
    }

    // Method 3: Bcrypt
    else if(method === 3) {    
        console.log("==> (5) Decrypt with Crypto ", data)
        return decryptWithBcrypt(data, String(hash))
        .then( (valid:any) => {
            if(valid) {
                return Promise.resolve(true)
            } else {
                return Promise.reject("<errorNumber>");
            }
        })
        .catch( (err:any) => Promise.reject(err) );
    }
}

*/

export const __pickPasswordEncryptionMethod = ():number => {
    return randomInt(1,3);
}

export const pickPasswordEncryptionMethod = ():number => {
    let method:number;
    if( RANDOMIZE_PASSWORD_ENCRYPTION ) {
        method = 3;
    } else {
        method = randomInt(1,3);
    }
    return method;
}


/****
 * Only usable for password encryption methods 1 and 2
 */
export const comparePassword = (_pwd:string, pwd:string):boolean => {
    return (String(_pwd) === pwd);
}

/*****
 * Configure any date to start at 00:00 
 */
export const configureDate = (date:Date):string=> {
    let TZ = TIME_ZONE;              
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
    return randomNumber({min:min, max:max, integer:true});
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

const _uPolicy = (user:any) => {
    return  {
        'givenName': sliceMe( user.profile.personalia, 'givenName', 4),
        'familyName': sliceMe( user.profile.personalia, 'familyName', 5),
        'number': randomInt(1001, 3999)
    }
}

const _coreProps = (uPolicy:any) => {
    return {
        userName: `${uPolicy.givenName}${uPolicy.familyName}${uPolicy.number}`,
        url:  `${uPolicy.givenName}_${uPolicy.familyName}_${uPolicy.number}`
    }
}

export const constructClientCredentials = (client:IClient, done:Function):any => {   
    let uPolicy:any = _uPolicy(client),
        credentials:any = _coreProps(uPolicy);
    return done(credentials);
}

export const constructCustomerCredentials = (user:ICustomer, done:Function):any => {   

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



