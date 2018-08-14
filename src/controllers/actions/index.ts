/****
 * Pre-defined User Actions
 */
export { 

	TEST_FOR_ACCOUNT_BY_ID,
	TEST_FOR_ACCOUNT_BY_EMAIL,
	FIND_USER_SUB_DOCUMENT,

	LOGIN_SYSTEM_USER,
	REGISTER_NEW_USER,
	LOGIN_USER,
	FIND_USER,
	DELETE_USER,
	UPDATE_USER,
	CHANGE_PASSWORD_USER,
	CREATE_WEBTOKEN,
	
	REGISTER_NEW_CLIENT,
	LOGIN_CLIENT,
	FIND_CLIENT,
	CHANGE_PASSWORD_CLIENT,
	DELETE_CLIENT,
	
	REGISTER_NEW_CUSTOMER,
	LOGIN_CUSTOMER,
	FIND_CUSTOMER,
	DELETE_CUSTOMER,
	CHANGE_PASSWORD_CUSTOMER,

} from "./user.actions";

/****
 * Pre-defined Address Actions
 */
export {
	VERIFY_ADDRESS
} from "./address.actions";


/*****
 * Pre-defined Data (Faker) Actions
 */
export {
	DATA_GENERATE,
	DATA_CREATE_USER_TYPE,
	DATA_FORMAT_USER_SUBTYPE,
	DATA_CREATE_SUPER_ADDMIN,
	DATA_CREATE_ADMIN,
	DATA_CREATE_POWER_USER,
	DATA_CREATE_AUTHOR,
	DATA_CREATE_USER,
	DATA_CREATE_CLIENT,
	DATA_CREATE_CUSTOMER	
} from "./data.actions";

/****
 * Pre-defined Local Storage Actions
 */
export {
	LOCAL_STORAGE_ADD
} from "./data.actions";

/****
 * Pre-defined Mail Actions
 */
export {
	SEND_SYSTEM_EMAIL
} from "./mail.actions";


