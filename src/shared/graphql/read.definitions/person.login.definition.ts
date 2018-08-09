/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,         
    GraphQLString,
    GraphQLInt,
    GraphQLList 
} from 'graphql';

import { ITypeDefinition } from "../interfaces";


/***
 *
 */
const SingleLoginType = new GraphQLObjectType({
    name: "SingleLoginType",    
    fields: {    
        timestamp: { type: GraphQLInt},
        date: { type: GraphQLString},
        formattedDate: { type: GraphQLString},
        formattedTime: { type: GraphQLString}
    }
});

export const loginDefinition:ITypeDefinition = {
	
	filter: {
		"logins._id": 1,
    	"logins": 1 
	},
	
	format: (obj:any) => {
		return {        
        	id: obj.logins._id,
        	logins: obj.logins.logins
    	};
	},
	
	type: new GraphQLObjectType({
	    name: "UserLoginsType",
	    description: "User Login Model. You can use this query to trace a users login activity. Returned result is an array of objects.",
	    fields: {    
	        id:         { type: GraphQLID },
	        logins:     { type: new GraphQLList(SingleLoginType), description: "Array of objects: each object represents a successful logon." }    
	    }
	})
}