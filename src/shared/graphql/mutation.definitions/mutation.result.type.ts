
import {
    GraphQLID,
    GraphQLObjectType,  
    GraphQLList, 
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean  
} from 'graphql';

export const FormErrorType = new GraphQLObjectType({
    name: "FormErrorType", 
    fields: {
        field: { type:GraphQLString},
        message:  { type:GraphQLString},
        requiredType:  { type:GraphQLString}, 
        type: { type:GraphQLString}
    }
});

/***
 *
 */
export const MutationResponseType = new GraphQLObjectType({
	name: "MutationResponseType",
	description: "Return Mutation result",
	fields: () => ({

    	// response fields
		error:  { type: GraphQLBoolean, description: "Error Status"},
		status:  { type: GraphQLBoolean, description: "Mutation Status"},
		message: { type:GraphQLString, description: "Error String "},
		errorID:  { type:GraphQLInt, description: "Event Error ID"},		
        formData:  { type:new GraphQLList(FormErrorType), description: "From Error Data"}
	})
});
