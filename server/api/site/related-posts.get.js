import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * Get a set of options 
 */
export default defineEventHandler( async (event) => {
    const query = await getQuery(event)  || {}
 
    
    let user            = event.user;
    if ( ! user )       return await core.res_denied(event) ;
  
    
    if ( !core.can_user({user_id : user.id , cap : "manage_tags_categories"})) { 
      return await core.res_denied(event,{msg : "User role is required"})
    }
    var tb_posts = `${db.name}.posts`
    var out = [] ; 
    if ( query.tag ) {
        var tb_tags = `${db.name}.tags`
        var tb_posttags=`${db.name}.post_tags`;

        var where = `${db.like('title', query.tag)} OR ${db.is('id',query.tag)}`
        var sel_post_id = `SELECT post_id FROM ${tb_posttags} WHERE ${db.is('tag_id',query.tag)}`
        out = await db.query(`SELECT id, url, title, type FROM ${tb_posts} WHERE id IN (${sel_post_id })`)
    } else if ( query.category ) {
      var tb_categories = `${db.name}.categories`
      var tb_posts=`${db.name}.posts`;

      var where = `${db.like('slug', query.category)} OR ${db.is('id',query.category)}`
      var sel_post_id = `SELECT id FROM ${tb_categories} WHERE ${where }`
      out = await db.query(`SELECT id, url, title, type FROM ${tb_posts} WHERE category_id IN (${sel_post_id })`)
  }
    
 

    return { d : out  }
  })