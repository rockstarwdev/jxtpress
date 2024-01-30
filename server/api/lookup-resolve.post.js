import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 

async function get_resolve_postss ( values, user_id, context = "posts" ) {

    
    if ( ! values || (values && values.length== 0)) return []
    let where_context = ``;
    if ( context ) {
        context = context.split(/\./g); //to array
        context = context[context.length-1]//flatten the array
 
        if ( context != 'post' && context!='posts') { 
            where_context = `(${db.like("type", context)}) AND `
        }
    }
    console.log ("REsolve ID: ", values, user_id, context , where_context)
    const tb_tags = `${db.name}.tags`
    const tb_post_tags = `${db.name}.post_tags`;
    const tb_posts = `${db.name}.posts`
    const tb_pmeta = `${db.name}.post_metas`
    const tbaccess = `${db.name}.post_access`
    const tb_grpmembers = `${db.name}.group_members`
  
    var users_group = `SELECT group_id FROM ${tb_grpmembers} WHERE ${db.is('user_id',user_id)} AND status="approved"`
    var sql_read =` #Check if User has the read group \n(SELECT COUNT(*) FROM (SELECT read_group FROM ${tbaccess} WHERE post_id=Posts.id AND read_group IN (${users_group}))as Tx0 ) > 0`
    var sql_public=`#Check if the read group is public\n( SELECT COUNT(*) FROM (SELECT read_group FROM ${tbaccess} WHERE post_id=Posts.id AND read_group IS NULL) as Tx1    ) > 0`
    var sql_any_defined=`(SELECT COUNT(*) FROM (SELECT read_group FROM ${tbaccess} WHERE post_id=Posts.id ) as Tx2) = 0`

    var cols =`title, type, status, id,description, amount, url, (SELECT value FROM ${tb_pmeta} WHERE post_id=Posts.id AND name='feature_image') as image`
    var sql =`SELECT ${cols} FROM ${tb_posts} Posts WHERE \n`+ 
            ` ${where_context} ${db.is('id', values)} AND (\n` +
             `\t (${sql_read}) OR ${sql_public} OR \n`     +
             `\t ${sql_any_defined}` +
            `\n)`
            
    
    return await db.query(sql)
}
/**
 * Get an Array of posts based on the supplied Query
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    const body = await readBody(event) 
    let user            = event.user;
    let user_id = null; 
    if ( user ) {
        user_id = user.id 
        query.user_id = user.id; 
    } 
    
    let { values, context } = body ;
    if ( ! context ) context = "posts"
    var results = null 
    var cpts = await core.get_post_types()
    var post_type_list= ['posts']; //any array of post types names
    if ( cpts ) {
        post_type_list.push (  ... cpts.map(cpt => cpt.name ))
    } 
    if (!context || post_type_list.includes( context )){
        results = await get_resolve_postss(values, user_id,  context  )
    }
 
    return { d : results }
  })