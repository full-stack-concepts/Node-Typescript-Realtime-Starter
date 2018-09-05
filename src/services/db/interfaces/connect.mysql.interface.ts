/***
 * Account Interface for any default MtSQL Connection
 */

export interface ISQLAccount {
	
	// The hostname of the database you are connecting to (default: localhost)
	host: string,

	// Port number to connect to (default: 3306)
	port: number,

	// Source IP address to use for TCP connection (optional)
	localAddress?: string,

	// Path to a unix domain socket to connect to. When used host and port are ignored.
	socketPath?: string,

	// MySQL user to authenticate as.
	user: string,

	//  Password of that MySQL user.
	password: string,

	// Name of the database to use for this connection (optional).
	database?: string,

	// Charset or collation for the connection (default: UTF8_GENERAL_CI)
	charset?: string,

	// Timezone configured on the MySQL server. This is used to type cast server date/time values to JavaScript Date object and vice versa. This can be local, Z, or an offset in the form +HH:MM or -HH:MM. (default: local)
	timezone?: string,

	// Milliseconds before a timeout occurs during the initial connection to the MySQL server (default: 10000)
	connectTimeout?: number,

	// Stringify objects instead of converting to values. 
	stringifyObjects?: boolean,

	// Allow connecting to MySQL instances that ask for the old (insecure) authentication method (default: false)
	insecureAuth?: boolean,

	// prints protocol details to stdout (default: false)
	debug?: boolean,

	// object with ssl parameters or a string containing name of ssl profile
	ssl: Object
	
}
