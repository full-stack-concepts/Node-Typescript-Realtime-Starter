/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,           
    GraphQLBoolean 
} from 'graphql';

import { ITypeDefinition } from "../interfaces";


export const configurationDefinition:ITypeDefinition = {

	filter: {
		"configuration._id": 1,
	    "configuration.isThumbnailSet": 1,
	    "configuration.isGooglePlusUser": 1,
	    "configuration.isGoogleUser": 1,
	    "configuration.isFacebookUser": 1,
	    "configuration.isAddressSet": 1,
	    "configuration.hasExternalThumbnailUrl": 1
	},
	
	format: (obj:any) => {
		return {
	        id: obj.configuration._id,
	        isThumbnailSet: obj.configuration.isThumbnailSet,
	        isGooglePlusUser:  obj.configuration.isGooglePlusUser,
	        isGoogleUser:  obj.configuration.isGoogleUser,
	        isFacebookUser:  obj.configuration.isFacebookUser,
	        isAddressSet:  obj.configuration.isAddressSet,
	        hasExternalThumbnailUrl:  obj.configuration.hasExternalThumbnailUrl
	    };
	},
	
	type:  new GraphQLObjectType({
	    name: "UserConfigurationType",
	    description: "User COnfiguration Model: provides information on user configuration.",
	    fields: {
	        id:                     { type: GraphQLID },
	        isThumbnailSet:         { type: GraphQLBoolean},
	        isGooglePlusUser:       { type: GraphQLBoolean},
	        isGoogleUser:           { type: GraphQLBoolean},
	        isFacebookUser:         { type: GraphQLBoolean},
	        isAddressSet:           { type: GraphQLBoolean},
	        hasExternalThumbnailUrl:{ type: GraphQLBoolean}
	    }
	})
}