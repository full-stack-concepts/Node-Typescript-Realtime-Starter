
export { serviceManager} from "./services.manager";

/***
 * Generic Services
 */
export { proxyService } from "./state/proxy.service";

/***
 * User Services
 */
export { testForSystemUser, createSystemUser, systemUserService, SystemUserService } from "./user/system.user.service";
export { UserOperations } from "./user/user.ops.service";
export { userService, UserService } from "./user/user.service";
export { googleUserService, GoogleUserService } from "./user/user.google.service";
export { facebookUserService, FaceBookUserService} from "./user/user.facebook.service";
export { clientService, ClientService } from "./user/client.service";
export { customerService, CustomerService } from "./user/customer.service";
export { WebToken } from "./user/token.service";

/***
 * Data Breeder Services
 */
export { DataBreeder, dataBreeder } from "./data/data.service";
export { dataUtilitiesService } from "./data/data.utilities.service";
export { DataStore } from "./data/data.store.service";
export { UserTypes } from "./data/data.usertypes.service";

/***
 * Database Services
 */
export { DBAdminService, configureDatabases } from "./db/db.admin.service";
export { dbModelService} from "./db/db.model.service";

export { connectToProductDatabase, DBProductService } from "./db/db.product.service";
export { connectToUserDatabase, DBUserService } from "./db/db.user.service";