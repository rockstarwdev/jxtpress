import core from '~/server/jxtpress/core'

export default defineEventHandler( async (event) => {

    const query = getQuery(event)
    if (!query ) throw createError({statusCode: 400,statusMessage: "Malformed request.  Please supply required fields"})
    if (!query.key) {
      return { d : false, msg : "Malformed request.  Key is required."}
    } 

    let site_config_key = core.env.SITE_SETUP_KEY;
    if (query.key != site_config_key) {
       return { d : false, msg : "Unauthorized access request.  Please contact site administrator and try again."};
    } 
 
    return { d : true , msg : "Access granted"}
  })