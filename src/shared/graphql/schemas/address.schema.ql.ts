import {
    GraphQLID,
    GraphQLEnumType,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt    

} from 'graphql';

/****
 * Type Definitions
 */
import {        
    CounterType
} from "./person.types";

import {
    addressDefinition
} from "../type.definitions";


import {
    AddressReadResolvers,
    AddressMutationResolvers
} from "../resolvers";

/***
 *
 */
const query = {  

	 findAllAddresses: {
        type: new GraphQLList(addressDefinition.type),
        resolve: () => AddressReadResolvers.findAll()
    },

    selectAddresses: {
        type: new GraphQLList(addressDefinition.type),
        args: { 
            skip: { type: GraphQLInt, description: 'Method on a cursor to control where MongoDB begins returning results. This approach may be useful in implementing paginated results.' },      
            limit:  { type: GraphQLInt, description: 'Method on a cursor to specify the maximum number of documents the cursor will return. limit() is analogous to the LIMIT statement in a SQL database.'} 
        },
        resolve: (root:any, args:any) => AddressReadResolvers.getRange(root, args)  
    },   

    countAddresses: {
        type: CounterType,              
        resolve: () => AddressReadResolvers.count()
    },

      getAddress: {
        type: addressDefinition.type,
        args: { id: { type: GraphQLID } },
        resolve: (root:any, args:any) => AddressReadResolvers.findById(root, args)
    },

}

/***
 *
 */
const mutation = {

}

export const AddressSchema = {
    query,  
    mutation,
    types: [
        addressDefinition.type      
    ]
};






