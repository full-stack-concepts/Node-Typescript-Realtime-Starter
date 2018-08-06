/***
 * Interfaces
 */
import { IUserAddress } from "../../interfaces";

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

/***
 * Import Dynamic Grpaphql Types (Scalars)
 */
import { DateTimeScalar } from "../scalars/datetime.scalar";
import { BigIntegerScalar} from "../scalars/bigint.scalar";
import { DateScalar } from "../scalars/date.scalar";

import {
	PersonaliaType,
	DisplayNamesType,
	AddressType,
	SocialType,
	CommunicationType,
	ImagesType
} from "../type.definitions";

interface ITypeDefinition {
	filter: Object,
	format: Function,
	type: any
}

export const CounterType = new GraphQLObjectType({
	name: "CounterType",
    description: "Counts documents per collection",   
    fields: {
    	count: { type:GraphQLInt}
    }
});

export const NewUserType = new GraphQLObjectType({
	name: "NewUserType",
	description: "Create Person subtype User, Client or Customer.",
	fields: () => ({
		
		// form fields
		firstName: { type:GraphQLString, description: "First Name"},
		middleName: { type:GraphQLString, description: "Middle Name"},
		lastName: { type:GraphQLString, description: "Last Name"},
		email: { type:GraphQLString, description: "Valid email address" },
		password: {	type: GraphQLString,  description: "Password string" },
		confirmPassword: {	type: GraphQLString,  description: "Confirm Password string" },
		
		// response fields
		error:  { type: GraphQLBoolean, description: "Error Status"},
		status:  { type: GraphQLBoolean, description: "Mutation Status"},
		message: { type:GraphQLString, description: "Error String "},
		errorID:  { type:GraphQLInt, description: "Event Error ID"},
	})
});

export const DeleteUserType =  new GraphQLObjectType({
	name: "DeleteUserType",
	description: "Delete Person subtype User, Client or Customer.",
	fields: () => ({

		// form fields
		email:  { type: GraphQLString, description: "Person's email address"},
    	url:  { type: GraphQLString, description: "Person's url string"},
    	identifier: { type: GraphQLString, description: "Person's infrastructure identifier"},

		// response fields
		error:  { type: GraphQLBoolean, description: "Error Status"},
		status:  { type: GraphQLBoolean, description: "Mutation Status"},
		message: { type:GraphQLString, description: "Error String "},
		errorID:  { type:GraphQLInt, description: "Event Error ID"},
	})
});

export const TestLoginType = new GraphQLObjectType({
	name: "TestLoginType",
	description: "Test User Loging",
	fields: () => ({

		email:  { type: GraphQLString, description: "User EMail Address"},
		password: { type: GraphQLString, description: "New user password"},

		// response fields
		error:  { type: GraphQLBoolean, description: "Error Status"},
		status:  { type: GraphQLBoolean, description: "Mutation Status"},
		message: { type:GraphQLString, description: "Error String "},
		errorID:  { type:GraphQLInt, description: "Event Error ID"},
	})

})

export const ChangePasswordType = new GraphQLObjectType({
	name: "ChangePasswordType",
	description: "Change User Password",
	fields: () => ({

		// form fields
		 id: { type: GraphQLString, description: "User Identifier"},
		oldPassword:  { type: GraphQLString, description: "Current user password"},
    	password:  { type: GraphQLString, description: "New user password"},
    	confirmPassword: { type: GraphQLString, description: "Confirmation new user password"},

    	// response fields
		error:  { type: GraphQLBoolean, description: "Error Status"},
		status:  { type: GraphQLBoolean, description: "Mutation Status"},
		message: { type:GraphQLString, description: "Error String "},
		errorID:  { type:GraphQLInt, description: "Event Error ID"}
	})
});

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

const LocationType = new  GraphQLObjectType({
    name: "LocationType",
    description: "Location Model",
    fields: {
        latitude:    { type: GraphQLFloat}, 
        longitude:    { type: GraphQLFloat}
    }
});


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
const defaultSystemUserFields = {
    id:             		{ type: GraphQLID },
    displayName:    		{ type: GraphQLString, description: 'Display Name' },
    role:           		{ type: GraphQLInt, description: 'Assigned Role' },
    email:          		{ type: GraphQLString, description: 'Email Address' },     
    url:            		{ type: GraphQLString, description: 'Public Identifier' },
    identifier:     		{ type: GraphQLString, description: 'Infrastructure Identifier' }   
};


export const systemUserDefinition:ITypeDefinition = {

	filter: {},
	
	format: (obj:any) => {
		return {
	        id: obj._id,                                      
	        role: obj.core.role,
	        email: obj.core.email,
	        url: obj.core.url,
	        identifier: obj.core.identifier
	       
	    };    
	},
	
	type:  new GraphQLObjectType({
   		name: 'SystemUserType',
    	description: 'Sustem User Read Query',
    	fields: () => (defaultSystemUserFields)
	})
};

