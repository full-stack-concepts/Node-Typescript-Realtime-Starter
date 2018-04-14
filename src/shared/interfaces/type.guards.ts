/***
 * Tyoe Guards
 */

export function isOfPersonType(person:IPerson | IUser | IClient | ICustomer):person is IPerson {
	return (<IPerson>person).person !== undefined;
}

export function isOfUserType(user:IPerson | IUser | IClient | ICustomer):person is IUser {
	return (<IUser>user).user !== undefined;
}

export function isOfClientType(person:IPerson | IUser | IClient | ICustomer):person is IClient {
	return (<IClient>person).client !== undefined;
}

export function isOfCustomerType(person:IPerson | IUser | IClient | ICustomer):person is ICustomer {
	return (<ICustomer>person).customer !== undefined;
}

export default {
	isOfPersonType
}

