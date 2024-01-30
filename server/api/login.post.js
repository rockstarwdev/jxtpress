import db from '../jxtpress/db'
import core from '../jxtpress/core'
import plugin from '../jxtpress/plugin'
import users from '../jxtpress/users'

export default defineEventHandler(async (event) => {
    const body = await readBody(event) 
    const token_cookie_name = "jxt-token"
    var errors = []
    if ( ! body ) {
      setResponseStatus(event, 400)
      errors.push("Fields are required")
    }
    if ( body && (! body.name || ! body.password)) {
      setResponseStatus(event, 400);
      errors.push("name and password are required")
    }
    
    
    deleteCookie(event,token_cookie_name)
    if (errors.length>0) { return { d : false, msg : errors.join(";") } }

    var user = await users.login(body);
    if ( ! user ) {
      setResponseStatus(event, 401);
      return  { d : null, msg : "Hmm, it looks like either the username and or password did not match.  Please try again"}
    }


    let token = core.jwt_create(user);
    
    setCookie(event, token_cookie_name, token)
    user.token = token; 

    /* {plugin After the user as successfully logined in.  Run query that potentially modifies where the user is redirected to. Data passed is an object with keys path, and query } */
    var data =  await plugin.run_filter("after_login", { path : "/user" ,  query : {} });

    return {
      d : user , path :data.path, query : data.query , 
      msg: "Successfully logged in"
    }
  })