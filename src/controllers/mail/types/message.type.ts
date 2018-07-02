import {
	IEmailMessage
	} from "../../../shared/interfaces";


export const TEmailMessage:any =  {

	messageId: null,

	from: null,

	// Comma separated list or an array of recipients email addresses 
	to: null,

	// Comma separated list or an array of recipients email addresses
	cc: null,

	// Comma separated list or an array of recipients email addresses
	bcc: null,

	subject: null,

	// HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object
	html: null,

	// Email address that will appear on the <Sender> field
	sender: null,

	//  Email address that will appear on the <Reply-To> field
	replyTo: null,

	// if true, then does not allow to use files as content. Use it when you want to use JSON data from untrusted source as the email.
	disableFileAccess: false,

	// If true, then does not allow to use Urls as content. If this field is also set in the transport options, then the value in mail data is ignored
	disableUrlAccess: false	




}