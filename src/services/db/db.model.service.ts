import { 
	Observable, 
	BehaviorSubject
} from "rxjs";

/****
 * Settings
 */
import { 
	PERSON_SUBTYPE_SYSTEM_USER,
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER,
	USE_PERSON_SUBTYPE_USER, 
	USE_PERSON_SUBTYPE_CLIENT, 
	USE_PERSON_SUBTYPE_CUSTOMER,
	DB_SYSTEM_USERS_COLLECTION_NAME,
	DB_USERS_COLLECTION_NAME,
	DB_CLIENTS_COLLECTION_NAME,
	DB_CUSTOMERS_COLLECTION_NAME
} from "../../util/secrets";


/****
 * Interfaces
 */
import { IDatabasePriority} from "../../shared/interfaces";

/****
 * Import all User SubType Read Models 
 */
import { 
	systemUserReadModel,   
	userReadModel, 
	clientReadModel,
	customerReadModel
} from "../../shared/models";

/****
 * Improt Person Subtype Write Models
 */
import {
	systemUserModel,   
	userModel, 
	clientModel,
	customerModel
} from "../../shared/models";

interface IModelSetting {
	model:any,
	type: string,
	collection:string
}

/****
 * Import all Product Models
 */
// #TODO: import product models


class DBModelService {

	public readModels:IModelSetting[]= [];;	
	public writeModels:IModelSetting[]= [];;	

	// all conncurrent posts
    private databaseReadModelsSubject:BehaviorSubject<IModelSetting[]> = new BehaviorSubject<IModelSetting[]>([]);
    public readModels$: Observable<IModelSetting[]> = this.databaseReadModelsSubject.asObservable();

    private databaseWriteModelsSubject:BehaviorSubject<IModelSetting[]> = new BehaviorSubject<IModelSetting[]>([]);
    public writeModels$: Observable<IModelSetting[]> = this.databaseWriteModelsSubject.asObservable();

	constructor() {	

		// READ models
		this.configurePersonReadModels();

		// WRITE models
		this.configurePersonWriteModels();
	}

	/*****************************************************************
	 * Push a Person Subtype Model in our models array
	 * if setting is set to true: settings:	
	 */

	private configurePersonReadModels():void {

		this.readModels.push({
			model: systemUserReadModel, 
			type: PERSON_SUBTYPE_SYSTEM_USER, 
			collection: DB_SYSTEM_USERS_COLLECTION_NAME 
		})
		
		this.readModels.push({ 
			model: userReadModel, 
			type: PERSON_SUBTYPE_USER, 
			collection: DB_USERS_COLLECTION_NAME 
		});
				
		this.readModels.push({ 
			model: clientReadModel, 
			type: PERSON_SUBTYPE_CLIENT, 
			collection: DB_CLIENTS_COLLECTION_NAME 
		});
				
		this.readModels.push({ 
			model: customerReadModel, 
			type: PERSON_SUBTYPE_CUSTOMER, 
			collection: DB_CUSTOMERS_COLLECTION_NAME 
		});		
		

		// broadcast models array
		this.databaseReadModelsSubject.next(this.readModels);
	}

	private configurePersonWriteModels():void {

		this.writeModels.push({
			model: systemUserModel, 
			type: PERSON_SUBTYPE_SYSTEM_USER, 
			collection: DB_SYSTEM_USERS_COLLECTION_NAME 
		})
		
		this.readModels.push({ 
			model: userModel, 
			type: PERSON_SUBTYPE_USER, 
			collection: DB_USERS_COLLECTION_NAME 
		});
				
		this.readModels.push({ 
			model: clientModel, 
			type: PERSON_SUBTYPE_CLIENT, 
			collection: DB_CLIENTS_COLLECTION_NAME 
		});
				
		this.readModels.push({ 
			model: customerModel, 
			type: PERSON_SUBTYPE_CUSTOMER, 
			collection: DB_CUSTOMERS_COLLECTION_NAME 
		});		

		// broadcast models array
		this.databaseWriteModelsSubject.next(this.writeModels);
	}
}

export const dbModelService = new DBModelService();