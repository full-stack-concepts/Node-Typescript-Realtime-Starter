export interface IError {
	dataType?: string,
	action?: string,
	provider?: string,
	number: number,
	message: string,
	stack?:string
}