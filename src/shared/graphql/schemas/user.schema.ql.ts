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

import { UAController } from "../../../controllers";

/****
 * Type Definitions
 */
import {        
    CounterType,
    NewUserType,
    DeleteUserType,
    ChangePasswordType,
    TestLoginType

} from "./person.types";

import {
    smallUserDefinition,
    userDefinition,
    coreDefinition,
    profileDefinition,
    passwordDefinition,
    loginDefinition,
    devicesDefinition, 
    securityDefinition,
    configurationDefinition,
    accountsDefinition,
} from "../read.definitions";

import {
    PersonReadResolvers,
    PersonMutationResolvers
} from "../resolvers";

/***
 *
 */
const query = {  

    usersAll: {
        type: new GraphQLList(smallUserDefinition.type),
        resolve: () => PersonReadResolvers.findAll('user')
    },

    usersSelection: {
        type: new GraphQLList(smallUserDefinition.type),
        args: { 
            skip: { type: GraphQLInt, description: 'Method on a cursor to control where MongoDB begins returning results. This approach may be useful in implementing paginated results.' },      
            limit:  { type: GraphQLInt, description: 'Method on a cursor to specify the maximum number of documents the cursor will return. limit() is analogous to the LIMIT statement in a SQL database.'} 
        },
        resolve: (root:any, args:any) => PersonReadResolvers.getRange(root, args, 'user')  
    },     

    usersCount: {
        type: CounterType,
        args: { },      
        resolve: () => PersonReadResolvers.count('user')
    },

    userFindByMail: {
        type: userDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },      
        resolve: (root:any, args:any) => PersonReadResolvers.findByMail(root, args, 'user')       
    },
    
    userFindById: {
        type: userDefinition.type,
        args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findById(root, args, 'user')               
    },

    userFindByURL: {
        type: userDefinition.type,
        args:  { url: { type: GraphQLString, description: 'find by URL' } },
        resolve: (root:any, args:any) => PersonReadResolvers.findByURL(root, args, 'user')             
    },

    userCoreDetails: {
        type: coreDefinition.type,
        args: { id: { type: GraphQLID, description: 'find User Core Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.coreDetails(root, args, 'user')     
    },

    userProfile: {
        type: profileDefinition.type,
        args: { id: { type: GraphQLID, description: 'find User Profile Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.profile(root, args, 'user')            
    },

    userPassword: {
        type: passwordDefinition.type,
        args: { id: { type: GraphQLID, description: 'find User Password Object by its ID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.password(root, args, 'user')                
    },

    userLogins: {
        type: loginDefinition.type,
        args:  { id: { type: GraphQLID, description: 'find User Logins by its logins ObjectID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.logins(root, args, 'user')            
    },

    userAccounts: {
        type: accountsDefinition.type,
        args:  { id: { type: GraphQLID, description: 'find user logon accounts: Google, Facebook or LocalID' } },
        resolve: (root:any, args:any) => PersonReadResolvers.accounts(root, args, 'user')           
    },

    userSecurity: {
        type: securityDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User Security Settings.' } },
        resolve: (root:any, args:any) => PersonReadResolvers.security(root, args, 'user')           
    },

    userConfiguration: {
        type: configurationDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User Configuration Settings.' } },
        resolve: (root:any, args:any) => PersonReadResolvers.configuration(root, args, 'user')                 
    },

    userDevices: {
        type: devicesDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User owned devices' } },
        resolve: (root:any, args:any) => PersonReadResolvers.devices(root, args, 'user')          
    },

};

/***
 *
 */
const mutation = {

    CreateNewUser: {
        type: NewUserType,
        args: {
            firstName: { type: new GraphQLNonNull(GraphQLString) },
            middleName:  { type: GraphQLString },
            lastName: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            password: {type: new GraphQLNonNull(GraphQLString) },
            confirmPassword: { type: GraphQLString }
        },
        resolve: (root:any, args:any, context:any) => PersonMutationResolvers.addPerson(root, args, context, 'user') 
    },

    DeleteUser: {
        type: DeleteUserType,
        args: {
            email: { type: GraphQLString },
            url:  { type: GraphQLString },
            identifier:  { type: GraphQLString }
        },
        resolve: (root:any, args:any, context:any) => PersonMutationResolvers.deletePerson(root, args, context, 'user') 
    },

    // Aabvb@3459083453098_____
    TestUserLogin: {
        type: TestLoginType,
        args: {
            email: { type: new GraphQLNonNull(GraphQLString) },
            password: { type: new GraphQLNonNull(GraphQLString) }, 
        },
        resolve: (root:any, args:any, context:any) => PersonMutationResolvers.testLogin(root, args, context, 'user') 
    },

    ChangeUserPassword: {
        type: ChangePasswordType,
        args: {
            id:  { type: GraphQLID },          
            oldPassword: { type: new GraphQLNonNull(GraphQLString) },
            password:  { type: new GraphQLNonNull(GraphQLString) },
            confirmPassword:  { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (root:any, args:any, context:any) => PersonMutationResolvers.changePassword(root, args, context, 'user') 
    }
}


export const UserSchema = {
    query,  
    mutation,
    types: [
        coreDefinition.type,
        profileDefinition.type,
        passwordDefinition.type,
        loginDefinition.type,
        accountsDefinition.type,
        securityDefinition.type,
        configurationDefinition.type,
        devicesDefinition.type,
        userDefinition.type
    ]
};

