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
import { userReadModel } from "../../models";

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
    PersonaliaType,

} from "./person.types";

/***
 *
 */
const query = {  

    userFindByMail: {
        type: userDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },
        async resolve(root:any, args:any) {                           
            const users:any = await userReadModel.find({'core.email': args.email});
            return userDefinition.format(users[0]);
        }
    },
    
    userFindById: {
        type: userDefinition.type,
         args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
         async resolve(root:any, args:any) {                       
            const user:any = await userReadModel.findById(args.id);
            return userDefinition.format(user);
        }
    },

    userFindByURL: {
        type: userDefinition.type,
        args:  { url: { type: GraphQLString, description: 'find by URL' } },
        async resolve(root:any, args:any) {                       
            const users:any = await userReadModel.find({"core.url": args.url});
            return userDefinition.format(users[0]);
        }
    },

    userCoreDetails: {
        type: coreDefinition.type,
        args: { id: { type: GraphQLID, description: 'find User Core Object by its ID' } },
        resolve(root:any, args:any) {                                         
            return userReadModel.find({"core._id": args.id}, coreDefinition.filter )
            .then( (users:any) => coreDefinition.format(users[0]) );
        }
    },

    userProfile: {
        type: profileDefinition.type,
        args: { id: { type: GraphQLID, description: 'find User Profile Object by its ID' } },
        resolve(root:any, args:any) {    
            return userReadModel.find({"profile._id": args.id}, profileDefinition.filter)
            .then( (users:any) => profileDefinition.format(users[0]) );
        }
    },

    userPassword: {
        type: passwordDefinition.type,
        args: { id: { type: GraphQLID, description: 'find User Password Object by its ID' } },
        resolve(root:any, args:any) {        
            return userReadModel.find({"password._id": args.id}, passwordDefinition.filter)
            .then( (users:any) => passwordDefinition.format(users[0]) );
        }
    },

    userLogins: {
        type: loginDefinition.type,
        args:  { id: { type: GraphQLID, description: 'find User Logins by its logins ObjectID' } },
        resolve(root:any, args:any) {        
            return userReadModel.find({"logins._id": args.id}, loginDefinition.filter)
            .then( (users:any) => loginDefinition.format(users[0]) );
        } 
    },

    userAccounts: {
        type: accountsDefinition.type,
        args:  { id: { type: GraphQLID, description: 'find user logon accounts: Google, Facebook or LocalID' } },
        resolve(root:any, args:any) {          
             return userReadModel.find({"accounts._id": args.id}, accountsDefinition.filter)
            .then( (users:any) => accountsDefinition.format(users[0]) );
        } 
    },

    userSecurity: {
        type: securityDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User Security Settings.' } },
        resolve(root:any, args:any) {    
            return userReadModel.find({"security._id": args.id}, securityDefinition.filter)
            .then( (users:any) => securityDefinition.format(users[0]) );
        } 

    },

    userConfiguration: {
        type: configurationDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User Configuration Settings.' } },
        resolve(root:any, args:any) {        
             return userReadModel.find({"configuration._id": args.id}, configurationDefinition.filter)
            .then( (users:any) => configurationDefinition.format(users[0]) );
        } 
    },

    userDevices: {
        type: devicesDefinition.type,
        args:  { id: { type: GraphQLID, description: 'retrieve User owned devices' } },
        resolve(root:any, args:any) {        
             return userReadModel.find({"devices._id": args.id}, devicesDefinition.filter)
            .then( (users:any) => devicesDefinition.format(users[0]) );
        } 
    }
};

export const UserSchema = {
    query,  
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