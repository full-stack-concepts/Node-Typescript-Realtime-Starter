/***
 * DB Model
 */
import { userReadModel } from "../../models";

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

interface ITypeDefinition {
	filter: Object,
	format: Function,
	type: any
}

export const coreDefinition:ITypeDefinition = {

	filter: {
	   "core._id": 1,
	    "core.role": 1,
	    "core.email": 1,
	    "core.url": 1,
	    "core.identifier":1,
	    "core.archived": 1,
	    "core.userName": 1
	},

	format: (obj:any) => {	
		return {	      
	      	id:  		obj.core.id,           
        	userName:	obj.core.userName,
        	archived:	obj.core.archived,
        	url:		obj.core.url,
        	email:		obj.core.email,
        	role:		obj.core.role,
        	identifier: obj.core.identifier
	    };
    },

    type:  new GraphQLObjectType({
    	name: "UserCoreDetailsType",
    	description: "Core Details User/Client/Customer",    
    	fields: {
        	id:             { type: GraphQLID },
        	userName:       { type: GraphQLString},
        	archived:       { type: GraphQLBoolean},
        	url:            { type: GraphQLString},
	        email:          { type: GraphQLString},
	        role:           { type: GraphQLInt},
	        identifier:     { type: GraphQLString}
    	}
    })
}

export const PersonaliaType = new GraphQLObjectType({
    name: "PersonaliaType",
    description: "Personalia Names Model",
    fields: {
        givenName:   { type: GraphQLString },     
        middleName:  { type: GraphQLString },     
        familyName:  { type: GraphQLString }
    }
});

const DisplayNamesType = new GraphQLObjectType({
    name: "DisplayNamesType",
    description: "Dusplay Names Model",
    fields: {
        fullName:   { type: GraphQLString},
        sortName:   { type: GraphQLString}
    }
});


const AddressType = new  GraphQLObjectType({
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
        countryCode:        { type: GraphQLString}
    }
});

const LocationType = new  GraphQLObjectType({
    name: "LocationType",
    description: "Location Model",
    fields: {
        latitude:    { type: GraphQLFloat}, 
        longitude:    { type: GraphQLFloat}
    }
});

const SocialType =  new GraphQLObjectType({
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

const CommunicationType = new GraphQLObjectType({
    name: "CommunicationType", 
    description: "Communication Model",
    fields: {
        email: { type: GraphQLString},
        website:  { type: GraphQLString},
        phone:  { type: GraphQLString}
    }
});

const ImagesType = new GraphQLObjectType({
    name: "ImagesType", 
    description: "Images Model",
    fields: {
        thumbnail: { type: GraphQLString},
        externalThumbnailUrl:  { type: GraphQLString},
        avatar:  { type: GraphQLString}
    }
});

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
	        address:  obj.profile.address,
	        location: obj.profile.location,
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
	        address:        { type: AddressType},
	        location:       { type: LocationType},
	        social:         { type: SocialType},
	        communication:  { type: CommunicationType },
	        images:         { type: ImagesType}
	    }
	})
}

export const passwordDefinition:ITypeDefinition = {

	filter: {
		"password._id": 1,
    	"password": 1 
	},

	format: (obj:any) => {
  		return {        
        	id: obj.password._id,
        	method: obj.password.method
    	};
	},

	type:  new GraphQLObjectType({
    	name: "UserPasswordType",
    	description: "User Password Model. You can use this query to retrieve user's password encryption method. Encryption method is an integer greater than 0 and smaller than 4.",
    	fields: {    
        	id:         { type: GraphQLID },
        	method:     { type: GraphQLInt, description: "Encryption method for user password"}
    	}
	})
}

/***
 *
 */
const SingleLoginType = new GraphQLObjectType({
    name: "SingleLoginType",    
    fields: {    
        timestamp: { type: GraphQLInt},
        date: { type: GraphQLString},
        formattedDate: { type: GraphQLString},
        formattedTime: { type: GraphQLString}
    }
});

export const loginDefinition:ITypeDefinition = {
	
	filter: {
		"logins._id": 1,
    	"logins": 1 
	},
	
	format: (obj:any) => {
		return {        
        	id: obj.logins._id,
        	logins: obj.logins.logins
    	};
	},
	
	type: new GraphQLObjectType({
	    name: "UserLoginsType",
	    description: "User Login Model. You can use this query to trace a users login activity. Returned result is an array of objects.",
	    fields: {    
	        id:         { type: GraphQLID },
	        logins:     { type: new GraphQLList(SingleLoginType), description: "Array of objects: each object represents a successful logon." }    
	    }
	})
}


export const accountsDefinition:ITypeDefinition = {

	filter: {
		"accounts._id": 1,
    	"accounts.googleID": 1,
    	"accounts.facebookID": 1,
    	"accounts.localID": 1
	},
	
	format: (obj:any) => {
		return {        
        	id: obj.accounts._id,
        	googleID: obj.accounts.googleID,
        	facebookID: obj.accounts.facebookID,
        	localID: obj.accounts.localID
    	};	
	},
	
	type: new GraphQLObjectType({
	    name: "UserAccountsType",
	    description: "User Accounts Model: provides information on accounts user uses to log on. Default Providers are Google, Facebook and Local.",
	    fields: {
	        id:         { type: GraphQLID },
	        googleID:   { type: GraphQLString},
	        facebookID: { type: GraphQLString},
	        localID:    { type: GraphQLString}
	    }
	})
}

