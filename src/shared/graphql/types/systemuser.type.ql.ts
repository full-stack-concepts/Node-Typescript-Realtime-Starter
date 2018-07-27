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

    systemUserFindById: {
        type: userDefinition.type,
         args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
         async resolve(root:any, args:any) {      
            console.log("*** Find Ny ID ", args.id)                 
            const user:any = await systemUserReadModel.findById(args.id);
            console.log("*** Result ", user)
            return userDefinition.format(user);
        }
    },
}

export const SystemUserSchema = {
    query,  
    types: [       
        userDefinition.type
    ]
};
