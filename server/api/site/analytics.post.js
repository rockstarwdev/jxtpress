import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 

/**
 * Post a page's view analtyics.  This is typically invoked within s-compile component right before the page is navigated away from
 */
export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
    
    body.ip = event.jxtpress.ip 
    await db.update('analytics', body  ) 
  
    return { d : null}
  })