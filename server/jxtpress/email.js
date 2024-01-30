import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({ 
    host : process.env.APP_EMAIL_HOST,
    port: process.env.APP_EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.APP_EMAIL_USER,
        pass: process.env.APP_EMAIL_PASSWORD
    }
}) 

class Email {
    /**
     * Sends and email using the environment configuration setup for nodemailer
     * @param {Object} options { to , cc, bcc, subject, body|html, from : optional }
     * @returns Object
     */
    async send (options){ 
        let log = (... args )=>{
            console.log (...args )
        }
        return new Promise ( (resolve,reject)=>{
            if ( ! options) {
                log("Email.options_missing");
                return reject(new Error("Options is missing")) 
            }
            //Verify required fields 
            var opt_errors = [];
            if ( ! options.from ) options.from = process.env.APP_EMAIL_DEFAULT || process.env.APP_EMAIL_USER
            
            if ( ! options.to     )     opt_errors.push("\"to\" field is missing")
            if ( ! options.subject) opt_errors.push("\"subject\" field is missing")
            if ( ! options.html && ! options.body)    opt_errors.push("\"html\" field is missing");
            if ( opt_errors.length > 0) {
                reject(opt_errors);
                return; 
            }
            options.html = options.html || options.body 
            
            let to = (val)=>{ //Used to ensure that to,cc,bcc are propery formated
                if ( Array.isArray(val)){
                    for(var i=0; i < val.length; i++) val[i] = val[i].trim()
                    return val.join(",")
                }else {
                    return val.trim();
                }
            }
            options.to = to(options.to);
            if ( options.cc) options.cc = to(options.cc);
            if ( options.bcc) options.bcc = to(options.bcc);

            // Check the connection to the service.
            log("Email.checking_connection")
            transporter.verify(function(error, success) {
                if (error) {  
                    log("Email.verification_error", error);
                    return reject(error); 
                } else {    
                    log ("Email.sending . .")
                    transporter.sendMail( options, (err, info)=>{
                        if ( err){ 
                            log("Email.send_error")
                            return reject(err); 
                        }else { 
                            log ("\tEmail.delivered")
                            return resolve(info);
                        }
                    })
                }
            });// End of Verify
        })//End of promise 
    }
}

let email = new Email()
export default email