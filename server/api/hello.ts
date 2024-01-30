import db from '../jxtpress/db'


export default defineEventHandler(async (event) => {
    //const body = await readBody(event)
    //const query = getQuery(event)
    /*
    if (!Number.isInteger(id)) {
      throw createError({
      statusCode: 400,
      statusMessage: 'ID should be an integer',
      })
    }
    */
    //setResponseStatus(event, 202) //400=Bad,401=Unauthorized,403=Forbidden 
    //const cookies = parseCookies(event)
    console.log (  "This is from /api/hello", await getQuery(event)) 
    console.log (db.name ) 
    return {
      api: 'works' 
    }
  })