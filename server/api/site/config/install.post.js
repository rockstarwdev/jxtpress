import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db'

export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
    if (!body ) throw createError({statusCode: 400,statusMessage: "Fields required"})
    if (!body.key) {
      throw createError({ statusCode: 401,  statusMessage: 'Key not provided'})
    } 

    let site_config_key = core.env.SITE_SETUP_KEY;
    if (body.key != site_config_key) {
      throw createError({ statusCode: 401,  statusMessage: 'Incorrect configuration key'})
    } 
 
    console.log (  "DO WEBSITE ADMIN Resigration", body, site_config_key )  
    return { d : true }
  })