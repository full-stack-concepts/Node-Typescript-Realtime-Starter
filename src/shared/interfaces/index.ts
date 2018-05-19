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
export { IPerson } from "./person.interface";
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
export { IUserApplication } from "./user/user.application.interface";
export { ILoginRequest } from "./user/user.login.interface";
export { IUser } from "./user.interface";
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
