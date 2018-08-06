/***
 * Import Default Graphql Types
 */
import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt} from 'graphql';

/***
 * Person sub type definitions
 */
import { DisplayNamesType, PersonaliaType, AddressType } from "../type.definitions";

/***
 * Type interfaces
 */
import { ITypeDefinition } from "../interfaces";
import { IUserAddress} from "../../interfaces";


/****
 *
 */
const defaultClientFields = {
    id:             		{ type: GraphQLID },
    displayName:    		{ type: GraphQLString, description: 'Display Name' },
    role:           		{ type: GraphQLInt, description: 'Assigned Role' },
    email:          		{ type: GraphQLString, description: 'Email Address' },     
    url:            		{ type: GraphQLString, description: 'Public Identifier' },
    identifier:     		{ type: GraphQLString, description: 'Infrastructure Identifier' },     
    personalia:     		{ type: PersonaliaType},
    coreSectionID:      	{ type: GraphQLID },
    passwordSectionID:		{ type: GraphQLID },   
    accountsSectionID:		{ type: GraphQLID },
    securitySectionID:		{ type: GraphQLID },
    configurationSectionID:	{ type: GraphQLID },
    profileSectionID:   	{ type: GraphQLID },
   	devicesSectionID:		{ type: GraphQLID },
 	address: 				{ type: AddressType}
};


export const clientDefinition:ITypeDefinition = {

	filter: {},
	
	format: (obj:any, address:IUserAddress) => {
		
		return {
	        id: obj._id,                                      
	        role: obj.core.role,
	        email: obj.core.email,
	        url: obj.core.url,
	        identifier: obj.core.identifier,
	        personalia: obj.profile.personalia,
	        displayName: obj.profile.displayNames.fullName,
	        coreSectionID: obj.core.id,
	        passwordSectionID: obj.password.id,	       
    		accountsSectionID:	obj.accounts.id,
    		securitySectionID:	obj.security.id,
    		configurationSectionID:	obj.configuration.id,
	        profileSectionID: obj.profile.id,
	        devicesSectionID: obj.devices.id,
	        address:address
	    };    
	},
	
	type:  new GraphQLObjectType({
   		name: 'clientType',
    	description: 'Returns array of clients with core identifiers such as email, url and role and section identifiers.',
    	fields: () => (defaultClientFields)
	})
};
