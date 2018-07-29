import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql';


// Import each models schema
import { UserSchema } from "./types/user.type.ql";
import { ClientSchema} from "./types/client.type.ql";
import { CustomerSchema} from "./types/customer.type.ql";
import { SystemUserSchema} from "./types/systemuser.type.ql";

export const graphqlSchema = new GraphQLSchema({

    query: new GraphQLObjectType({
        name: "Query",
        fields: () => Object.assign(
            UserSchema.query,
            ClientSchema.query,
            CustomerSchema.query,
            SystemUserSchema.query
        )
    }),  

    mutation: new GraphQLObjectType({
        name: "Mutation",
        fields: () => Object.assign(
            UserSchema.mutation,
            ClientSchema.mutation,
            CustomerSchema.mutation
        )
    }),
   
    // subscription: new GraphQLObjectType({
    //     name: 'Subscription',
    //     fields: () => Object.assign(
    //      UserSchema.subscription,        
    //      ClientSchema.subscription,
    //      CustomerSchema.subscription,
    //      SsytemUserScheam.subscription    
    //     )
    // }),
    types: [       
        ...UserSchema.types,
    ]
});

