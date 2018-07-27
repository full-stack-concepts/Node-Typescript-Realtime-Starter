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
    PersonaliaType,

} from "./person.types";

/***
 *
 */
const query = {  

    clientFindByMail: {
        type: userDefinition.type,
        args: { email: { type: GraphQLString, description: 'find by email' } },
        async resolve(root:any, args:any) {                           
            const users:any = await clientReadModel.find({'core.email': args.email});
            return userDefinition.format(users[0]);
        }
    },

    clientFindById: {
        type: userDefinition.type,
         args: { id: { type: GraphQLID, description: 'find by Mongoose ID' } },
         async resolve(root:any, args:any) {                       
            const user:any = await clientReadModel.findById(args.id);
            return userDefinition.format(user);
        }
    },

    clientFindByURL: {
        type: userDefinition.type,
        args:  { url: { type: GraphQLString, description: 'find by URL' } },
        async resolve(root:any, args:any) {                       
            const users:any = await clientReadModel.find({"core.url": args.url});
            return userDefinition.format(users[0]);
        }
    },
}

export const ClientSchema = {
    query,  
    types: [       
        userDefinition.type
    ]
};
