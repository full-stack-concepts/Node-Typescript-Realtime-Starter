import {
	addressDefinition
} from "../read.definitions";

import { 	
	addressReadModel, AddressReadModel
} from "../../models";

import { IUserAddress} from "../../interfaces";

/***
 * Presentational function
 */
const formatOutput = (address:IUserAddress):IUserAddress => {	
	return address;
}

export const AddressReadResolvers =  {

	/***
	 * Query Address Collection for all documents
	 */
	findAll: async () =>  {   
	
		const _addresses:IUserAddress[] = await addressReadModel.find({});										
		let a:any=[];		
		_addresses.forEach( (address:IUserAddress) => a.push(formatOutput(address)) );		
		return a;
		
	},

	/***
	 * Query Address Collection for range [skip, limit]
	 */
	getRange: async (root:any, args:any) => {	

		const _addresses:IUserAddress[] = await addressReadModel.getRange({}, {}, {skip:args.skip, limit:args.limit} )	
		
		let a:any=[];		
		_addresses.forEach( (address:IUserAddress) => a.push(formatOutput(address)) );		
		return a;
	},

	/***
	 * Count documents in Address Collection
	 */
	count: async () => {					
		const count:number = await addressReadModel.count();		
		return { count };
	},

	/***
	 * Query Address collection to find address by Mongoose ID
	 */
    findById: async (root:any, args:any) => {            	
   		const address:IUserAddress = await addressReadModel.findById(args.id);
   		return address;
    },

	
	
}