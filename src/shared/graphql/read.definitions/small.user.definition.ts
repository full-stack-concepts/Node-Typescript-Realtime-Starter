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
	DisplayNamesType, PersonaliaType
} from "../read.definitions";

import { ITypeDefinition } from "../interfaces";


/****
 *
 */
const smallUserFieldObject = {
	id:             { type: GraphQLID },
    displayName:    { type: GraphQLString, description: 'Display Name' },
    role:           { type: GraphQLInt, description: 'Assigned Role' },
    email:          { type: GraphQLString, description: 'Email Address' },     
    url:            { type: GraphQLString, description: 'Public Identifier' },
    identifier:     { type: GraphQLString, description: 'Infrastructure Identifier' },   
    displayNames:	{ type: DisplayNamesType },
    personalia:     { type: PersonaliaType}
}



export const smallUserDefinition:ITypeDefinition = {

	filter: {},
	
	format: (obj:any) => {
		return {
	        id: obj._id,                                      
	        role: obj.core.role,
	        email: obj.core.email,
	        url: obj.core.url,
	        identifier: obj.core.identifier,
	        personalia: obj.profile.personalia,
	        displayName: obj.profile.displayNames
	    };    
	},
	
	type:  new GraphQLObjectType({
   		name: 'SmallUserType',
    	description: 'Return an array of users with core identifiers such as id, email and url ',
    	fields: () => (smallUserFieldObject)
	})
};