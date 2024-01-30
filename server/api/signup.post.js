import db from '../jxtpress/db'
import core from '../jxtpress/core'
import plugin from '../jxtpress/plugin'
import users from '../jxtpress/users'

export default defineEventHandler(async (event) => {
    const body = await readBody(event) 
    var errors = []
    if ( ! body ) {
      setResponseStatus(event, 400)
      errors.push("Fields are required")
    }
    if ( body && (! body.name || ! body.password ||! body.email)) {
      setResponseStatus(event, 400);
      errors.push("name, email, and password are required")
    }
     
    if (errors.length>0) { return { d : false, msg : errors.join(";") } }

 
    var user = null; 
    try { 
      user = await users.register( body );
    }catch(e){
      setResponseStatus(event, 400) 
      return { d : false , msg : e.message }
    }
    
    return { 
      d : user , 
      status: "xxx"
    }
  })