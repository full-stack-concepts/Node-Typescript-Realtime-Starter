export { ServerOptions } from './options.interface';
export { ProcessEnv } from './processenv.interface';
export { IGoogleUser } from './user.google.interface';
export { IError } from "./error.interface";
export { IListOptions } from './mlab.listquery.interface';
export { IUpdateOptions } from './mlab.update.interface';
export { IConnection, IDatabasePriority } from "./db.interface";
export { ILoginTracker } from "./login.tracker.interface";

/***
 * IPerson: Generic
 */
export { 
	IPersonSecurity,
	IPersonAccounts,
	IPersonConfiguration,
	IPerson 
} from "./person.interface";
// user type guards
export {	
	isOfPersonType,
	isOfUserType,
	isOfClientType,
	isOfCustomerType	
} from "./type.guards";

/***
 * IPerson: System User
 */
export { ISystemUser } from "./systemuser.interface";

/***
 * IPerson interfaces: User
 */
export { IUser } from "./user.interface";
export { IUserApplication } from "./user/user.application.interface";
export { ILoginRequest } from "./user/user.login.interface";
export { ILogout} from "./user/user.logout.interface";
export { IFindUser } from "./user/user.find.interface";
export { IDeleteUser } from "./user/user.delete.interface";
export { UserTokenObject } from "./user/user.tokenobject.interface";
export { IUserDefinitions} from "./user/user.definitions.interface";
export { IChangePassword} from "./user/user.changepassword.interface";

export {
	IUserJob,
	IUserAddress,
	IUserCommunication,
	IUserSocial,
	IUserImage,
	IUserAccessControl,
	IUserShortList,
	IUserStatus,
	IUserItemErrors,
	IUserDevice,
	IUserCompany
} from "./user.item.interface";

/***
 * IPerson: Client
 */
export { IClient} from "./client.interface";
export { IClientApplication } from "./client/client.application.interface";

/***
 * IPerson: Customer
 */
export { ICustomer} from "./customer.interface";
export { ICustomerApplication } from "./customer/customer.application.interface";


export { IPaymentMethod } from "./payment.method.interface";

export {
	IRawThumbnail
} from "./rawthumbnail.image.interface";

export {
	IEncryption
} from "./encryption.interface";

/***
 * Tests
 */
export { IResponse } from "./tests/response.interface";

export {
	IMetadataObj
} from "./index.signature";

/***
 * Mailer
 */

export { 
	IEmailMessage,
	IEmailAttachment,
	IEmailSMTPOptions,
	IEmailSMTPDefaults,
	IEmailAuthentication,
	ISystemTemplateData
} from "./mailer";

/***
 * App Communication
 */
export { IAppMessage} from "./apps/app.message.interface";
export { IMessageID } from "./apps/app.requestid.interface";