export const securityDefinition:ITypeDefinition = {

	filter: {
		"security._id": 1,
    	"security.isAccountVerified": 1,
    	"security.isTemporaryPassword": 1,
    	"security.isPasswordEncrypted": 1,
    	"security.accountType": 1
	},
	
	format: (obj:any) => {
		return {        
	        id: obj.security._id,
	        isAccountVerified: obj.security.isAccountVerified,
	        isTemporaryPassword: obj.security.isTemporaryPassword,
	        isPasswordEncrypted: obj.security.isPasswordEncrypted,
	        accountType: obj.security.accountType
	    };
	},
	
	type: new GraphQLObjectType({
    name: "UserSecurityType",
	    description: "User Security Model: provides information on security.",
	    fields: {
	        id:                     { type: GraphQLID },
	        isAccountVerified:      { type: GraphQLBoolean},
	        isTemporaryPassword:    { type: GraphQLBoolean},
	        isPasswordEncrypted:    { type: GraphQLBoolean},
	        accountType:            { type: GraphQLInt}
	    }
	})
}

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

/***
 *
 */
const SingleDeviceType = new GraphQLObjectType({
    name: "SingleDeviceType",    
    fields: {    
        location:               { type: GraphQLString},
        ipType:                 { type: GraphQLString},
        ipAddress:              { type: GraphQLString},
        ip6Address:             { type: GraphQLString},
        userAgent:              { type: GraphQLString},
        macAddress:             { type: GraphQLString},
        protocol:               { type: GraphQLString}
    }
});

export const devicesDefinition:ITypeDefinition = {

	filter: {
		"logins._id": 1,
    	"devices": 1 
	},
	
	format: (obj:any) => {
		return {        
        	id: obj.devices._id,
        	devices: obj.devices.devices
    	};
	},
	
	type:   new GraphQLObjectType({
	    name: "UserDevicesType",
	    description: "User Devices Model.",
	    fields: {    
	        id:         { type: GraphQLID },
	        devices:    { type: new GraphQLList(SingleDeviceType), description: "Array of objects." }    
	    }
	})
};

/****
 *
 */
const defaultUserFields = {
    id:             		{ type: GraphQLID },
    displayName:    		{ type: GraphQLString, description: 'Display Name' },
    role:           		{ type: GraphQLInt, description: 'Assigned Role' },
    email:          		{ type: GraphQLString, description: 'Email Address' },     
    url:            		{ type: GraphQLString, description: 'Public Identifier' },
    identifier:     		{ type: GraphQLString, description: 'Infrastructure Identifier' },     
    personalia:     		{ type: PersonaliaType},
    coreSectionID:      	{ type: GraphQLID },
    passwordSectionID:		{ type: GraphQLID },
    loginsSectionID:		{ type: GraphQLID },
    accountsSectionID:		{ type: GraphQLID },
    securitySectionID:		{ type: GraphQLID },
    configurationSectionID:	{ type: GraphQLID },
    profileSectionID:   	{ type: GraphQLID },
   	devicesSectionID:		{ type: GraphQLID },
};

export const userDefinition:ITypeDefinition = {

	filter: {},
	
	format: (obj:any) => {
		return {
	        id: obj._id,                                      
	        role: obj.core.role,
	        email: obj.core.email,
	        url: obj.core.url,
	        identifier: obj.core.identifier,
	        personalia: obj.profile.personalia,
	        displayName: obj.profile.displayNames.fullName,
	        coreSectionID: obj.core.id,
	        passwordSectionID: obj.password.id,
	        // loginsSectionID:  obj.logins.id,
    		accountsSectionID:	obj.accounts.id,
    		securitySectionID:	obj.security.id,
    		configurationSectionID:	obj.configuration.id,
	        profileSectionID: obj.profile.id,
	        devicesSectionID: obj.devices.id
	    };    
	},
	
	type:  new GraphQLObjectType({
   		name: 'UserType',
    	description: 'User Read Query',
    	fields: () => (defaultUserFields)
	})
};


/****
 *
 */
const defaultClientFields = {
    id:             		{ type: GraphQLID },
    displayName:    		{ type: GraphQLString, description: 'Display Name' },
    role:           		{ type: GraphQLInt, description: 'Assigned Role' },
    email:          		{ type: GraphQLString, description: 'Email Address' },     
    url:            		{ type: GraphQLString, description: 'Public Identifier' },
    identifier:     		{ type: GraphQLString, description: 'Infrastructure Identifier' },     
    personalia:     		{ type: PersonaliaType},
    coreSectionID:      	{ type: GraphQLID },
    passwordSectionID:		{ type: GraphQLID },   
    accountsSectionID:		{ type: GraphQLID },
    securitySectionID:		{ type: GraphQLID },
    configurationSectionID:	{ type: GraphQLID },
    profileSectionID:   	{ type: GraphQLID },
   	devicesSectionID:		{ type: GraphQLID },
};


export const clientDefinition:ITypeDefinition = {

	filter: {},
	
	format: (obj:any) => {
		return {
	        id: obj._id,                                      
	        role: obj.core.role,
	        email: obj.core.email,
	        url: obj.core.url,
	        identifier: obj.core.identifier,
	        personalia: obj.profile.personalia,
	        displayName: obj.profile.displayNames.fullName,
	        coreSectionID: obj.core.id,
	        passwordSectionID: obj.password.id,	       
    		accountsSectionID:	obj.accounts.id,
    		securitySectionID:	obj.security.id,
    		configurationSectionID:	obj.configuration.id,
	        profileSectionID: obj.profile.id,
	        devicesSectionID: obj.devices.id
	    };    
	},
	
	type:  new GraphQLObjectType({
   		name: 'UserType',
    	description: 'User Read Query',
    	fields: () => (defaultUserFields)
	})
};

