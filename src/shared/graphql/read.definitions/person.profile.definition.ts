/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,         
    GraphQLString,
    GraphQLInt   
} from 'graphql';

import { 
	DisplayNamesType, 
	PersonaliaType, 
	SocialType,
	CommunicationType,
	ImagesType
} from "../read.definitions";

import { ITypeDefinition } from "../interfaces";



export const profileDefinition:ITypeDefinition = {

	filter: {
		"profile._id":1,
    	"profile.personalia": 1,
		"profile.displayNames": 1,
		"profile.address": 1,
    	"profile.location": 1,
    	"profile.social": 1,
    	"profile.communication":1,
    	"profile.images":1,
    	"profile.description":1
	},

	format: (obj:any) => {
		return {
	        id: obj._id,
	        personalia: obj.profile.personalia,
	        displayNames: obj.profile.displayNames,	      
	        social: obj.profile.social,
	        communication: obj.profile.communication,
	        images: obj.profile.images
	    };
	},

	type: new GraphQLObjectType({
	    name: "UserProfileType",
	    description: "User Profile Type",
	    fields: {
	        id:             { type: GraphQLID},
	        description:    { type: GraphQLString},
	        personalia:     { type: PersonaliaType },
	        displayNames:   { type: DisplayNamesType },	       
	        social:         { type: SocialType},
	        communication:  { type: CommunicationType },
	        images:         { type: ImagesType}
	    }
	})
}