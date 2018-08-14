export {
	DisplayNamesType,	
	AddressType,
	SocialType,
	CommunicationType,
	ImagesType,
	LocationType
} from "./person.definitions";

/***
 * Person  subtype definitions
 */
export { 
	profilePersonaliaDefinition,
	profileDisplayNamesDefinition,
	profileSocialDefinition,
	profileCommunicationDefinition
 } from "./profile.sub.definitions";
 
export { passwordDefinition} from "./person.password.definition";
export { loginDefinition} from "./person.login.definition";
export { devicesDefinition } from "./person.devices.definition";
export { securityDefinition } from "./person.security.definition";
export { configurationDefinition } from "./person.configuration.definition";
export { accountsDefinition } from "./person.accounts.definition";
export { coreDefinition } from "./person.core.definition";
export { profileDefinition} from "./person.profile.definition";

/***
 * Person type definitions
 */
export { smallUserDefinition } from "./small.user.definition";
export { userDefinition} from "./user.definition";

export { smallClientDefinition } from "./small.client.definition";
export { clientDefinition} from "./client.definition";

export { smallCustomerDefinition} from "./small.customer.definition";
export { customerDefinition} from "./customer.definition";

export { systemUserDefinition } from "./systemuser.definition";

/***
 * Other Independent Main Definitions
 */
export { addressDefinition } from "./address.definition";

