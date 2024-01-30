import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';
import comments from `~/server/jxtpress/comments`

/**
 * Get an Array of comments based on the supplied Query
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user    = event.user;
    if ( user ) query.user_id = user.id; 
     
      
    return { d : await comments.get(query)  }
  })