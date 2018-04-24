export interface IConnection{
	host: string, 
	user: string,
	password: string,
	port: string,
	db: string
}

export interface IDatabasePriority {	
	type: number,
	host: string,
	use: boolean
}
