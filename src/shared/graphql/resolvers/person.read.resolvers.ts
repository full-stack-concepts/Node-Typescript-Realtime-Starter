
import {
	userDefinition,
	coreDefinition,
	profileDefinition,
	passwordDefinition,
	loginDefinition,
	accountsDefinition,
	securityDefinition,
	configurationDefinition,
	devicesDefinition,
	clientDefinition,
	customerDefinition,
	systemUserDefinition
} from "../types/person.types";

import { 
	userReadModel, UserReadModel, 
	clientReadModel, ClientReadModel, 
	customerReadModel, CustomerReadModel, 
	systemUserReadModel, SystemUserReadModel 
} from "../../models";

import { IUser, IClient, ICustomer, ISystemUser} from "../../interfaces";

const getModel = (subtype:string) => {
	console.log("*** Incoming subtype ", subtype)
	let model:any;
	switch(subtype) {
		case 'user': model = userReadModel; break;
		case 'client': model = clientReadModel; break;
		case 'customer': model = customerReadModel; break;
		case 'systemuser': model = systemUserReadModel; break;
	}
	return model;
}

const formatOutput = (subtype:string, result:any) => {
	let output:any;
	switch (subtype) {
		case 'user': output = userDefinition.format(result); break;
		case 'client': output = clientDefinition.format(result); break;
		case 'customer': output = customerDefinition.format(result); break;
		case 'systemuser': output = systemUserDefinition.format(result); break;
	}
	return output;
}

export const PersonReadResolvers =  {

	/***
	 * Query person subtype collection for all documents
	 */
	findAll: async (subtype:string) =>  {   
		const _persons:any = await getModel(subtype).find({});	
		let persons:any=[];
		_persons.forEach( (person:IUser|IClient|ICustomer|ISystemUser) => {	persons.push(formatOutput(subtype, person)); });		
		return persons;
	},

	/***
	 * Query person subtype collection for range [skip, limit]
	 */
	getRange: async (root:any, args:any, subtype:string) => {	

		let persons:any=[];
		const _persons:any = await getModel(subtype).getRange({}, {}, {skip:args.skip, limit:args.limit} )	
		_persons.forEach( (person:IUser|IClient|ICustomer|ISystemUser) => {	persons.push(formatOutput(subtype, person)); });	
		return persons;
	},

	/***
	 * Count documents in person subtype collection 
	 */
	count: async (subtype:string) => {			
		const count:number = await getModel(subtype).count();	
		return { count };
	},
	
	/***
	 * Query Person subtype collection to find user by mail address
	 */
	findByMail: async (root:any, args:any, subtype:string) =>  {        		
		const model:UserReadModel | ClientReadModel | CustomerReadModel | SystemUserReadModel = getModel(subtype);                   
        const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await model.find({'core.email': args.email});
        return formatOutput(subtype, persons[0]);
    },

    /***
	 * Query Person subtype collection to find user by Mongoose ID
	 */
    findById: async (root:any, args:any, subtype:string) => {            	
   		const person:IUser|IClient|ICustomer|ISystemUser = await getModel(subtype).findById(args.id);
   		return formatOutput(subtype, person);
    },

    /***
	 * Query Person subtype collection to find user by URL
	 */
    findByURL: async (root:any, args:any, subtype:string) => {            	
		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"core.url": args.url});
      	return formatOutput(subtype, persons[0]);
    },

    /***
	 * Query Person subtype collection to find user <core details> by Core Section Mongoose ID section
	 */
    coreDetails: async (root:any, args:any, subtype:string) => {          	
    	const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"core._id": args.id}, coreDefinition.filter);   
    	return coreDefinition.format(persons[0]);
    },

    /***
	 * Query Person subtype collection to find user <profile> by its Mongoose ID section
	 */
    profile: async (root:any, args:any, subtype:string) => {       
   		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"profile._id": args.id}, profileDefinition.filter);
   		return profileDefinition.format(persons[0]);
    },    

    /***
	 * Query Person subtype collection to find user <password configuration> by its Mongoose ID section
	 */
    password: async (root:any, args:any, subtype:string) => {   	
   		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"password._id": args.id}, passwordDefinition.filter)
   		return passwordDefinition.format(persons[0]);
    },

    /***
	 * Query Person subtype collection to find user <logins history> by its Mongoose ID section
	 */
   	logins: async (root:any, args:any, subtype:string) => {      		
   		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await  getModel(subtype).find({"logins._id": args.id}, loginDefinition.filter)
   		return loginDefinition.format(persons[0]);
   	},

    /***
	 * Query Person subtype collection to find user <accounts subscriptions> by its Mongoose ID section
	 */
 	accounts: async (root:any, args:any, subtype:string) => {    
 		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"accounts._id": args.id}, accountsDefinition.filter);
 		return accountsDefinition.format(persons[0]);
 	},

 	/***
	 * Query Person subtype collection to find user <security configuration> by its Mongoose ID section
	 */
 	security: async (root:any, args:any, subtype:string) => {    
 		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"security._id": args.id}, securityDefinition.filter);
 		return securityDefinition.format(persons[0]);
 	},

 	/***
	 * Query Person subtype collection to find user <generic configuration> by its Mongoose ID section
	 */
 	configuration: async (root:any, args:any, subtype:string) => {    
 		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"configuration._id": args.id}, configurationDefinition.filter);
 		return configurationDefinition.format(persons[0]);
 	},

 	 /***
	 * Query Person subtype collection to find user <devices> by its Mongoose ID section
	 */
 	devices: async (root:any, args:any, subtype:string) => {    
 		const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await getModel(subtype).find({"devices._id": args.id}, devicesDefinition.filter)
 		return devicesDefinition.format(persons[0]);
 	}   
}

