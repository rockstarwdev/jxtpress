import core from "./core"
import db from "./db"
import db_tables from "./db_tables";
import ecommerce from "./ecommerce";
import plugin from "./plugin"
import users from "./users"

 

class Comments {

    async modify( options){
        if ( ! options) throw new Error("Unable to save null comment")
        
        var tbnotes = `${db.name}.post_notes`
        let existing = null;
        if ( options.id ) {
            existing = (await db.query(`SELECT created_by, id FROM ${tbnotes} WHERE ${db.is('id',options.id)}`))[0] || null 
        }

        //always avoid overriding created_by, by erasing it if the comment already has an id
        if ( existing )    delete options.created_by
        if ( !existing ){   //if is new note being create
            if ( ! options.post_id ) throw new Error("Cannot create note without an associate comment")
            if ( ! options.encounter )options.encounter = "now" //default encounter to be right now
            else {
                options.encounter = core.date_to_mysql(options.encounter)
            }
        }
        

        
        options = await db.update('post_notes',options )
        /** {plugin Before creating a note} */
        options = await plugin.run_filter('before_modify_note',options)

        console.log ("Save comment", options)
        /** {plugin Create or modify a note } */
        plugin.run_action('modify_note',options);

        return options
    }

    async get ( options ){
        if ( ! options) throw new Error("options parameter required for get comments"); 

        var tbnotes = `${db.name}.post_notes`
        var tbuser = `${db.name}.users`
        var tbposts = `${db.name}.posts`
        var tblikes = `${db.name}.likes`
        var tbusermeta=`${db.name}.user_metas`


        /**{plugin  Just prior to getting comments, modify the options parameter used to generate the database selection }*/
        options = await plugin.run_filter("before_get_comments", options);

        var { post_id } = options; 
        if ( ! post_id && ! options.id ) throw new Error("a post id is required in order get get comments ")

        let where=  [];
        
        if ( post_id ) where.push(db.is('post_id',post_id)) 
        if ( options.id ) where.push(db.is('id', options.id ))

        db.add_temporal_condition('created', options, where)
        db.add_temporal_condition('modified', options, where)
        db.add_temporal_condition('encounter', options, where)


        if ( where.length == 0 ) throw new Error("No querable parameters specified")
        var cols = options.cols || options.columns || ['*']
        var all_cols =   `${cols.join(', ')}, ` +
                `(SELECT value FROM ${tbusermeta} WHERE name LIKE "avatar" AND user_id=N.created_by ) as user_avatar, ` + 
                `(SELECT name FROM ${tbuser} WHERE id=N.created_by ) as user_name, \n` +
                `(SELECT COUNT(id) FROM ${tblikes} WHERE object_type="comment" AND object_id=N.id AND value > 0) as likes, \n` +
                `(SELECT title FROM ${tbposts} WHERE id=N.post_id) as post_title \n` 
                 

        var order = `ORDER by encounter DESC`
        var sql = `SELECT ${all_cols} FROM ${tbnotes} N WHERE ${where.join(' AND ' )} ${order}`
 
        var ret =   await db.query(sql);

        /** {plugin Modify output of get comments } */
        return await plugin.run_filter('get_comments',ret) 
    }
}
let coments = new Comments()
export default coments  