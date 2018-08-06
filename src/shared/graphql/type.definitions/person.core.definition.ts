/***
 * Import Default Graphql Types
 */
import {
    GraphQLObjectType,
    GraphQLID,           
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt
} from 'graphql';

import { ITypeDefinition } from "../interfaces";


export const coreDefinition:ITypeDefinition = {

	filter: {
	   "core._id": 1,
	    "core.role": 1,
	    "core.email": 1,
	    "core.url": 1,
	    "core.identifier":1,
	    "core.archived": 1,
	    "core.userName": 1
	},

	format: (obj:any) => {	
		return {	      
	      	id:  		obj.core.id,           
        	userName:	obj.core.userName,
        	archived:	obj.core.archived,
        	url:		obj.core.url,
        	email:		obj.core.email,
        	role:		obj.core.role,
        	identifier: obj.core.identifier
	    };
    },

    type:  new GraphQLObjectType({
    	name: "UserCoreDetailsType",
    	description: "Core Details User/Client/Customer",    
    	fields: {
        	id:             { type: GraphQLID },
        	userName:       { type: GraphQLString},
        	archived:       { type: GraphQLBoolean},
        	url:            { type: GraphQLString},
	        email:          { type: GraphQLString},
	        role:           { type: GraphQLInt},
	        identifier:     { type: GraphQLString}
    	}
    })
}