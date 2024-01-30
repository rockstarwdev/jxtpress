import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Update a post's permission by first seeing if user currently has access or is the creator of the post.
 * If the permission/access definition has a "delete" or "is_delete" field set, then this route will handle removing
 * of the specified permission.
 */
export default defineEventHandler( async (event) => {
    let body = await readBody(event)  
    var query = await getQuery(event);
    var params = event.context.params

    if (! body ) return {}
    
    let user            = event.user;
    if ( ! user )   return core.res_denied(event, { d : null, msg : "You are not allowed to do that"})
    var user_id = user.id ; 

    var permissions = body; 
    if ( ! Array.isArray(permissions)) permissions = [ permissions ];

    var perm=null, promises = []
    // Check if the user can perform update for the post
    for(var i =0; i < permissions.length; i++){
        perm = permissions[i];
        perm.user_id = user_id  ; 
        
        promises.push ( pages.can_user_update(perm) )
    };
 
    //Wait for a decision
    var can_update  = await Promise.all(promises ); 
    var tb_posts = `${db.name}.posts`
 
    for(var i =0; i < permissions.length; i++){
        perm = permissions[i];
        //if the user cannot update the permission, check to see if they are the original creator of the post
        if ( ! can_update[i]) {
            var is_creator = await db.query(`SELECT created_by FROM ${tb_posts} WHERE ${db.is('id', perm.post_id)}`);
            if (is_creator.length==0 ) continue; 
            if ( is_creator[0].created_by == user_id) can_update[i] = true;  
        }

        if ( can_update[i] ){
            //if the permission has a delete flag set to true
            if ( perm.delete || perm.is_delete ) {
                promises.push( pages.remove_access(perm ) )
            }else { 
                promises.push( pages.modify_access( perm ) )
            }
        }
    }
    //Get all results here
    var results = await Promise.all( promises )

    return { d : body , msg : "operation completed" } 
  })