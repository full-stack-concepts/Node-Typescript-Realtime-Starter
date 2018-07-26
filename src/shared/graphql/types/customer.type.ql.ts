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
import { customerReadModel } from "../../models";

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

    customerFindByMail: {
        type: userDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },
        async resolve(root:any, args:any) {                           
            const users:any = await customerReadModel.find({'core.email': args.email});
            return userDefinition.format(users[0]);
        }
    }
}

export const CustomerSchema = {
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

