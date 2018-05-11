export { ServerOptions } from './options.interface';
export { ProcessEnv } from './processenv.interface';
export { IGoogleUser } from './user.google.interface';
export { MReadOnlyRespositoryBase, RepositoryBase } from './mongoose.interface';
export { IError } from "./error.interface";
export { IListOptions } from './mlab.listquery.interface';
export { IUpdateOptions } from './mlab.update.interface';
export { IConnection, IDatabasePriority } from "./db.interface";
export { ILoginTracker } from "./login.tracker.interface";

/***
 * IPerson interfaces
 */
export { IPerson } from "./person.interface";
export { ISystemUser } from "./systemuser.interface";
export { IUser } from "./user.interface";
export { IClient} from "./client.interface";
export { ICustomer} from "./customer.interface";
export { IPaymentMethod } from "./payment.method.interface";
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

// user type guards
export {	
	isOfPersonType,
	isOfUserType,
	isOfClientType,
	isOfCustomerType	
} from "./type.guards";

export {
	IRawThumbnail
} from "./rawthumbnail.image.interface";

export {
	IEncryption
} from "./encryption.interface";
