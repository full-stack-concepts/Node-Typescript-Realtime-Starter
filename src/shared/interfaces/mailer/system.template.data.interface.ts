export interface ISystemTemplateData {
	from?: string,
	sender?: string,
	replyTo?: string,
	to?: string,
	date?: string,
	time?: number,
	email?: string,
	subject?:string,
	application?:string,
	section?:string | undefined,
	environment?:string | undefined,
	eventID?:number | undefined,
	message?:string | undefined,
	error?:string | undefined
}