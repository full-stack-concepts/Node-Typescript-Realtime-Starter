import { expect } from "chai";
import path from "path";
import Validator from "validator";
import isValidPath from "is-valid-path";
const v:Validator = Validator;

import {
	PUBLIC_ROOT_DIR,
	PRIVATE_ROOT_DIR
} from "../../../src/util/secrets";

import {
	getCertificate,
	readPrivateKeyForTokenAuthentication,
	readDevConfiguration,
	readProdConfiguration,
	getPathToDataStore,
	createPrivateDataStore,	
	createPublicUserDirectory,
	createPrivateUserDirectory,
	createUserSubDirectories,
	pathToDefaultUserThumbnail,
	pathToUserThumbnail,
	storeUserImage,
	publicDirectoryManager,
	privateDirectoryManager,
	getRootPath,
	createDirectory,
	removeDirectory,
	fileStatistics
} from "../../../src/util";

const rootPath:string = getRootPath();

describe("Infrastructure", () => {	

	it("should provide application root directory", () => {
		const root:string = getRootPath();
		console.log(root);
		expect(root).to.be.a('string');
		expect(isValidPath(root)).to.equal(true);
	});

	it("should handle valid public dir paths", () => {
		const $public:string = path.join(rootPath, PUBLIC_ROOT_DIR);
		expect(isValidPath($public)).to.equal(true);
	});

	it("should handle valid private dir paths", () => {
		const $private:string = path.join(rootPath, PRIVATE_ROOT_DIR);
	});

	/***
	 * Directories
	 */
	describe("Directories Utilities", () => {

		it("should have a function that can retrieve metadata for any application file", async () => {
			const $testFile:string = path.join(rootPath, 'src', 'server.ts');		
			const stats:any = await fileStatistics($testFile);		
			expect(stats).to.have.property('size');
		});	
		
	});


});

