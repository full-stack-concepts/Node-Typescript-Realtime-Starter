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
	SocialType,	
	ImagesType
} from "../read.definitions";

import { ITypeDefinition } from "../interfaces";



export const profilePersonaliaDefinition:ITypeDefinition = {

	filter: {		
    	"profile.personalia.givenName":1,
    	"profile.personalia.middelName":1,
    	"profile.personalia.familyName":1
	},

	format: (obj:any) => {
		return {
	        id: obj._id,
	      	givenName: obj.givenName,
	      	middleName: obj.middleName, 
	      	familyName: obj.familyName
	    };
	},

	type: new GraphQLObjectType({
	    name: "ProfilePersonaliaType",
	    description: "Get Person Personalia By Section ID (Mongoose ID)",
	    fields: {
	        id: { type: GraphQLID},
	        givenName: { type: GraphQLString},   
	        middleName:  { type: GraphQLString}, 
	        familyName:  { type: GraphQLString}  
	    }
	})
}

