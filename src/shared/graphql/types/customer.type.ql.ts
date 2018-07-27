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
    customerDefinition
} from "./person.types";

import {
    PersonReadResolvers,
    PersonWriteResolvers
} from "../resolvers";



/***
 *
 */
const query = {  

   customerFindByMail: {
        type: customerDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },      
        resolve: (root:any, args:any) => PersonReadResolvers.findByMail(root, args, 'customer')       
    },

    customerFindById: {
        type: customerDefinition.type,
        args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findById(root, args, 'customer')               
    },

    customerFindByURL: {
        type: customerDefinition.type,
        args:  { url: { type: GraphQLString, description: 'find by URL' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findByURL(root, args, 'customer')             
    },    

    customerCoreDetails: {
        type: coreDefinition.type,
        args: { id: { type: GraphQLID, description: 'find Customer Core Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.coreDetails(root, args, 'customer')     
    },

    customerProfile: {
        type: profileDefinition.type,
        args: { id: { type: GraphQLID, description: 'find Customer Profile Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.profile(root, args, 'customer')            
    },

    customerPassword: {
        type: passwordDefinition.type,
        args: { id: { type: GraphQLID, description: 'find Customer Password Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.password(root, args, 'customer')                
    },

    customerAccounts: {
        type: accountsDefinition.type,
        args:  { id: { type: GraphQLID, description: 'find customer logon accounts: Google, Facebook or LocalID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.accounts(root, args, 'customer')           
    },

    customerSecurity: {
        type: securityDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve Customer Security Settings.' } },
        resolve: (root:any, args:any) => PersonReadResolvers.security(root, args, 'customer')           
    },

    customerConfiguration: {
        type: configurationDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve Customer Configuration Settings.' } },
        resolve: (root:any, args:any) => PersonReadResolvers.configuration(root, args, 'customer')                 
    },

    customerDevices: {
        type: devicesDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve Customer owned devices' } },
        resolve: (root:any, args:any) => PersonReadResolvers.devices(root, args, 'customer')          
    }
}

export const CustomerSchema = {
    query,  
    types: [        
        customerDefinition.type
    ]
};

