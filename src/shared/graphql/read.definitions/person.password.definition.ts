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

/***
 * Import Dynamic Grpaphql Types (Scalars)
 */
import { DateTimeScalar } from "../scalars/datetime.scalar";
import { BigIntegerScalar} from "../scalars/bigint.scalar";
import { DateScalar } from "../scalars/date.scalar";

import { ITypeDefinition } from "../interfaces";


/***
 *
 */
const PasswordHistoryType = new GraphQLObjectType({
    name: "PasswordHistoryType",    
    fields: {    
        timestamp: { type: BigIntegerScalar},
        hash: { type: GraphQLString},
        method: { type: GraphQLInt},
        date: { type: DateScalar },
        isoDate: { type: DateTimeScalar },
    }
});

export const passwordDefinition:ITypeDefinition = {

	filter: {
		"password._id": 1,
    	"password": 1 
	},

	format: (obj:any) => {
  		return {        
        	id: obj.password._id,        	
        	method: obj.password.method,
        	history: obj.password.history
    	};
	},

	type:  new GraphQLObjectType({
    	name: "UserPasswordType",
    	description: "User Password Model. You can use this query to retrieve user's password encryption method. Encryption method is an integer greater than 0 and smaller than 4.",
    	fields: {    
        	id:         { type: GraphQLID },
        	method:     { type: GraphQLInt, description: "Encryption method for user password"},
        	history: 	{ type: new GraphQLList(PasswordHistoryType)}
    	}
	})
}