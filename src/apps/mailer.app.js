const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const validator = require("validator");
const render = require("jsrender");
// const secrets = require("../util/secrets.ts");

/******
 * When testing with a gmail account do 
 * (1) enable IMAP
 * (2) allow access to less secure apps (https://myaccount.google.com/lesssecureapps?pli=1)
 */


class Emailer {	
	
	constructor() {		

		this.transporter;
		this.smtpOptions;
		this.defaultMessage;
		this.message;

		this.setDefaultSmtpOptions();
		this.setDefaultMessage();
	}

	/***
	 *
	 */
	setDefaultSmtpOptions() {

        this.smtpOptions = {
            service: 'gmail',
            auth: {
                user: process.env["SMTP_AUTH_USER"],
                pass: process.env["SMTP_AUTH_PASSWORD"]
            },     
            secure: process.env["SMTP_SECURE"],
            ingnoreTLS: process.env["SMTP_IGNORE_TLS"],
            requireTLS: process.env["SMTP_REQUIRE_TLS"]          

         
        };
    }
	/***
	 *
	 */
	setDefaultMessage() {
        this.defaultMessage = {
            "from": process.env["MAILER_DEFAULT_FROM_ADDRESS"]
        };
    }

	/***
	 *
	 */
	 __unescapeHTML(template) {
        return validator.unescape(template.toString());
    }

	/***
	 * Transporter
	 */
	createTransporter() { 
		let err;
		try {          
		 	this.transporter = nodemailer.createTransport(
		 		smtpTransport(this.smtpOptions)
		 	);	
		}
		catch(e) { err = e; }
		finally {
			return new Promise( (resolve, reject) => {
				(err)?reject(err):resolve();
			});
		}		
	}

	/***
	 * (1) Unescape Sprintf template
     * (2) Validate HTML template    
	 */
	testTemplate(html) {
        return new Promise((resolve, reject) => {
            let HTML = this.__unescapeHTML(html);
            (typeof (HTML) === 'string') ? resolve() : reject('<errorNumber>');
        });
    }

	/***
	 * Verify SMTO Transport configuration
	 */
	verifyTransport() {
        return new Promise((resolve, reject) => {
            this.transporter.verify((err, success) => {
                (err) ? reject(err) : resolve();
            });
        });
    }

	/***
	 * Merge message
	 */
	merge(message) {

        let err;
        try { this.message = Object.assign(this.defaultMessage, message); }
        catch (e) { 
            err = e;
        }
        finally {
            return new Promise((resolve, reject) => {
                (err) ? reject('errorNumber') : resolve(true);
            });
        }
    }

	/***
	 * Send mail
	 */	
	sendEmail() {
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(this.defaultMessage, (err, result) => {
                (err) ? reject(err) : resolve({ result });
            });
        });
    }

	/***
	 * Public interfaces
	 */	
    process(message) {

        console.log("*** Send new Email")

        // (1) process thick: create smtp transporter
        this.createTransporter();
        
        // (2) process thick: test & validate template
        return this.testTemplate(message.html)
            
        // (3) process thick: merge message with default message
        .then(() => this.merge(message))
        
        // (4) process thick: verify connection to provider
        .then(() => this.verifyTransport())
        
        // (5) process thick: send email
        .then(() => this.sendEmail())
        
        // (6) return to caller
        .then(({ info }) => Promise.resolve(info))
        
        .catch((err) => {
        	console.error(err);
        	return Promise.reject(err);
   	 	});
    }

	/****
	 * Verify SMTP Transporter
	 */
	verify() {       
		
        return this.createTransporter()
		.then( () => {        
            return this.verifyTransport()
        })
        .then( () =>  {
            return Promise.resolve()
        }) 
		.catch( (err) => {
            console.log(err)
            return Promise.reject(err);		
        })
	}
}

const respondWithError = (queueID, messageId, email, error) => {    
    console.log("(2) Error ", error)
    process.send({ queueID: queueID,  messageId: messageId, status: false, trace: error.stack, message:error.message, email: email });
};
const respondWithSuccess = (queueID, messageId, email) => {
    process.send({ queueID: queueID, messageId: messageId, email: email, status:true });
};
const respondWithErrorToController = (queueID, controllerRequest, error) => {
    process.send({ queueID: queueID, controllerRequest: controllerRequest, trace: error.stack, message: error.message, status: false });
};
const respondWithSuccessToController = (queueID, controllerRequest, message) => {
    process.send({ queueID: queueID, controllerRequest: controllerRequest, status: true });
};

/***
 * Process Event Listener: Message
 */
process.on('message', ({queueID, email, controllerRequest, }) => {

    const emailer = new Emailer();
    let error;
    let finalResult;

    /***
     * Execute Controller Request
     */    
    if (controllerRequest) {
        executeControllerRequest(queueID, controllerRequest);    

    /***
     * Send Email
     */
    } else {
        try {          
            const { result } = emailer.process(email);
            finalResult = result;
        }
        catch (e) {
            error = e;
        }
        finally {           
            if (error)
                respondWithError(queueID, email.messageId, email, error || error.stack);
            if (!error)
                respondWithSuccess(queueID, email.messageId, email);
        }
    }
});

/***
 * Controller Request
 */
const executeControllerRequest = (id, controllerRequest) => {	
  
    const emailer = new Emailer();
    let error;
    switch (controllerRequest) {

        case 'verify':        
            emailer.verify()
            .then( () => {                
                return respondWithSuccessToController(id, controllerRequest);            
            })
            .catch( (err) => {            
            	return respondWithSuccessToController(id, controllerRequest, err);
            });                  
            break;

        default: 
        	respondWithSuccessToController(controllerRequest);
            break;
    }
}
	





 	


	



