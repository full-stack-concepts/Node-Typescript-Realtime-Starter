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

    systemUserFindByMail: {
        type: userDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },
        async resolve(root:any, args:any) {                           
            const users:any = await systemUserReadModel.find({'core.email': args.email});
            return userDefinition.format(users[0]);
        }
    }
}

export const SystemUserSchema = {
    query,  
    types: [
        // coreDefinition.type,
        // profileDefinition.type,
        // passwordDefinition.type,
        // loginDefinition.type,
        // accountsDefinition.type,
        // securityDefinition.type,
        // configurationDefinition.type,
        // devicesDefinition.type,
        userDefinition.type
    ]
};
