/****
 *
 */
export interface IEmailSMTPOptions {

	/****
	 * Mail Provider
	 */
	service?:string,

	/****
	 * Generic Options
	 */
	port?: number,
	host?: string,
	auth?: IEmailAuthentication,
	authMethod?: string,

	/****
	 * TLS Options
	 */
	secure?: boolean,
	tls?: any,
	ignoreTLS?: boolean,
	requireTLS?:boolean,

	/****
	 * Connection Options
	 */
	name?: string,
	localAddress?: any,
	connectionTimeout?: number,
	greetingTimeout?: number,
	socketTimeout?: number,

	/****
	 * Debug Options
	 */
	logger?: any,
	debug?: boolean,

	/****
	 * Pooling Options
	 */
	pool?: any,

	/****
	 * Proxy Options
	 */
	proxy?: any

}

/****
 *
 */
export interface IEmailSMTPDefaults {


}

/****
 *
 */
export interface IEmailAuthentication {
	type?: string,
	user: string,
	pass: string
}