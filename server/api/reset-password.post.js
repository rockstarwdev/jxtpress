import db from '../jxtpress/db'
import core from '../jxtpress/core'
import plugin from '../jxtpress/plugin'
import users from '../jxtpress/users' 

/**
 * The user is needing to reset their password.  Endpoint will validated a reset token or validated the previous password and determine
 * if the user can set a new password or not.  From the frontend, user can change password by providing a new password and providing their 
 * reset token, sent to them via email.  Fron the admin pages, user can change password by providing their old password and new password.
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event) 
     

    
    let user                = event.user;
    if (user )  body.user_id = user.id;
    
    if ( ! body.new_password ) {
        return { d : false, msg : "Invalid new password provided"}
    }
    
    var ret = null;
    
    try { 
        ret = await users.reset_password(body);
    }catch(e){
        return {  d : false , msg : e.message   }
    }

    if ( ! ret ) { 
      return  { d : false , msg : "An email as been sent to your email."}
    }

    return {  d :  true,  msg: "Password updated"  }
  })