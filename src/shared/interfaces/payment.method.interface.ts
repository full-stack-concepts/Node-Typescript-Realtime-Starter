export interface IPaymentMethod { 

	paymentMethod?: number, 
	provider?: string,
	providerDetails?:string,
	creditCardNumber?:string,
	dateFrom?:string,
	dateTo?:string,
	cardDetails?:string,
}