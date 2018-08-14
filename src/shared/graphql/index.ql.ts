import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql';


// Import each models schema
import { UserSchema } from "./schemas/user.schema.ql"; 
import { ClientSchema} from "./schemas/client.schema.ql";
import { CustomerSchema} from "./schemas/customer.schema.ql";
import { SystemUserSchema} from "./schemas/systemuser.schema.ql";
import { AddressSchema} from "./schemas/address.schema.ql";
import { ProfileSchema } from "./schemas/profile.schema.ql";

export const graphqlSchema = new GraphQLSchema({

    query: new GraphQLObjectType({
        name: "Query",
        fields: () => Object.assign(
            UserSchema.query,
            ClientSchema.query,
            CustomerSchema.query,
            SystemUserSchema.query,
            AddressSchema.query,
            ProfileSchema.query
        )
    }),  

    mutation: new GraphQLObjectType({
        name: "Mutation",
        fields: () => Object.assign(
            UserSchema.mutation,
            ClientSchema.mutation,
            CustomerSchema.mutation,
            AddressSchema.mutation,
            ProfileSchema.mutation
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
        ...AddressSchema.types
    ]
});

