import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * Each page will invoke this endpoint prior to the page being rendered.  Utilize this opportunity to prepare page assets.
 */
export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
 
     
    var d               =  await pages.page_init(body);
 
    /* {plugin Invoked on every page just prior to being rendered } */
    d = await plugin.run_filter("page_init",d);
    return { d  }
  })