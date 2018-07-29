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
    clientDefinition,
    CounterType,
    NewUserType
} from "./person.types";

import {
    PersonReadResolvers,
    PersonMutationResolvers
} from "../resolvers";

/***
 *
 */
const query = {  

    clientsAll: {
        type: new GraphQLList(clientDefinition.type),
        resolve: () => PersonReadResolvers.findAll('client')
    },

    clientsSelection: {
        type: new GraphQLList(clientDefinition.type),
        args: { 
            skip: { type: GraphQLInt, description: 'Method on a cursor to control where MongoDB begins returning results. This approach may be useful in implementing paginated results.' },      
            limit:  { type: GraphQLInt, description: 'Method on a cursor to specify the maximum number of documents the cursor will return. limit() is analogous to the LIMIT statement in a SQL database.'} 
        },
        resolve: (root:any, args:any) => PersonReadResolvers.getRange(root, args, 'user')  
    },   

    clientsCount: {
        type: CounterType,
        args: { },      
        resolve: () => PersonReadResolvers.count('client')
    }, 

    clientFindByMail: {
        type: clientDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },      
        resolve: (root:any, args:any) => PersonReadResolvers.findByMail(root, args, 'client')       
    },

    clientFindById: {
        type: clientDefinition.type,
        args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findById(root, args, 'client')               
    },

    clientFindByURL: {
        type: clientDefinition.type,
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

/***
 *
 */
const mutation = {
    CreateNewClient: {
        type: NewUserType,
        args: {
            firstName: { type: new GraphQLNonNull(GraphQLString) },
            middleName:  { type: GraphQLString },
            lastName: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            password: {type: new GraphQLNonNull(GraphQLString) },
            confirmPassword: { type: GraphQLString }
        },
        resolve: (root:any, args:any, context:any) => PersonMutationResolvers.addPerson(root, args, context, 'client')         }
}

export const ClientSchema = {
    query,  
    mutation,
    types: [       
        clientDefinition.type
    ]
};
