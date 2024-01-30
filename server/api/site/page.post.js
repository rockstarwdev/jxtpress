import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 

/**
 * Global Middleware invokes this endpoint when we are able to visit a page.  Utilize this opportunity to initialize default properties
 * for a given page
 */
export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
    if (!body ) return {}
    console.log ("Reached API-Site-Page:Post Route ")
    //{'jxt-token','accept-language',,'user-agent','accept','host','x-forwarded-for'}
    const headers =  getHeaders(event);
    var user_ip = headers['x-forwarded-for'] ;

    var page = body.page || {}; // page the user is calling from; { url , query, param }

    return { d : null}
  })