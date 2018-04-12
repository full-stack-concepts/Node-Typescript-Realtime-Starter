export interface IUserJob  {
	jobDescription:string
}

export interface IUserAddress {
	street?:string,
	houseNumber?:string,
	suffix?:string,
	addition?:string,
	areacode?:string,
	city?:string,
	county?:string,
	countyCode?:string,
	country?:string,
	countryCode?:string,
	addressLine1?:string,
	addressLine2?:string,
	addressLine3?:string
}

export interface IUserCommunication {
	phone?: string,
	mobile?:string,
	website?:string,
	email?:string
}

export interface IUserSocial {
	googleplus?: string,
	facebook?:string,
	linkedin?:string,
	twitter?:string,
	instagram?:string,
	stackoverflow?:string
}

export interface IUserImage {
	img?: string
}

export interface IUserAccessControl {
	role?:number
}

export interface IUserShortList {
	id?: string,
	name?: string,
	url?: string,
	role?: number
}

export interface IUserStatus {
	archive?: boolean
}

export interface IUserItemErrors {
	job?:string,
	address?:string,
	communication?:string,
	social?:string,
	img?:string,
	accessControl?:string,
	archive?:string
}

export interface IUserDevice {
	location?:string,
	ipType?:string,
	ipAddress?:string,
	ip6Address?:string,
	userAgent?:string,
	macAddress?:string,
	protocol?:string
}


	


