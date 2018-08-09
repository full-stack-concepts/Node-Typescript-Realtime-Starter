/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,         
    GraphQLString,
    GraphQLInt   
} from 'graphql';

import { ITypeDefinition } from "../interfaces";
import { IUserAddress} from "../../interfaces";
import { 
	userDefinition, 
	smallClientDefinition, 
	smallCustomerDefinition
} from "../read.definitions";

import { PersonReadResolvers } from "../resolvers";

/****
 *
 */
const defaultAddressFields = {
    id:             { type: GraphQLID },
   	userID:         { type: GraphQLString},
	clientID:       { type: GraphQLString},
	customerID:     { type: GraphQLString},
	street:         { type: GraphQLString},
	houseNumber:    { type: GraphQLInt },
	suffix:         { type: GraphQLString},
	addition:       { type: GraphQLString},
	areacode:       { type: GraphQLString},
	city:           { type: GraphQLString},
	county:         { type: GraphQLString},
	country:        { type: GraphQLString},
	countryCode:    { type: GraphQLString}, 
	person: { 
		type: userDefinition.type,
		resolve: (parent:any, args:any) => PersonReadResolvers.findPerson(parent, args)
	}	
};

export const addressDefinition:ITypeDefinition = {

	filter: {},
	
	format: (obj:any, address:IUserAddress) => {

		return {
			id: obj._id,    
			userID:         obj.userID,
			clientID:       obj.clientID,
			customerID:     obj.customerID,
			street:         obj.street,
			houseNumber:    obj.houseNumber,
			suffix:         obj.suffix,
			addition:       obj.addition,
			areacode:       obj.areacode,
			city:           obj.city,
			county:         obj.county,
			country:        obj.country,
			countryCode:    obj.counryCode	     
	    };    
	},
	
	type:  new GraphQLObjectType({
		name: "AddressesType",
    	description: "Address Model returns Person address or Company Address",
    	fields: () => (defaultAddressFields)
	})
};








/*
export const AddressType = new  GraphQLObjectType({
    name: "AddressType",
    description: "Address Model",
    fields: {
        userID:         { type: GraphQLString},
        clientID:       { type: GraphQLString},
        customerID:     { type: GraphQLString},
        street:         { type: GraphQLString},
        houseNumber:    { type: GraphQLInt },
        suffix:         { type: GraphQLString},
        addition:       { type: GraphQLString},
        areacode:       { type: GraphQLString},
        city:           { type: GraphQLString},
        county:         { type: GraphQLString},
        country:        { type: GraphQLString},
        countryCode:    { type: GraphQLString},   
        user: { 
            type: userDefinition.type,
            resolve: async (parent:any, args:any) => {

                let result = userModel.findById(parent.userID);
                console.log(result)

            }
        }   
    }
});
*/