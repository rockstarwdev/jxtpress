import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Return all layouts that exist on the page.
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    let meta = await readBody(event)  
    
    let user            = event.user;
    var user_id = null; 
    if ( user ) {
        query.user_id = user_id = user.id ; 
    } 
    if ( ! meta ) return await core.res_error(event, { d: null , msg :"Data is required"})
    if ( typeof meta != 'object') {
        return await core.res_error(event, { d : null, msg : "Object or array required"})
    }

    // Check if user as the right permission
    var arr_meta = Array.isArray(meta)  ? meta : [meta]
    var m, promises_update = []
    for(var i=0; i < arr_meta.length; i++){
        m = arr_meta[i];
        if ( m.post_id ) {
            if ( m.delete ){
                promises_update.push(  pages.can_user_delete ({ post_id : m.post_id , user_id }))
            }else { 
                promises_update.push(  pages.can_user_update ({ post_id : m.post_id , user_id }))
            }
        }else {
            promises_update.push(null)
        }
    }
    
    //Get the result of the permission
    var can_results = await Promise.all(promises_update );
    var data_to_save = []
    var data_to_delete = []
    for( var i=0; i < can_results.length; i++ ){
        if( arr_meta[i].delete){
            if ( ! can_results[i]) continue; 
            data_to_delete.push ( arr_meta[i] )
        }else { 
            if ( ! can_results[i] )  continue; //skip if user cannot write to a specific post
            data_to_save.push ( arr_meta[i] );//save the data
        }
    }
    let tb_post_metas = 'post_metas'
    //Save any items the user is allowed to save
    if ( data_to_save.length > 0 ){ 
        await db.update( tb_post_metas , data_to_save)
    }
    if ( data_to_delete.length > 0 ) {
        for ( var i=0; i <data_to_delete.length;i++){
            db.remove(tb_post_metas, data_to_delete[i].id )
        }
    }
    //Return what the user was able to save
    return { d : data_to_save  }
  })