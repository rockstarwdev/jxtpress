import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Return all Post Types on the site.  Queries { tags : Array, post_tag : String} can be supplied to narrow down
 * results.
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user;
    if ( user  ) {  query.user_id = user.id;    }  
   

    return { d : await pages.get_tags(query)  }
  })