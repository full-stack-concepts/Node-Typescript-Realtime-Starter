/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,         
    GraphQLString,
    GraphQLInt   
} from 'graphql';

import { ITypeDefinition } from "../interfaces";

/****
 *
 */
const defaultSystemUserFields = {
    id:             		{ type: GraphQLID },
    displayName:    		{ type: GraphQLString, description: 'Display Name' },
    role:           		{ type: GraphQLInt, description: 'Assigned Role' },
    email:          		{ type: GraphQLString, description: 'Email Address' },     
    url:            		{ type: GraphQLString, description: 'Public Identifier' },
    identifier:     		{ type: GraphQLString, description: 'Infrastructure Identifier' }   
};


export const systemUserDefinition:ITypeDefinition = {

	filter: {},
	
	format: (obj:any) => {
		return {
	        id: obj._id,                                      
	        role: obj.core.role,
	        email: obj.core.email,
	        url: obj.core.url,
	        identifier: obj.core.identifier
	       
	    };    
	},
	
	type:  new GraphQLObjectType({
   		name: 'SystemUserType',
    	description: 'Sustem User Read Query',
    	fields: () => (defaultSystemUserFields)
	})
};
