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
    profilePersonaliaDefinition,
    profileDisplayNamesDefinition,
    profileSocialDefinition,
    profileCommunicationDefinition,
    profileImagesDefinition
} from "../read.definitions";

import {    
    MutationResponseType
} from "../mutation.definitions";

import {
    ProfileReadResolvers,
    ProfileMutationResolvers,    
} from "../resolvers";

/***
 *
 */
const query = {  

    getPersonalia: {
        type: profilePersonaliaDefinition.type,
        args: { profileID: { type: GraphQLID, description: 'retrieve Personalia subdocument by its parent Profile Mongoose ID' } },
        resolve: (root:any, args:any) => ProfileReadResolvers.getPersonalia(root, args)     
    },

    getDisplayNames: {
        type: profileDisplayNamesDefinition.type,
        args: { profileID: { type: GraphQLID, description: 'retrieve Display names subdocument by its parent Profile Mongoose ID' } },
        resolve: (root:any, args:any) => ProfileReadResolvers.getDisplayNames(root, args)     
    },

    getSocialProfiles: {
        type: profileSocialDefinition.type,
        args: { profileID: { type: GraphQLID, description: 'retrieve Social Profiles subdocument by its parent Profile Mongoose ID' } },
        resolve: (root:any, args:any) => ProfileReadResolvers.getSocialProfiles(root, args)     
    },

    getCommunicationSettings: {
        type: profileCommunicationDefinition.type,
        args: { profileID: { type: GraphQLID, description: 'retrieve Communication subdocument by its parent Profile Mongoose ID' } },
        resolve: (root:any, args:any) => ProfileReadResolvers.getCommunicationSettings(root, args)     
    },

    getImageSettings: {
        type: profileImagesDefinition.type,
        args: { profileID: { type: GraphQLID, description: 'retrieve Images subdocument by its parent Profile Mongoose ID' } },
        resolve: (root:any, args:any) => ProfileReadResolvers.getImagesSettings(root, args)     
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



