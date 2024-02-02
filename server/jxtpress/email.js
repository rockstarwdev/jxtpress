import nodemailer from "nodemailer"
import core from "./core"
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

        return new Promise ( async (resolve,reject)=>{
            if ( ! options) {
                log("Email.options_missing");
                return reject(new Error("Options is missing")) 
            }
            //Verify required fields 
            var opt_errors = [];
            
            
            var email_settings = await core.get_options({ like : "site_email"})
            var get_val = (name, val =null )=>{
                var prop = email_settings.find(it => it.name == name ) ;
                if ( ! prop ) return val; 
                val = prop.value || val 
                return val; 
            }
            var email_address   = get_val("site_email")
            var email_password  = get_val("site_email_password_secret")
            var email_host      = get_val("site_email_host")
            var email_host_port = get_val("site_email_host_port");
            console.log ({email_address,email_password,email_host_port, email_host})
            const transporter = nodemailer.createTransport({ 
                host : email_host,
                port: email_host_port, secure: true,
                auth: { user: email_address, pass: email_password }
            }) 

            if ( ! options.from     ) options.from = email_address
            if ( ! options.to       ) opt_errors.push("\"to\" field is missing")
            if ( ! options.subject  ) opt_errors.push("\"subject\" field is missing")
            if ( ! options.html && ! options.body)    opt_errors.push("\"html\" field is missing");
            if ( opt_errors.length > 0) {
                reject(opt_errors); return; 
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