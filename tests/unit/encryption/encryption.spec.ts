import { expect, assert } from 'chai';

/***
 * Encryption methods
 */
import {
	pickPasswordEncryptionMethod,
  	encryptWithInitializationVector,
	decryptWithInitializationVector,
	encryptWithCrypto,
	decryptWithCrypto,
	encryptWithBcrypt,
	decryptWithBcrypt,
	word
} from "../../../src/util";

/***
 * Encryption Settings
 */
import {
    RANDOMIZE_PASSWORD_ENCRYPTION,
    CRYPTO_HASH_ALGORITHM,
    CRYPTO_IV_ENCRYPTION_KEY,
    CRYPTO_IV_VECTOR_LENGTH,
    USER_PASSWORD_SALT_ROUNDS,   
} from "../../../src/util/secrets";

/***
 * Test for encryption methods 
 */
describe("Data Encryption", () => {

	/***
	 * Test if Encryption Method policy is set
	 */
	it("should have a boolean for encryption randomize policy", () => {
		const policy:boolean = RANDOMIZE_PASSWORD_ENCRYPTION;
		expect(policy).to.be.a('boolean');
	});

	/***
	 * Test if encryption method in in range [1,3]
	 */
    it("should pick a random encryption method", () => { 
    	const method:number = pickPasswordEncryptionMethod();
        expect(method).to.be.least(1).and.most(3);
    }); 

    /***
     * Test if encryption method defaults to bcrypt (method type 3) 
     * if randomize policiy is set to true
     */
    it("should select Bcrypt encryption when randomize policy is set to true", () => {

    	const policy:boolean = RANDOMIZE_PASSWORD_ENCRYPTION;
    	const method:number = pickPasswordEncryptionMethod();
    	if(policy) {
    		expect(method).to.equal(3);
    	} else {
    		expect(method).to.be.least(1).and.most(3);
    	}
    });

    /***
     * Test encryption settings
     */
    it("should use valid cryptop amd bcrpt encryption settings", () => {
    	expect(CRYPTO_HASH_ALGORITHM).to.be.a('string');
    	expect(CRYPTO_IV_ENCRYPTION_KEY).to.be.a('string');
    	const saltRoundsIsInteger:boolean = Number.isInteger(USER_PASSWORD_SALT_ROUNDS);
    	expect(saltRoundsIsInteger).to.equal(true);
    });

    /***
     *
     */
    it("should encrypt and decrypt a random word with NodeJS Crypto and initialization vector", async() => {

    	const str:string = word().replace(/\s+/g, '_');
    	const hash:string = await encryptWithInitializationVector(str);

    	const decrypted:string = await decryptWithInitializationVector(hash);
    	const test:boolean = (decrypted == str);	

    	expect(hash).to.be.a('string');
    	expect(test).to.equal(true);   
    	
    });

    /***
     * 
     */
    it("should encrypt and decrypt random word with node's Crypto", async () => {

    	const str:string = word().replace(/\s+/g, '_');
        const hash:string = await encryptWithCrypto(str);

		const decrypted:string = await decryptWithCrypto(hash);
    	const test:boolean = (decrypted == str);	

    	expect(hash).to.be.a('string');
    	expect(test).to.equal(true);   
    });

    /***
     *
     */
    it("should encrypt and decrypt randword with Bcrypt and multiple salt rounds", async () => {

        const str:string = word().replace(/\s+/g, '_');
		const hash:string = await encryptWithBcrypt(str);

		const test:boolean = await decryptWithBcrypt(str, hash);
		expect(test).to.equal(true);   
    });

});



 

