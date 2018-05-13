
export { serviceManager} from "./services.manager";

/***
 * Generic Services
 */
export { proxyService } from "./state/proxy.service";

/***
 * User Services
 */
export { testForSystemUser, SystemUserService } from "./user/system.user.service";
export { UserOperations } from "./user/user.ops.service";
export { UserService, u } from "./user/user.service";
export { WebToken } from "./user/token.service";

/***
 * Data Breeder Services
 */
export { DataBreeder, populateDatabase } from "./data/data.service";
export { DataStore } from "./data/data.store.service";
export { UserTypes } from "./data/data.usertypes.service";

/***
 * Database Services
 */
export { DBAdminService, configureDatabases } from "./db/db.admin.service";
export { dbModelService} from "./db/db.model.service";

export { connectToProductDatabase, DBProductService } from "./db/db.product.service";
export { connectToUserDatabase, DBUserService } from "./db/db.user.service";