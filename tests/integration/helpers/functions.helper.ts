/****
 * Deep Clone Instance
 */
export const deepCloneInstance = ( instance:Function):Function => {

	console.log(instance)

	if(typeof(instance) != 'object') {
		console.error("Data Error: Instance to clone is not a instance of object type.")
		process.exit(1);
	}

	return Object.assign( 
		Object.create( 
			Object.getPrototypeOf(instance)
	), instance );	
}