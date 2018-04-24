import { 
	Observable, 
	BehaviorSubject
} from "rxjs";

/****
 * Settings
 */
import { 
	PERSON_SUBTYPE_USER,
	PERSON_SUBTYPE_CLIENT,
	PERSON_SUBTYPE_CUSTOMER,
	USE_PERSON_SUBTYPE_USER, 
	USE_PERSON_SUBTYPE_CLIENT, 
	USE_PERSON_SUBTYPE_CUSTOMER,
	DB_USERS_COLLECTION_NAME,
	DB_CLIENTS_COLLECTION_NAME,
	DB_CUSTOMERS_COLLECTION_NAME
} from "../util/secrets";


/****
 * Interfaces
 */
import { IDatabasePriority} from "../shared/interfaces";

/****
 * Import all User SubTyoe Models 
 */
import { UserModel,  ClientModel,  CustomerModel } from "../shared/models";

interface IModelSetting {
	model:any,
	type: string,
	collection:string
}

/****
 * Import all Product Models
 */
// #TODO: import product models


export class DBModelService {

	public models:IModelSetting[]=  [];;	

	// all conncurrent posts
    private databaseModelsSubject:BehaviorSubject<IModelSetting[]> = new BehaviorSubject<IModelSetting[]>([]);
    public models$: Observable<IModelSetting[]> = this.databaseModelsSubject.asObservable();

	constructor() {	
		this.configurePersonModels();
	}

	/*****************************************************************
	 * Push a Person Subtype Model in our models array
	 * if setting is set to true: settings:
	 * @USE_PERSON_SUBTYPE_USER:boolean
	 * @USE_PERSON_SUBTYPE_CLIENT:boolean
	 * @USE_PERSON_SUBTYPE_CUSTOMER:boolean
	 */

	private configurePersonModels() {

		if(USE_PERSON_SUBTYPE_USER) {			
			this.models.push({ 
				model: UserModel, 
				type: PERSON_SUBTYPE_USER, 
				collection: DB_USERS_COLLECTION_NAME 
			});
		}

		if( USE_PERSON_SUBTYPE_CLIENT ) {			
			this.models.push({ 
				model: ClientModel, 
				type: PERSON_SUBTYPE_CLIENT, 
				collection: DB_CLIENTS_COLLECTION_NAME 
			});		
		}

		if( USE_PERSON_SUBTYPE_CUSTOMER ) {			
			this.models.push({ 
				model: CustomerModel, 
				type: PERSON_SUBTYPE_CUSTOMER, 
				collection: DB_CUSTOMERS_COLLECTION_NAME 
			});		
		}

		// broadcast models array
		this.databaseModelsSubject.next(this.models);
	}
}

