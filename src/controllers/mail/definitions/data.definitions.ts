import { 
	SYSTEM_ADMIN_EMAIL,
	APPLICAION_NAME
} from "../../../util/secrets";

import { ISystemTemplateData } from "../../../shared/interfaces";
import { tsFormatter, timestampToString, deepCloneObject } from "../../../util";

/****
 * Message Type Identifiers
 */
import {
	SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED
} from "../identifiers/message.identifiers";


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
		email: SYSTEM_ADMIN_EMAIL,
		application: APPLICAION_NAME
	};

	/****
	 *
	 */
	const defaultSystemData:ISystemTemplateData = {
		from: SYSTEM_ADMIN_EMAIL,
		sender: SYSTEM_ADMIN_EMAIL,
		replyTo: SYSTEM_ADMIN_EMAIL,
		to:SYSTEM_ADMIN_EMAIL,
	 	section: SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED.section,
		eventID: SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED.eventID,
		environment: SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED.environment,
		subject: SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED.subject,
		message: SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED.message
	};

	/****
	 * Default Data Definition: Bootstrap Sequence Finished
	 */
	TemplateDataDefinitions[TemplateDataDefinitions[SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED.identifier] = 0] = 
		Object.assign(systemTemplateData, defaultSystemData);		

	console.log(" *** TemplateDefinitions 1")
	console.log(TemplateDataDefinitions)


}) (TemplateDataDefinitions || (TemplateDataDefinitions = {}))




