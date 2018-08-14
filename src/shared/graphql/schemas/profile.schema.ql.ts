import {
    GraphQLID,        
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLString,   

} from 'graphql';

/****
 * Type Definitions
 */
import {        
    CounterType
} from "./person.types";

import {
    profilePersonaliaDefinition
} from "../read.definitions";

import {    
    MutationResponseType
} from "../mutation.definitions";


import {
    PersonaliaReadResolvers,
    PersonaliaMutationResolvers
} from "../resolvers";

/***
 *
 */
const query = {  

    getPersonaliaByProfileId: {
        type: profilePersonaliaDefinition.type,
        args: { id: { type: GraphQLID, description: 'rerieve Personalia subdocument by its Mongoose ID' } },
        resolve: (root:any, args:any) => PersonaliaReadResolvers.getPersonalia(root, args)     
    } 

}

/***
 * 
 */
const mutation = {
     

}

export const ProfileSchema = {
    query,  
    mutation,
    types: [
       profilePersonaliaDefinition.type
    ]
};




