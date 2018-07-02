import { SYSTEM_ADMIN_EMAIL } from "../../util/secrets";
import { ISystemTemplateData } from "../../shared/interfaces";
import { tsFormatter, timestampToString, deepCloneObject } from "../../util";


/****
 * Email TEMPLATE Data Formats
 */

export var TemplateDataDefinitions:Object;

/****
 * Our own implementation of Typescrips's enum so we can add objects
 */

(function templateDataDefinitions( TemplateDataDefinitions) {

	/****
	 *
	 */
	const systemTemplateData:ISystemTemplateData = {
		date: timestampToString(),
		time: tsFormatter(),
		email: SYSTEM_ADMIN_EMAIL
	};

	/****
	 *
	 */
	const defaultSystemData:ISystemTemplateData = {
	 	section: null,
		eventID: null,
		environment:null,
		message:null,
	};

	/****
	 * Default Data Definition: Bootstrap Sequence Finished
	 */
	TemplateDataDefinitions[TemplateDataDefinitions["bootstrap.sequence.finished"] = 0] = 
		Object.assign(systemTemplateData, defaultSystemData);		

	console.log(" *** TemplateDefinitions 1")
	console.log(TemplateDataDefinitions)


}) (TemplateDataDefinitions || (TemplateDataDefinitions = {}))




