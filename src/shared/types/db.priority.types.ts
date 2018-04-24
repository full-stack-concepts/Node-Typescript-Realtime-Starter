import { IDatabasePriority } from "../interfaces/";

export const TDBP_local:IDatabasePriority = {
	type: 1,
	host: 'local',
	use: false
}

export const TDBP_mlab:IDatabasePriority = {
	type: 2,
	host: 'mlab',
	use: false
}

