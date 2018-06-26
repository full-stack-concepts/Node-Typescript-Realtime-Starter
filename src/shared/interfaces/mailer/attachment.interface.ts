import { IMetadataObj } from "../../interfaces"

export interface IEmailAttachment {


	// Filename to be reported as the name of the attached file. Use of unicode is allowed.
	filename?: string,

	// String, Buffer or a Stream contents for the attachment
	content?: string | Buffer,

	// Path to the file if you want to stream the file instead of including it (better for larger attachments)
	path?: string,

	// URL to the file (data uris are allowed as well) new URL()
	href?: URL,

	// Optional content type for the attachment, if not set will be derived from the filename property
	contentType?: string,

	// Optional content disposition type for the attachment, defaults to ‘attachment’
	contentDisposition?: any,

	// Optional content id for using inline images in HTML message source
	cid?: string,

	// If set and content is string, then encodes the content to a Buffer using the specified encoding.
	encoding?: string,

	// Custom headers for the attachment node. Same usage as with message headers
	headers?: IMetadataObj | IMetadataObj[],

	// Optional special value that overrides entire contents of current mime node including mime headers
	raw?:any

}