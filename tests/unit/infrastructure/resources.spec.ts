import { expect } from "chai";
import path from "path";
import Validator from "validator";
const isValidPath:any = require("is-valid-path");
const v:any = Validator;

import {
	EXPRESS_SERVER_MODE,
	PUBLIC_ROOT_DIR,
	PRIVATE_ROOT_DIR,
	PATH_TO_DEV_CERTIFICATE,
    PATH_TO_PROD_PRIVATE_KEY,
    PATH_TO_PROD_CERTIFICATE
} from "../../../src/util/secrets";

import { ServerOptions } from './../../../src/shared/interfaces/';

import {
	getCertificate,
	readPrivateKeyForTokenAuthentication,
	readDevConfiguration,
	readProdConfiguration,
	pathToPublicUsersDirectory,
	pathToPrivateUsersDirectory,
	getRootPath,
	createDirectory,
	removeDirectory,
	fileStatistics,
	word,
	writeJSON
} from "../../../src/util";

const rootPath:string = getRootPath();

describe("Infrastructure", () => {	

	it("should provide application root directory", () => {
		const root:string = getRootPath();	
		expect(root).to.be.a('string');
		expect(isValidPath(root)).to.equal(true);
	});

	it("should handle valid public dir paths", () => {
		const $public:string = path.join(rootPath, PUBLIC_ROOT_DIR);
		expect(isValidPath($public)).to.equal(true);
	});

	it("should handle valid private dir paths", () => {
		const $private:string = path.join(rootPath, PRIVATE_ROOT_DIR);
		expect(isValidPath($private)).to.equal(true);
	});

	it("should have a valid path for Public Users Directory", () => {
		const $path:string = pathToPublicUsersDirectory();
		expect(isValidPath($path)).to.equal(true);		
	});

	it("should have a valid path for Private Users Directory", () => {
		const $path:string = pathToPrivateUsersDirectory();
		expect(isValidPath($path)).to.equal(true);
	});

	/****
	 * Environmental Definition files
	 */
	describe("Environment", () => {

		it("should have a definition file for dev environment", async () => {			
			let exists:boolean  = await readDevConfiguration();		
			expect(exists).to.equal(true);
		});

		it("should have a definition file for prod environment", async () => {			
			let exists:boolean  = await readProdConfiguration();		
			expect(exists).to.equal(true);
		});	

	});

	/***
	 * Directories
	 */
	describe("Directories Utilities", () => {

		let $dirName:string;
		let $pathToTestDir:string;
		let $fileName:string;
		let $jsonDir:string;
		let $pathToJsonFile:string;
		let $json:any;

		before( () => {

			// pick a random directory name and construct path to test directory
			$dirName = word().replace(/\s+/g, '_');					
			$pathToTestDir = path.join(rootPath, $dirName);		

			/****
			 * JSON Schema for Dataware house simulation
			 */
			$fileName = `${word().replace(/\s+/g, '_')}.json`;	
			$jsonDir = word().replace(/\s+/g, '_');	
			$pathToJsonFile =  path.join(rootPath, $jsonDir, $fileName);
			$json =  {
				"user": {
					"givenName": "John",
					"middleName": "Peewee",
					"familyName": "Doe",
					"email": "johndoe@example.org"
				}
			};						
		});

		it("should have a function that can retrieve metadata for any application file or directory", async () => {
			const $testFile:string = path.join(rootPath, 'src', 'server.ts');		
			const stats:any = await fileStatistics($testFile);		
			expect(stats).to.have.property('size');
		});	

		it("should have a function that creates directories or files", async() => {

			const result:boolean = await createDirectory($dirName);
			const stats:any = await fileStatistics($pathToTestDir);		
			expect(result).to.equal(true);
			expect(stats).to.have.property('size');

		});

		it("should have a function that removes directories or files", async() => {
			
			let err:any;			
			
			try { await removeDirectory($pathToTestDir); }
			catch(e) {err = e;}
			finally { expect(err).to.equal(undefined); }
		});

		it("should have a function that writes JSON to file", async() => {

			let err:any;
			try { await writeJSON( $pathToJsonFile, $json ); }
			catch(e) { err = e;}
			finally { expect(err).to.equal(undefined); }

		});

		/***
		 * Cleasn up after making messy stuff
		 */
		after( async () => {
			await removeDirectory($pathToJsonFile);
			await removeDirectory($jsonDir);
		});
		
	});

	/****
	 * Certificates
	 * only tested if Express Server Node is set to HTTPS
	 */
	describe("SSL Certificates", () => {

		it("should have a function that retrieves a certificate sync during bootstrap process", () => {

			if(EXPRESS_SERVER_MODE === "https") {
				let privateKey:Buffer = getCertificate(PATH_TO_DEV_CERTIFICATE);
				expect(privateKey.toString()).to.be.a('string').and.to.exist;
			}
		});

		it("should have private certificate in development mode", () => {
			if(EXPRESS_SERVER_MODE === "https") {
				let key:Buffer = getCertificate(PATH_TO_DEV_CERTIFICATE);
				expect(key.toString()).to.be.a('string').and.to.exist;
			}
		});		
	});

	/****
	 * Web Token Encryption
	 */
	describe("Web Token Encryption", () => {

		it("should have a private key for Web Token Encryption", () => {
			const TOKEN_ENCRYPTION_KEY:Buffer = readPrivateKeyForTokenAuthentication();
			expect(TOKEN_ENCRYPTION_KEY).to.be.instanceOf(Buffer);
		});
	});

});

