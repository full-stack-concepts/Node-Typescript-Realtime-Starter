import { 
	ENVIRONMENT, 
	EXPRESS_SERVER_MODE, 
	SITE_URL, 
	PORT,
	DEFAULT_TEST_PASSWORD
} from "../../../src/util/secrets";

// utilities
import {
	firstName, 
	lastName, 
	constructEmail 
} from "../../../src/util";

import { 
	IUserApplication, 
	IUser, 
	ILoginRequest, 
	ILogout, 
	UserTokenObject, 
	IFindUser, 
	IDeleteUser,
	IUserDefinitions
} from "../../../src/shared/interfaces";


export function userDefinitions():IUserDefinitions {

	/***
	 * Constants used in multipe route tests
	 */
	const _firstName:string = firstName();
	const _lastName:string = lastName();
	const _email:string = constructEmail(_firstName, _lastName).toLowerCase();

	/***
	 * Define a password that matches your defined policy 
	 * in your environmental file (.env or .prod)
	 * @minlength, @maxlength etc
	 */
	const PASSWORD:string = DEFAULT_TEST_PASSWORD;

	/***
	 * User Registration
	 */
	const application:IUserApplication = {
		firstName: _firstName,
		lastName: _lastName,
		email: _email,
		password: PASSWORD,
		confirmPassword: PASSWORD
	};

	/***
	 * User Login
	 */
	const login:ILoginRequest = {
		email: _email,
		password: PASSWORD
	};

	/***
	 * User Logout
	 */
	const logout:ILogout = {
		email: _email
	};

	/***
	 * Find User Object
	 */
	const find:IFindUser = {
		email:_email
	};

	/***
	 * Delete User Object
	 */
	const deleteObj:IDeleteUser = {
		email: _email
	};

	/***
	 * Return object
	 */
	return {
		PASSWORD,
		application,
		login,
		logout,
		find,
		deleteObj
	};
}











