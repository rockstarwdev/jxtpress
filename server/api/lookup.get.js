import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

async function get_post_from_terms ( options){
    let user_id = options.user_id;
    if ( ! user_id )  user_id = -1 ;

    //Ensure we have the an array of terms 
    var terms = options.terms; 
    var context = options.context || null; 
    if ( ! terms ) return []
    if ( !Array.isArray(terms )) terms = terms.split(/\s/gm)
    var title_terms = []
    for ( var i=terms.length-1; i > -1; i--){
        if ( !terms[i]) {
            terms.splice(i,1);
        }else{
            title_terms.push (`%${terms[i]}%`)
            terms[i] = `${terms[i]}%`
            
        }
    }
    let where_context = ``;
    if ( context ) {
        context = context.split(/\./g); //to array
        context = context[context.length-1]//flatten the array
 
        if ( context != 'post' && context!='posts') { 
            where_context = `(${db.like("type", context)})  `
        }
    }

    //Search Posts
    const tb_tags = `${db.name}.tags`
    const tb_post_tags = `${db.name}.post_tags`;
    const tb_posts = `${db.name}.posts`
    const tb_pmeta = `${db.name}.post_metas`
  
    var sql_accessible_or_public =  pages.get_post_sql_access_rights(user_id )
    
    /* Get an array of tag ids that match our terms */
    var sql_tag_ids =`SELECT id FROM ${tb_tags} WHERE ${db.like("title", terms)}  `;
    /** Use tag-ids to pipe into post-tags in order to return post-ids */
    var sql_post_ids =`\n\tSELECT post_id FROM ${tb_post_tags} WHERE\n\t\t tag_id IN (${sql_tag_ids})`;
    /** Lastly use the post_ids to grab the the post data */
    const post_cols = `title, type, status, id,description, amount, url, (SELECT value FROM ${tb_pmeta} WHERE post_id=Posts.id AND name='feature_image') as image`
    var sql_get_posts =`SELECT ${post_cols} FROM ${tb_posts} Posts \nWHERE `+ 
        `${where_context} AND ` + 
        ` (  id IN (\n${ sql_post_ids }\n) \n  OR  (${db.like('title', title_terms)})  ) ` 
    +   ` AND \n (${sql_accessible_or_public})`

  
    var posts = await db.query(sql_get_posts  ); 
    return posts 
}
/**
 * Get an Array of posts based on the supplied Query { terms: Array of key words to search}
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user;
    if ( user ) {
        query.user_id = user.id; 
    } else {
        query.user_id = null; 
    }
    
    let results = [];
    var context = query.context ;//what type data table do we need to lookup-within
    var types = (await core.get_post_types( query )).map(it =>  it.name  )
    if (!context || types.includes (context) ||  (context && context.startsWith('post')) ){
        console.log ("searching", query, context )
        results = await get_post_from_terms(query)
    }else {
        console.log ("consoe - th", )
    }
 
    return { d : results }
  })