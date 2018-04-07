import faker from "faker";
import Promise from "bluebird";
import { IUser } from "../shared/interfaces";
import { UserModel} from "../shared/models";

import { RemoteQueryBuilder } from "../util";
import { IListOptions} from "../shared/interfaces";

/***
 * Import DB Population Settings
 */
import {	
	DB_POPULATE,
	DB_POPULATE_SAFETY_FIRST,
	DB_POPULATE_ADMINS,
	DB_POPULATE_POWER_USERS,
	DB_POPULATE_AUTHORS,
	DB_POPULATE_USERS
} from "../util/secrets";

/***
 * Import SuperAdminCredentials
 */
import {
	SUPERADMIN_FIRST_NAME,
	SUPERADMIN_LAST_NAME,
	SUPERADMIN_EMAIL,
	SUPERADMIN_PASSWORD
} from "../util/secrets";

export class DataBreeder {

	private createSuperAdmin() {

	}

	private createAdmin() {
	}

	private createPowerUser() {}

	private createAuthor() {}

	private createUser() {}

	public test() {

		let options:IListOptions = {collection:'users'};
		let url:string = RemoteQueryBuilder.list(options);
		console.log(url);
	}
   
};

export const populateDatabase = () => {
	let instance:any = new DataBreeder()
	instance.test();
}

