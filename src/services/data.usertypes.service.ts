/****	*******************
 * Support db operations class generated
 * @users
 * @clients
 * @customers
 */

import { 
	IUser, 
	IClient, 
	ICustomer 
} from "../shared/interfaces";

import { 
	UserModel, 
	ClientModel, 
	CustomerModel
} from "../shared/models";


export class UserTypes {

	/******
	 * @userCollection is an object  {
	 * superadmin: IUser[],
	 * admin: IUser[],
	 * poweruser: IUser[],
	 * author: IUser[],
	 * user: IUser
	 * }
	 */
	public static processGeneratedUsers( usersCollection:any) {

		console.log("==> Add generated users")
		console.log(usersCollection)

		// process thick: empty collection
		return  UserModel.remove({})

		// process thick: create admin(s), poweruser(s), autthor(s), user(s)
		.then( () => {
			return Promise.all(				
				usersCollection.map( ( _collection:any) => {	

					let keys:string[] = Object.keys(_collection),
						key:any = keys[0];
					let collection:IUser[]= _collection[key];					

					UserModel.createUsers( collection );
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
	public static processGeneratedClients( data:any, cName:string) {

		let collection:IClient[]= this.getSubCollection(data, cName)		
		return (
			ClientModel.remove({})
			.then( () => ClientModel.insert( collection ) )
			.then( () => Promise.resolve())
			.catch( (err:any) => Promise.reject(err))
		);
	}

	/*****
	 *
	 */
	public static processGeneratedCustomers( data:any, cName:string ) {
		let collection:ICustomer[]= this.getSubCollection(data, cName)		
		return ( 
			CustomerModel.remove({})
			.then( () => CustomerModel.insert( collection ) )
			.then( () => Promise.resolve())
			.catch( (err:any) => Promise.reject(err))
		)
	}

	private static getSubCollection(data:any, cName:string):any {
		let keys:string[] = Object.keys( data );
		let key:any = keys[0];	
		if( cName === key) { return data[key]; } else { return []; }
	}


}