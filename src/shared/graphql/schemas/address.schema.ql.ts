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
} from "../read.definitions";

import {    
    MutationResponseType
} from "../mutation.definitions";


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

     ChangeAddress: {
        type: MutationResponseType,
        args: {
            userID:  { type: GraphQLID }, 
            userEmail: { type:  GraphQLString},
            addressID: { type: GraphQLString, description: "Address Identifier: Mongoose ObjectId string"},     
            street: { type: new GraphQLNonNull(GraphQLString) },
            houseNumber:  { type: new GraphQLNonNull(GraphQLInt) },
            suffix:  { type: GraphQLString },
            areacode:  { type: new GraphQLNonNull(GraphQLString) },
            city:  { type: new GraphQLNonNull(GraphQLString) },
            county:  { type: GraphQLString },
            country:  { type: GraphQLString },
            countryCode: { type: GraphQLString }
        },
        resolve: (root:any, args:any, context:any) => AddressMutationResolvers.changeAddress(root, args, context)
    }

}

export const AddressSchema = {
    query,  
    mutation,
    types: [
        addressDefinition.type      
    ]
};




