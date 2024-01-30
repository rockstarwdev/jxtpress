import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import groups from '~/server/jxtpress/groups';
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';

 
/**
 * Get All groups that exist
 */
export default defineEventHandler( async (event) => { 
    let user            = event.user;
    //if ( ! user )         return await util.denied(event,) ;
  
 
    return { d : await groups.get_all_groups() }
  })