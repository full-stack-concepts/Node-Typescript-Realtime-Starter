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
    customerDefinition,
    CounterType,
    NewUserType,
    DeleteUserType
} from "./person.types";

import {
    PersonReadResolvers,
    PersonMutationResolvers
} from "../resolvers";



/***
 *
 */
const query = {  


    customersAll: {
        type: new GraphQLList(customerDefinition.type),
        resolve: () => PersonReadResolvers.findAll('customer')
    },

    customersSelection: {
        type: new GraphQLList(customerDefinition.type),
        args: { 
            skip: { type: GraphQLInt, description: 'Method on a cursor to control where MongoDB begins returning results. This approach may be useful in implementing paginated results.' },      
            limit:  { type: GraphQLInt, description: 'Method on a cursor to specify the maximum number of documents the cursor will return. limit() is analogous to the LIMIT statement in a SQL database.'} 
        },
        resolve: (root:any, args:any) => PersonReadResolvers.getRange(root, args, 'customer')  
    },    

    customersCount: {
        type: CounterType,
        args: { },      
        resolve: () => PersonReadResolvers.count('client')
    }, 

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

/***
 *
 */
const mutation = {

    CreateNewCustomer: {
        type: NewUserType,
        args: {
            firstName: { type: new GraphQLNonNull(GraphQLString) },
            middleName:  { type: GraphQLString },
            lastName: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            password: {type: new GraphQLNonNull(GraphQLString) },
            confirmPassword: { type: GraphQLString }
        },
        resolve: (root:any, args:any, context:any) => PersonMutationResolvers.addPerson(root, args, context, 'customer')         
    },

    DeleteCustomer: {
        type: DeleteUserType,
        args: {
            email: { type: GraphQLString },
            url:  { type: GraphQLString },
            identifier:  { type: GraphQLString }
        },
        resolve: (root:any, args:any, context:any) => 
            PersonMutationResolvers.deletePerson(root, args, context, 'customer') 
    }


}

export const CustomerSchema = {
    query,  
    mutation,
    types: [        
        customerDefinition.type
    ]
};

