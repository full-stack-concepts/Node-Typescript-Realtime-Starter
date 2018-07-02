import { 
	ENVIRONMENT
} from "../../../util/secrets";


export const SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED = {
	section: 'core',
	identifier: "system.bootstrap.sequence.finished",
	eventID: 1050,
	environment: ENVIRONMENT,
	subject: 'Application State',
	message: "System Bootstrap sequence finalized successfully. This may have been caused by an uncaught error. Please check your error log to trace any stack errors."
}

export const SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED_EMAIL:string = SYSTEM_BOOTSTRAP_SEQUENCE_FINISHED.identifier;