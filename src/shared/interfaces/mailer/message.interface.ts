/****
 * Modemailer Message Interface
 */
import { IMetadataObj, IEmailAttachment } from "../../interfaces";


export interface IEmailMessage {

	/****
	 * Generic Fields
	 */

	// email address of the sende
	from?: string | IEmailAddress,

	// Comma separated list or an array of recipients email addresses 
	to?:string | string[] | IEmailAddress | IEmailAddress[],

	// Comma separated list or an array of recipients email addresses
	cc?: string | string[] | IEmailAddress | IEmailAddress[],

	// Comma separated list or an array of recipients email addresses
	bcc?: string | string[] | IEmailAddress | IEmailAddress[],

	// subject of email
	subject?: string,

	// Plaintext version of the message as an Unicode string, Buffer, Stream or an attachment-like object
	text?: string,

	// HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object
	html?: string,

	// Array of attachment objects
	attachments?: any,

	/****
	 * Routing options
	 */

	// Email address that will appear on the <Sender> field
	sender?: string,

	//  Email address that will appear on the <Reply-To> field
	replyTo?: string,

	//  Message-ID this message is replying to
	inReplyTo?: string,

	// Message-ID list (an array or space separated string)
	references?: string | string[],

	// Optional SMTP envelope, if auto generated envelope is not suitable (see SMTP envelope for details)
	envelope?:any,

	/****
	 * Content Optioons
	 */

	// if true then convert data: images in the HTML content of this message to embedded attachments
	attachDataUrls?: boolean,
	

	// Identifies encoding for text/html strings (defaults to ‘utf-8’, other values are ‘hex’ and ‘base64’)
	encoding?:string,

	// existing MIME message to use instead of generating a new one.
	raw?: string,

	// Force content-transfer-encoding for text values
	textEncoding?: any,

	/****
	 * Header Options
	 */

	// Sets message importance headers, either ‘high’, ‘normal’ (default) or ‘low’.
	priority?: string,

	// An object or array of additional header fields
	headers?: any,

	// Optional Message-Id valu
	messageId?: string,

	// Optional Date value, current UTC string will be used if not set
	date?: Date,

	// Helper for setting List
	list?: any,

	/****
	 * Security options
	 */

	// if true, then does not allow to use files as content. Use it when you want to use JSON data from untrusted source as the email.
	disableFileAccess?: boolean,

	// If true, then does not allow to use Urls as content. If this field is also set in the transport options, then the value in mail data is ignored
	disableUrlAccess?: boolean	


}

export interface IEmailAddress {
	name: string,
	address: string,
}