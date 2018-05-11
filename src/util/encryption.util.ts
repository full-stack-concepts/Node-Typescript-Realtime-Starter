import Promise from "bluebird";
import crypto from "crypto";
import _bcrypt from "bcryptjs";
const bcrypt = Promise.promisifyAll(_bcrypt);
import { Utf8AsciiBinaryEncoding } from "crypto";

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

    if(!isString(data) ) data = String(data.toString());

    let iv:any = crypto.randomBytes(16);
    let cipher:any = crypto.createCipheriv('aes-256-cbc', new Buffer(CRYPTO_IV_ENCRYPTION_KEY), iv);
    let encrypted:any = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return Promise.resolve(iv.toString('hex') + ':' + encrypted.toString('hex') );
  
}

export const decryptWithInitializationVector = (hash:string) => {

    let textParts:any = hash.split(':');
    let iv:any= new Buffer(textParts.shift(), 'hex');
    let encryptedText:Buffer = new Buffer(textParts.join(':'), 'hex');
    let decipher:any = crypto.createDecipheriv('aes-256-cbc', new Buffer(CRYPTO_IV_ENCRYPTION_KEY), iv);
    let decrypted:any = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return Promise.resolve(decrypted.toString());

}

/*****
 * Method 2: Crypto
 */
export const encryptWithCrypto = (data:any) => {

    const cipher = crypto.createCipher('aes-256-cbc', CRYPTO_IV_ENCRYPTION_KEY);
    let  crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return Promise.resolve(crypted);         

}

export const decryptWithCrypto  = (data:any) => {

    const decipher:any = crypto.createDecipher('aes-256-cbc', CRYPTO_IV_ENCRYPTION_KEY);
    var decrypted:any = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return Promise.resolve(decrypted);  

}

/*****
 * Method 3: Bcrypt
 */
export const encryptWithBcrypt = ( password:string) => {  
   
    return bcrypt.genSalt(USER_PASSWORD_SALT_ROUNDS)
    .then( (salt:string) => bcrypt.hash( password, salt ))
    .then( (hash:string) => { console.log("** hash: ", hash); return Promise.resolve( hash ) })
    .catch( (err:any) => Promise.reject( err ));    

}

export const decryptWithBcrypt = ( str:string, hash:string) => {

    return bcrypt.compare( str, hash)
    .then( (valid:boolean) => Promise.resolve(valid))
    .catch( (err:any) => Promise.reject( err));

}