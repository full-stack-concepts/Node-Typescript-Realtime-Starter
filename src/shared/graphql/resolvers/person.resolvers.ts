
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
	customerDefinition
} from "../types/person.types";

import { 
	userReadModel, UserReadModel, 
	clientReadModel, ClientReadModel, 
	customerReadModel, CustomerReadModel, 
	systemUserReadModel, SystemUserReadModel 
} from "../../models";

import { IUser, IClient, ICustomer, ISystemUser} from "../../interfaces";

const getModel = (subtype:string) => {
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
	}
	return output;
}

export const PersonReadResolvers =  {

	/***
	 * Query Person subtype collection to find user by mail address
	 */
	findByMail: async (root:any, args:any, subtype:string) =>  {        
		console.log("**** Incoming Subtype ", subtype, args)
		const model:UserReadModel | ClientReadModel | CustomerReadModel | SystemUserReadModel = getModel(subtype);                   
        const persons:IUser[]|IClient[]|ICustomer[]|ISystemUser[] = await model.find({'core.email': args.email});
        // console.log("*** result ", persons)
        console.log("***", userDefinition.format(persons[0]))

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

export const PersonWriteResolvers =  {

	
}