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
import { clientReadModel } from "../../models";

/****
 * Type Definitions
 */
import {
    coreDefinition,
    profileDefinition,
    passwordDefinition,
    loginDefinition,
    accountsDefinition,
    securityDefinition,
    configurationDefinition,
    devicesDefinition,
    userDefinition,
    clientDefinition

} from "./person.types";

import {
    PersonReadResolvers,
    PersonWriteResolvers
} from "../resolvers";

/***
 *
 */
const query = {  

    clientFindByMail: {
        type: userDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },      
        resolve: (root:any, args:any) => PersonReadResolvers.findByMail(root, args, 'client')       
    },

    clientFindById: {
        type: userDefinition.type,
        args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findById(root, args, 'client')               
    },

    clientFindByURL: {
        type: userDefinition.type,
        args:  { url: { type: GraphQLString, description: 'find by URL' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findByURL(root, args, 'client')             
    },    

    clientCoreDetails: {
        type: coreDefinition.type,
        args: { id: { type: GraphQLID, description: 'find Client Core Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.coreDetails(root, args, 'client')     
    },

    clientProfile: {
        type: profileDefinition.type,
        args: { id: { type: GraphQLID, description: 'find Client Profile Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.profile(root, args, 'client')            
    },

    clientPassword: {
        type: passwordDefinition.type,
        args: { id: { type: GraphQLID, description: 'find User Password Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.password(root, args, 'client')                
    },

    clientAccounts: {
        type: accountsDefinition.type,
        args:  { id: { type: GraphQLID, description: 'find user logon accounts: Google, Facebook or LocalID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.accounts(root, args, 'client')           
    },

    clientSecurity: {
        type: securityDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User Security Settings.' } },
        resolve: (root:any, args:any) => PersonReadResolvers.security(root, args, 'client')           
    },

    clientConfiguration: {
        type: configurationDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User Configuration Settings.' } },
        resolve: (root:any, args:any) => PersonReadResolvers.configuration(root, args, 'client')                 
    },

    clientDevices: {
        type: devicesDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User owned devices' } },
        resolve: (root:any, args:any) => PersonReadResolvers.devices(root, args, 'client')          
    }

}

export const ClientSchema = {
    query,  
    types: [       
        userDefinition.type
    ]
};
