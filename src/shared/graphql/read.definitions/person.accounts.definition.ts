/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,           
    GraphQLString 
} from 'graphql';

import { ITypeDefinition } from "../interfaces";

export const accountsDefinition:ITypeDefinition = {

	filter: {
		"accounts._id": 1,
    	"accounts.googleID": 1,
    	"accounts.facebookID": 1,
    	"accounts.localID": 1
	},
	
	format: (obj:any) => {
		return {        
        	id: obj.accounts._id,
        	googleID: obj.accounts.googleID,
        	facebookID: obj.accounts.facebookID,
        	localID: obj.accounts.localID
    	};	
	},
	
	type: new GraphQLObjectType({
	    name: "UserAccountsType",
	    description: "User Accounts Model: provides information on accounts user uses to log on. Default Providers are Google, Facebook and Local.",
	    fields: {
	        id:         { type: GraphQLID },
	        googleID:   { type: GraphQLString},
	        facebookID: { type: GraphQLString},
	        localID:    { type: GraphQLString}
	    }
	})
}