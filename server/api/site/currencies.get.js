import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';
import ecommerce from '~/server/jxtpress/ecommerce';

/**
 * Get a set of options 
 */
export default defineEventHandler( async (event) => {
    const query = await getQuery(event)  || {}
 
     
    return { d : await ecommerce.get_currencies()  }
  })