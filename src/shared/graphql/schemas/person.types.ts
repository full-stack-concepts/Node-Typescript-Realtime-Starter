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
	ImagesType,
	LocationType
} from "../read.definitions";

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



