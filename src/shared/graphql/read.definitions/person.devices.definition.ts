/***
 * Import Default Graphql Types
 */
import {
	GraphQLObjectType,
    GraphQLID,         
    GraphQLString,   
    GraphQLList 
} from 'graphql';

import { ITypeDefinition } from "../interfaces";


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