/****	*******************
 * Support db operations class generated
 * @users
 * @clients
 * @customers
 */
import fetch from "node-fetch";
import mongoose from "mongoose";

import { 
	IUser, 
	IClient, 
	ICustomer,
	IUserAddress
} from "../../shared/interfaces";

import { 
	userModel, UserModel, 
	clientModel, ClientModel, 
	customerModel, CustomerModel,
	addressModel, AddressModel
} from "../../shared/models";

import {
	POPULATE_LOCAL_DATABASE,
	POPULATE_REMOTE_DATABASE,
	DB_USERS_COLLECTION_NAME,
	DB_CLIENTS_COLLECTION_NAME,
	DB_CUSTOMERS_COLLECTION_NAME 
} from "../../util/secrets";

import {
	dataUtilitiesService
} from "./data.utilities.service";

import {deepCloneObject} from "../../util";

/***
 * AddressObject Formatter
 */
const createAddressObject:Function = (
	mongooseID:any, 
	subtype:string
)=> {

	let address:IUserAddress = dataUtilitiesService.fakeSingleAddress();
	
	if(subtype === 'user') address.userID = mongooseID.id;
	if(subtype === 'client') address.clientID = mongooseID.id;
	if(subtype === 'customer') address.customerID = mongooseID.id;

	return address;
}


export class UserTypes {

	/******
	 * Stores generated data in local MongoDB instance
	 */
	public static storeLocally(data:any) {		

		if(!POPULATE_LOCAL_DATABASE)
			return Promise.resolve();

		Promise.all(
			data.map ( (obj:any,key:any) => {
				let keys:string[] = Object.keys(data[key]),
					category:string = keys[0];	

				if(category==='users') { 
					UserTypes.processGeneratedUsers( obj.users );				
				} else if(category==='defaultClient') {
					UserTypes.processGeneratedClients(obj, 'defaultClient');
				} else if(category==='defaultCustomer') {					
					UserTypes.processGeneratedCustomers(obj, 'defaultCustomer');
				}
			})

		)
		.then( () => {return Promise.resolve(); })
		.catch( (err:Error) => console.error(err) );
	}

	/******
	 * @userCollection is an object  {
	 * superadmin: IUser[],
	 * admin: IUser[],
	 * poweruser: IUser[],
	 * author: IUser[],
	 * user: IUser
	 * }
	 */
	private static processGeneratedUsers( usersCollection:any) {

		let keys:string[];
		let key:any;		

		// process thick: empty collection
		return  userModel.remove({})

		// process thick: create admin(s), poweruser(s), autthor(s), user(s)
		.then( () => {			

			return addressModel.remove({})
			.then( () => Promise.all(				
				usersCollection.map( ( _collection:any) => {	
					let userID:mongoose.Schema.Types.ObjectId;
					key = Object.keys(_collection)[0];			
					let users:IUser[]= _collection[key];					
					return users.map( (user:IUser) => {
						userModel.create(user, true) // create user and return its id
						.then( (id:mongoose.Schema.Types.ObjectId) => {
							userID = id;
							return createAddressObject(userID, 'user');
						})
						.then( (address:IUserAddress) => addressModel.create(address, true) )												
						.catch( (err:Error) => Promise.reject(err) )
					});				
				}))
			)			
			.catch( (err:Error) => Promise.reject(err) )
		});		
	}

	/*****
	 *
	 */
	private static processGeneratedClients( data:any, cName:string) {

		const clients:IClient[]= this.getSubCollection(data, cName);

		return clientModel.remove({})
		.then( () => Promise.all(
			clients.map( (client:IClient) => {
				let clientID:mongoose.Schema.Types.ObjectId;
				clientModel.create(client, true).then( (id:mongoose.Schema.Types.ObjectId) => {
					clientID = id;
					return createAddressObject(clientID, 'client');
				})
				.then( (address:IUserAddress) => addressModel.create(address, true) )				
				.catch((err:Error) => Promise.reject(err) )
			})	
		))
		.catch( (err:Error) => Promise.reject(err))
	}

	/*****
	 *
	 */
	private static processGeneratedCustomers( data:any, cName:string ) {
		let customers:ICustomer[]= this.getSubCollection(data, cName)		
		return customerModel.remove({})
		.then( () => Promise.all(
			customers.map( (customer:ICustomer) => {
				let customertID:mongoose.Schema.Types.ObjectId;
				customerModel.create(customer, true).then( (id:mongoose.Schema.Types.ObjectId) => {
					customertID = id;
					return createAddressObject(customertID, 'customer');
				})
				.then( (address:IUserAddress) => addressModel.create(address, true) )				
				.catch((err:Error) => Promise.reject(err) )
			})
		))
		.catch( (err:Error) => Promise.reject(err))
	}

	private static getSubCollection(data:any, cName:string):any {
		let keys:string[] = Object.keys( data );
		let key:any = keys[0];	
		if( cName === key) { return data[key]; } else { return []; }
	}

	/******
	 * Stores generated data in local MongoDB instance
	 */
	public static storeRemote(data:any) {

		if(!POPULATE_REMOTE_DATABASE)
			return Promise.resolve();

		Promise.all(
			data.map ( (obj:any,key:any) => {
				let keys:string[] = Object.keys(data[key]),
					category:string = keys[0];				

				if(category==='users') {
					this.storeUsersRemote( obj.users );
				
				} else if(category==='defaultClient') {
					this.storeClientsRemote(obj, 'defaultClient')

				} else if(category==='defaultCustomer') {					
					this.storeCustomersRemote(obj, 'defaultCustomer')
				}

			})
		)		
	}

	private static storeUsersRemote( usersCollection:any ) {

		// process thick: delete collection
		return userModel.mlab_deleteCollection( DB_USERS_COLLECTION_NAME  )

		// process thick: insert users per category
		.then( () => {
			return Promise.all(
				usersCollection.map( (_collection:any) => {
					let keys:string[] = Object.keys(_collection),
						key:any = keys[0];
					let collection:IUser[]= _collection[key];						
					return (
						userModel.mlab_insert( 
							DB_USERS_COLLECTION_NAME,  
							collection 
						) 
					)					
				})
			)
			.then( res => Promise.resolve(res) )
			.catch( (err:Error) => Promise.reject(err) );
		})

		// process thick: return to caller
		.then( (res:any) =>  { Promise.resolve(res) })

		// error handling
		.catch( (err:Error) => console.error(err) );	

	}

	private static storeClientsRemote(  data:any, cName:string ) {

		let collection:IClient[]= this.getSubCollection(data, cName)		
		return (
			clientModel.mlab_deleteCollection( DB_CLIENTS_COLLECTION_NAME  )
			.then( () => userModel.mlab_insert( DB_CLIENTS_COLLECTION_NAME, collection ) ) 
			.then( (res:any) => { Promise.resolve(res) })
			.catch( (err:Error) => Promise.reject(err))
		);

	}

	private static storeCustomersRemote( data:any, cName:string ) {

		let collection:ICustomer[]= this.getSubCollection(data, cName)		
		return (
			customerModel.mlab_deleteCollection( DB_CUSTOMERS_COLLECTION_NAME  )
			.then( () => customerModel.mlab_insert( DB_CUSTOMERS_COLLECTION_NAME, collection ) ) 
			.then( (res:any) => { Promise.resolve(res) })
			.catch( (err:Error) => Promise.reject(err))
		);


	}
}