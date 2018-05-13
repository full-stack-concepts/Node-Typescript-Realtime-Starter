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

import { IEncryption } from "../shared/interfaces";

const isString = (str:string):boolean => {
    return (!str || str && typeof str === 'string');
} 

/*****
 * Method 1: Crypto with Initialization Vector
 * More info: http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/
 */
export const encryptWithInitializationVector = (data:string):string => {   

    let err:any;  
    let iv:Buffer;
    let cipher: any;
    let encrypted:Buffer;
    let hash:string;    

    if(!isString(data) ) data = String(data.toString());
    iv = crypto.randomBytes(16);
    
    cipher = crypto.createCipheriv(
        'aes-256-cbc', 
        new Buffer(CRYPTO_IV_ENCRYPTION_KEY), 
    iv);

    encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    hash = iv.toString('hex') + ':' + encrypted.toString('hex');  

    return hash;           
}

export const decryptWithInitializationVector = (hash:string):string | Buffer => {

    let err:any;
    let textParts:string[];
    let iv:Buffer;
    let encryptedText:Buffer;
    let decipher:any;
    let decrypted:Buffer | string;   

    textParts = hash.split(':');
    iv = new Buffer(textParts.shift(), 'hex');
    
    encryptedText = new Buffer(textParts.join(':'), 'hex');
    decipher = crypto.createDecipheriv(
        'aes-256-cbc', 
        new Buffer(CRYPTO_IV_ENCRYPTION_KEY), 
    iv);

    decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;   
}

/*****
 * Method 2: Crypto
 */
export const encryptWithCrypto = (data:any):Buffer|string => {

    let err:any;
    let cipher: any;
    let crypted:Buffer|string;

    cipher = crypto.createCipher('aes-256-cbc', CRYPTO_IV_ENCRYPTION_KEY);
    crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

export const decryptWithCrypto  = (data:any):Buffer|string => {


    let err:any;    
    let decipher:any;
    let decrypted:Buffer|string;

    decipher = crypto.createDecipher('aes-256-cbc', CRYPTO_IV_ENCRYPTION_KEY);
    decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');    
    return decrypted;
}

/*****
 * Method 3: Bcrypt
 */
export const encryptWithBcrypt = ( password:string) => {  
   
    return bcrypt.genSalt(USER_PASSWORD_SALT_ROUNDS)
    .then( (salt:any) => bcrypt.hash( password, salt ) )
    .then( (hash:string|Buffer) => Promise.resolve(hash))   

}

export const decryptWithBcrypt = ( str:string, hash:string) => {
    return bcrypt.compare( str, hash)
    .then( (valid:boolean) => Promise.resolve(valid));
}