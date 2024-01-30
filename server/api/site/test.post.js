import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 

/**
 * Global Middleware invokes this endpoint when we are able to visit a page.  Utilize this opportunity to initialize default properties
 * for a given page
 */
export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
    
    console.log ("Testing Route")

    var users = await core.fetch({ url : "https://jsonplaceholder.typicode.com/users"})
    console.log(">>", users )
    return { d : null}
  })