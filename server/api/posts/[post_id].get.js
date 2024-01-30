import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Global Middleware invokes this endpoint when we are able to visit a page.  Utilize this opportunity to initialize default properties
 * for a given page
 */
export default defineEventHandler( async (event) => {
 
    var param = event.context.params

    //const body = await readBody(event)
    const query = getQuery(event)
    let user            = event.user;
    if ( user ) {
        query.user_id = user.id; 
    } 
    var d = await pages.get_post({id : param.post_id, user_id : user ? user.id : null })
    if ( d ) {
        if ( d.is_new_post ){
          
             
        }else { 
            if ( ! await pages.can_user_read({ post_id : d.id, user_id : query.user_id })) {
            
                d =  {
                    id : null, title : "Access Denied",
                    error : true,
                    value : [
                        { 
                            type : "paragraph", children : [], 
                            data : {
                                classes: "color-red-500",
                                text : `It appears you do not have permission to edit this <b>Post ${param.post_id}</b> `
                            }
                        }
                    ],
                    description : `You are not permitted to edit the Post <span class="tag">${ param.post_id }</span>.`, 
                } 
            }
        }
    }
    
    return { d }
  })