/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,         
    GraphQLInt,   
    GraphQLBoolean 
} from 'graphql';

import { ITypeDefinition } from "../interfaces";


export const securityDefinition:ITypeDefinition = {

	filter: {
		"security._id": 1,
    	"security.isAccountVerified": 1,
    	"security.isTemporaryPassword": 1,
    	"security.isPasswordEncrypted": 1,
    	"security.accountType": 1
	},
	
	format: (obj:any) => {
		return {        
	        id: obj.security._id,
	        isAccountVerified: obj.security.isAccountVerified,
	        isTemporaryPassword: obj.security.isTemporaryPassword,
	        isPasswordEncrypted: obj.security.isPasswordEncrypted,
	        accountType: obj.security.accountType
	    };
	},
	
	type: new GraphQLObjectType({
    name: "UserSecurityType",
	    description: "User Security Model: provides information on security.",
	    fields: {
	        id:                     { type: GraphQLID },
	        isAccountVerified:      { type: GraphQLBoolean},
	        isTemporaryPassword:    { type: GraphQLBoolean},
	        isPasswordEncrypted:    { type: GraphQLBoolean},
	        accountType:            { type: GraphQLInt}
	    }
	})
}