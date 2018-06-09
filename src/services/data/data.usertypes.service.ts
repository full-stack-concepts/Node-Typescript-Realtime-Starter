/****	*******************
 * Support db operations class generated
 * @users
 * @clients
 * @customers
 */
import fetch from "node-fetch";

import { 
	IUser, 
	IClient, 
	ICustomer 
} from "../../shared/interfaces";

import { 
	userModel, UserModel, 
	clientModel, ClientModel, 
	customerModel, CustomerModel
} from "../../shared/models";

import {
	POPULATE_LOCAL_DATABASE,
	POPULATE_REMOTE_DATABASE,
	DB_USERS_COLLECTION_NAME,
	DB_CLIENTS_COLLECTION_NAME,
	DB_CUSTOMERS_COLLECTION_NAME 
} from "../../util/secrets";


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
					UserTypes.processGeneratedClients(obj, 'defaultClient')

				} else if(category==='defaultCustomer') {					
					UserTypes.processGeneratedCustomers(obj, 'defaultCustomer')
				}
			})

		)
		.then( () => {return Promise.resolve(); })
		.catch( (err:any) => console.error(err) );
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

		// process thick: empty collection
		return  userModel.remove({})

		// process thick: create admin(s), poweruser(s), autthor(s), user(s)
		.then( () => {
			return Promise.all(				
				usersCollection.map( ( _collection:any) => {	

					let keys:string[] = Object.keys(_collection),
						key:any = keys[0];
					let collection:IUser[]= _collection[key];						

					userModel.insert( collection );
				})
			)
			// process thick: return to caller
			.then( () =>  Promise.resolve() )

			// error handler
			.catch( (err:any) => Promise.reject(err) )
		});
		
	}

	/*****
	 *
	 */
	private static processGeneratedClients( data:any, cName:string) {

		let collection:IClient[]= this.getSubCollection(data, cName)		
		return (
			clientModel.remove({})
			.then( () => clientModel.insert( collection ) )
			.then( () => Promise.resolve())
			.catch( (err:any) => Promise.reject(err))
		);
	}

	/*****
	 *
	 */
	private static processGeneratedCustomers( data:any, cName:string ) {
		let collection:ICustomer[]= this.getSubCollection(data, cName)		
		return ( 
			customerModel.remove({})
			.then( () => customerModel.insert( collection ) )
			.then( () => Promise.resolve())
			.catch( (err:any) => Promise.reject(err))
		)
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
			.catch( (err:any) => Promise.reject(err) );
		})

		// process thick: return to caller
		.then( (res:any) =>  { Promise.resolve(res) })

		// error handling
		.catch( (err:any) => console.error(err) );	

	}

	private static storeClientsRemote(  data:any, cName:string ) {

		let collection:IClient[]= this.getSubCollection(data, cName)		
		return (
			clientModel.mlab_deleteCollection( DB_CLIENTS_COLLECTION_NAME  )
			.then( () => userModel.mlab_insert( DB_CLIENTS_COLLECTION_NAME, collection ) ) 
			.then( (res:any) => { Promise.resolve(res) })
			.catch( (err:any) => Promise.reject(err))
		);

	}

	private static storeCustomersRemote( data:any, cName:string ) {

		let collection:ICustomer[]= this.getSubCollection(data, cName)		
		return (
			customerModel.mlab_deleteCollection( DB_CUSTOMERS_COLLECTION_NAME  )
			.then( () => customerModel.mlab_insert( DB_CUSTOMERS_COLLECTION_NAME, collection ) ) 
			.then( (res:any) => { Promise.resolve(res) })
			.catch( (err:any) => Promise.reject(err))
		);


	}
}