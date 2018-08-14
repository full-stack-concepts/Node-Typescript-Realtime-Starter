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

import {
    IUserPersonalia, IUserDisplayNames, IUserSocial, IUserCommunication, IUserImages
} from "../../interfaces";

/***
 *
 */
export const profilePersonaliaDefinition:ITypeDefinition = {

	filter: {				
    	"profile.personalia.givenName":1,
    	"profile.personalia.middelName":1,
    	"profile.personalia.familyName":1
	},

	format: (obj:any):IUserPersonalia => {
		return <IUserPersonalia>{	       
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
	format: (obj:any):IUserDisplayNames => {
		return <IUserDisplayNames>{
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

	format: (obj:any):IUserSocial => {
		return <IUserSocial>{
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

/***
 *
 */
export const profileCommunicationDefinition:ITypeDefinition = {

	filter: {				
    	"profile.communication.phone":1,
   		"profile.communication.mobile":1,
    	"profile.communication.website":1,
    	"profile.communication.email":1    	
	},

	format: (obj:any):IUserCommunication => {
		return <IUserCommunication>{
	    	"phone": obj.phone,
    		"mobile": obj.mobile,  
    		"website": obj.website,  
    		"email": obj.email    		       
	    };
	},

	type: new GraphQLObjectType({
	    name: "ProfileCommunicationType",
	    description: "Get Communication Identifiers by Profile Id",
	    fields: {
	    	"phone": { type: GraphQLString},  
    		"mobile": { type: GraphQLString},  
    		"website":  { type: GraphQLString},    
    		"email": { type: GraphQLString}  	    
	    }
	})
}

/***
 *
 */
export const profileImagesDefinition:ITypeDefinition = {

	filter: {				
    	"profile.images.img":1,
   		"profile.images.avatar":1,
    	"profile.images.thumbnail":1    	
	},

	format: (obj:any):IUserImages => {
		return <IUserImages>{
	    	"img": obj.img,
    		"avatar": obj.avatar,  
    		"thumbnail": obj.thumbnail    	       
	    };
	},

	type: new GraphQLObjectType({
	    name: "ProfileImagesType",
	    description: "Get Images Identifiers by Profile Id",
	    fields: {
	    	"img":{ type: GraphQLString},  
    		"avatar":{ type: GraphQLString},  
    		"thumbnail":{ type: GraphQLString}  
	    }
	})
}

