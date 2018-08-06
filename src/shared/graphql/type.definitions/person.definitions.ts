/***
 * Import Default Graphql Types
 */
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

export const PersonaliaType = new GraphQLObjectType({
    name: "PersonaliaType",
    description: "Personalia Names Model",
    fields: {
        givenName:   { type: GraphQLString },     
        middleName:  { type: GraphQLString },     
        familyName:  { type: GraphQLString }
    }
});


export const DisplayNamesType = new GraphQLObjectType({
    name: "DisplayNamesType",
    description: "Dusplay Names Model",
    fields: {
        fullName:   { type: GraphQLString},
        sortName:   { type: GraphQLString}
    }
});

export const AddressType = new  GraphQLObjectType({
    name: "AddressType",
    description: "Address Model",
    fields: {
        street:             { type: GraphQLString},
        houseNumber:        { type: GraphQLInt},
        suffix:             { type: GraphQLString},
        addition:           { type: GraphQLString},
        areacode:           { type: GraphQLString},
        city:               { type: GraphQLString},
        county:             { type: GraphQLString},
        country:            { type: GraphQLString},
        countryCode:        { type: GraphQLString},      
    }
});


export const SocialType =  new GraphQLObjectType({
   name: "SocialType", 
   description: "Social Model",
   fields: {
        googleplus:     { type: GraphQLString},
        facebook:       { type: GraphQLString},
        linkedin:       { type: GraphQLString},
        twitter:        { type: GraphQLString},
        instagram:      { type: GraphQLString},
        stackoverflow:  { type: GraphQLString}
   }
});


export const CommunicationType = new GraphQLObjectType({
    name: "CommunicationType", 
    description: "Communication Model",
    fields: {
        email: { type: GraphQLString},
        website:  { type: GraphQLString},
        phone:  { type: GraphQLString}
    }
});

export const ImagesType = new GraphQLObjectType({
    name: "ImagesType", 
    description: "Images Model",
    fields: {
        thumbnail: { type: GraphQLString},
        externalThumbnailUrl:  { type: GraphQLString},
        avatar:  { type: GraphQLString}
    }
});


export const LocationType = new  GraphQLObjectType({
    name: "LocationType",
    description: "Location Model",
    fields: {
        latitude:    { type: GraphQLFloat}, 
        longitude:    { type: GraphQLFloat}
    }
});
