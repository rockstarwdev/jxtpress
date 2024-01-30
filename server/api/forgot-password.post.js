import db from '../jxtpress/db'
import core from '../jxtpress/core'
import plugin from '../jxtpress/plugin'
import users from '../jxtpress/users'

/**
 * The user is on the frontend /forgot-password pad and has entered their email for where their password reset will be sent.
 * 
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event) 
     

    var user = await users.forgot_password(body);
    if ( ! user ) { 
      return  { d : false , msg : "An email as been sent to your email."}
    }

    return {
      d :  true, 
      msg: "Thank you.  An email with a link to reset your password has been sent.  Please check your email."
    }
  })