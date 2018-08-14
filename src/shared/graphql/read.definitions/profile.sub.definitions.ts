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

/***
 *
 */
export const profilePersonaliaDefinition:ITypeDefinition = {

	filter: {				
    	"profile.personalia.givenName":1,
    	"profile.personalia.middelName":1,
    	"profile.personalia.familyName":1
	},

	format: (obj:any) => {
		return {	       
	        givenName: obj.givenName,
	      	middleName: obj.middleName, 
	      	familyName: obj.familyName
	    };
	},

	type: new GraphQLObjectType({
	    name: "ProfilePersonaliaType",
	    description: "Get Person Personalia By Section ID (Mongoose ID)",
	    fields: {	   
	        givenName: { type: GraphQLString},   
	        middleName:  { type: GraphQLString}, 
	        familyName:  { type: GraphQLString}  
	    }
	})
}

/***
 *
 */
export const profileDisplayNamesDefinition:ITypeDefinition = {

	filter: {				
    	"profile.displayNames.fullName":1,
    	"profile.displayNames.sortName":1,  
	},
	format: (obj:any) => {
		return {
	        fullName: obj.fullName,
	        sortName: obj.sortName	       
	    };
	},

	type: new GraphQLObjectType({
	    name: "ProfileDisplayNamesType",
	    description: "Get Person Display Names by Profile Id",
	    fields: {
	    	fullName: { type: GraphQLString},   
	        sortName: { type: GraphQLString}	    
	    }
	})
}

/***
 *
 */
export const profileSocialDefinition:ITypeDefinition = {

	filter: {				
    	"profile.social.googleplus":1,
    	"profile.social.facebook":1,  
    	"profile.social.linkedin":1,  
    	"profile.social.twitter":1,  
    	"profile.social.instagram":1,  
    	"profile.social.stackoverflow":1,  
	},

	format: (obj:any) => {
		return {
	    	"googleplus": obj.googleplus,
    		"facebook": obj.facebook,  
    		"linkedin": obj.linkedin,  
    		"twitter": obj.twitter,  
    		"instagram": obj.instagram,  
    		"stackoverflow": obj.stackoverflow,         
	    };
	},

	type: new GraphQLObjectType({
	    name: "ProfileSocialType",
	    description: "Get Social Subscriptions by Profile Id",
	    fields: {
	    	"googleplus": { type: GraphQLString},   
    		"facebook":{ type: GraphQLString},   
    		"linkedin":{ type: GraphQLString},   
    		"twitter": { type: GraphQLString},   
    		"instagram":{ type: GraphQLString},   
    		"stackoverflow":{ type: GraphQLString}  	    
	    }
	})
}

