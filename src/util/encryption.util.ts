import Promise from "bluebird";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Cipher, Utf8AsciiBinaryEncoding } from "crypto";

import {
    CRYPTO_HASH_ALGORITHM,
    CRYPTO_IV_ENCRYPTION_KEY,
    CRYPTO_IV_VECTOR_LENGTH,
    USER_PASSWORD_SALT_ROUNDS,   
} from "./secrets";

const isString = (str:string):boolean => {
    return (!str || str && typeof str === 'string');
} 

/*****
 * Method 1: Crypto with Initialization Vector
 * More info: http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/
 */
export const encryptWithInitializationVector = (data:string) => {   

    let err:Error;  
    let iv:Buffer;
    let cipher: any;
    let encrypted:Buffer;
    let hash:string;    

    try {

        if(!isString(data) ) data = String(data.toString());
        iv = crypto.randomBytes(16);
        
        cipher = crypto.createCipheriv(
            'aes-256-cbc', 
            new Buffer(CRYPTO_IV_ENCRYPTION_KEY), 
        iv);

        encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        hash = iv.toString('hex') + ':' + encrypted.toString('hex');  
    }
    catch(e) {err=e;}
    finally {
         if(err) return Promise.reject(err);
        if(!err) return Promise.resolve(hash);    
    } 
}

export const decryptWithInitializationVector = (hash:string) => {    

    
    let err:Error;
    let textParts:string[];
    let iv:Buffer;
    let encryptedText:Buffer;
    let decipher:any;
    let decrypted:string|Buffer;   

    try {

        textParts = hash.split(':');
        iv = new Buffer(textParts.shift(), 'hex');
        
        encryptedText = new Buffer(textParts.join(':'), 'hex');
        decipher = crypto.createDecipheriv(
            'aes-256-cbc', 
            new Buffer(CRYPTO_IV_ENCRYPTION_KEY), 
        iv);

        decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
    } 
    catch (e) { err = e; }
    finally {      
        if(err) return Promise.reject(err);
        if(!err) return Promise.resolve(decrypted.toString());    
    }
    
}

/*****
 * Method 2: Crypto
 */
export const encryptWithCrypto = (data:any) => {

    let err:Error;
    let cipher: any;
    let crypted:Buffer|string;

    try {
        cipher = crypto.createCipher('aes-256-cbc', CRYPTO_IV_ENCRYPTION_KEY);
        crypted = cipher.update(data, 'utf-8', 'hex');
        crypted += cipher.final('hex');
    }
    catch(e){err=e;}
    finally {
        if(err) return Promise.reject(err);
        if(!err) return Promise.resolve(String(crypted));   
    }
}

export const decryptWithCrypto  = (data:any) => {

    let err:Error;    
    let decipher:any;
    let decrypted:string;

    try {

        decipher = crypto.createDecipher('aes-256-cbc', CRYPTO_IV_ENCRYPTION_KEY);
        decrypted = decipher.update(data, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');                    
    }
    catch(e) { err=e;}
    finally {        
        if(err) return Promise.reject(err);
        if(!err) return Promise.resolve(decrypted);    
    }
}

/*****
 * Method 3: Bcrypt
 */
export const encryptWithBcrypt = ( password:string) => {     
 
    return bcrypt.genSalt(USER_PASSWORD_SALT_ROUNDS)
    .then( (salt:any) => bcrypt.hash( password, salt ) )
    .then( (hash:string) => Promise.resolve(String(hash)));
}

export const decryptWithBcrypt = ( str:string, hash:string) => {
    return bcrypt.compare( str, hash)
    .then( (valid:boolean) => Promise.resolve(valid) )
    .catch( (err:Error) => Promise.reject(err));
}