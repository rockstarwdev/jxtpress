import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Get an Array of posts based on the supplied Query
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user;
    if ( user ) {
        query.user_id = user.id; 
    } 
    //if ( ! user )         return await util.denied(event,) ;
   

    //var post = await pages.update_post(post)
    //console.log ("Save Posts ", post )
    //query is an object  
    return { d : await pages.get_posts(query)  }
  })