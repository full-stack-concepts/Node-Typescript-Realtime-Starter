import faker from "faker";

export const createSuperAdmin = ( amount:number) => {
	return Promise.resolve({ 'superadmin': [] });
}

export const createAdmin = (amount:number) => {
	return Promise.resolve({ 'admins': [] });
}

export const createPowerUser = (amount:number) => {
	return Promise.resolve({ 'powerusers': [] });
}

export const createAuthor = (amount:number) => {
	return Promise.resolve({ 'authors': [] });
}

export const createUser = (amount:number) => {
	return Promise.resolve({ 'users': [] });
}