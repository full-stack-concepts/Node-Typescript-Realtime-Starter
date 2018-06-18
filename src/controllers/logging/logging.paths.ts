const appRoot = require("app-root-path");
import {ILogPaths} from "./paths.interface";

/***
 * Set log paths
 */
const rootPath:string = appRoot.path.toString();

export const logPaths:ILogPaths = {

	$exceptions: 	`${rootPath}/logs/exceptions.log`,
	$application: 	`${rootPath}/logs/application.log`,
	$access:  		`${rootPath}/logs/access.log`,
	$errors:		`${rootPath}/logs/error.log`,
	$warnings:		`${rootPath}/logs/warnings.log`,
	$info:			`${rootPath}/logs/info.log`,
	$tests:			`${rootPath}/logs/tests.log`
};

