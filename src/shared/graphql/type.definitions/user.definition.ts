
/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,         
    GraphQLString,
    GraphQLInt   
} from 'graphql';

import {
	PersonaliaType,
	AddressType
} from "../type.definitions";

import { ITypeDefinition } from "../interfaces";
import { IUserAddress} from "../../interfaces";

/****
 *
 */
const defaultUserFields = {
    id:             		{ type: GraphQLID },
    displayName:    		{ type: GraphQLString, description: 'Display Name' },
    role:           		{ type: GraphQLInt, description: 'Assigned Role' },
    email:          		{ type: GraphQLString, description: 'Email Address' },     
    url:            		{ type: GraphQLString, description: 'Public Identifier' },
    identifier:     		{ type: GraphQLString, description: 'Infrastructure Identifier' },     
    personalia:     		{ type: PersonaliaType},
    coreSectionID:      	{ type: GraphQLID },
    passwordSectionID:		{ type: GraphQLID },
    loginsSectionID:		{ type: GraphQLID },
    accountsSectionID:		{ type: GraphQLID },
    securitySectionID:		{ type: GraphQLID },
    configurationSectionID:	{ type: GraphQLID },
    profileSectionID:   	{ type: GraphQLID },
   	devicesSectionID:		{ type: GraphQLID },
   	address: 				{ type: AddressType}
};

export const userDefinition:ITypeDefinition = {

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
	        // loginsSectionID:  obj.logins.id,
    		accountsSectionID:	obj.accounts.id,
    		securitySectionID:	obj.security.id,
    		configurationSectionID:	obj.configuration.id,
	        profileSectionID: obj.profile.id,
	        devicesSectionID: obj.devices.id,
	        address:address
	    };    
	},
	
	type:  new GraphQLObjectType({
   		name: 'UserType',
    	description: 'User Read Query',
    	fields: () => (defaultUserFields)
	})
};