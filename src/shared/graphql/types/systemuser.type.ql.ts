import {
    GraphQLID,
    GraphQLEnumType,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean 
} from 'graphql';

/***
 * DB Model
 */
import { systemUserReadModel } from "../../models";

/****
 * Type Definitions
 */
import {
    systemUserDefinition
} from "./person.types";

import {
    PersonReadResolvers,
    PersonWriteResolvers
} from "../resolvers";

/***
 *
 */
const query = {  

    systemUserFindByMail: {
        type: systemUserDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },      
        resolve: (root:any, args:any) => PersonReadResolvers.findByMail(root, args, 'systemuser')       
    },

    systemUserFindById: {
        type: systemUserDefinition.type,
        args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findById(root, args, 'systemuser')               
    },

    systemUserFindByURL: {
        type: systemUserDefinition.type,
        args:  { url: { type: GraphQLString, description: 'find by URL' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findByURL(root, args, 'systemuser')             
    },    
}

export const SystemUserSchema = {
    query,  
    types: [       
        systemUserDefinition.type
    ]
};
