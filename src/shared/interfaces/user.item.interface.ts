export interface IUserSecurity {
	latestLogon?: boolean,
	latestModification?: Date,
	accountType?:number,
	isAccountVerified?: boolean,
	isTemporaryPassword?: boolean,
	isPasswordEncrypted?: boolean
}

export interface IUserJob  {
	jobDescription:string
}

export interface IUserPersonalia {
	givenName:string,
	middleName?:string,
	familyName:string
}

export interface IUserDisplayNames {
	fullName?:string,
	sortName?:string
}

export interface IUserAddress {
	userID?:any,
	clientID?:any,
	customerID?:any,
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
	addressLine3?:string,
	location?:{
		longitude?:number,
		latitude?:number,
		placeID?:string
	},
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

export interface IUserImages {
	img?: string,
	thumbnail?:string,
	avater?:string
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

export interface IUserCompany {

	// company name
	name?: string,
	// organizational type
	type?: string,
	// company slogan	
	slogan?:string,
	// sub slogam
	subSlogan?:string,
	// job title
	jobTitle?:string,
	// job yype
	jobType?:string,

	address?: {
		street?:string,
		houseNumber?:string,
		suffix?:string,
		addition?:string,
		areacode?:string,
		city?:string,
		county?:string,	
		country?:string,
		countryCode?:string,
		addressLine1?:string,
		addressLine2?:string,
		addressLine3?:string
	},

	communication?: {
		companyPhone?: string,
		companyEmail?: string,
		companyWebsite?: string
	},

	social?: {
		facebook?:string,
		twitter?:string
	}
}



		

	


