import core from "./core"
import db from "./db"
import db_tables from "./db_tables";
import ecommerce from "./ecommerce";
import plugin from "./plugin"
import users from "./users"

 

class Likes {

    async update ( options ) {
        if ( ! options ) return null; 

        let tblikes = `${db.name}.likes`
        let tbusers = `${db.name}.users`

        var notes_tables_arr = ['note','notes','comments','comment']
        var post_tables_arr = ['posts','post']
        if (notes_tables_arr.includes( options.object_type)) options.object_type = 'comment'
        if (post_tables_arr.includes( options.object_type))                   options.object_type = 'post'
        var final_object_type = null; 

        var existing = null, ret;  
        // Check if the like record already exists
        if ( options.id ) {
            ret = await db.query(`SELECT * FROM ${tblikes} WHERE ${db.is('like', options.id)}`);
            if ( ret.length>0) existing = ret[0];
        }else if (options.created_by && options.object_id && options.object_type) {
            ret = await db.query(`SELECT * FROM ${tblikes} WHERE ` + 
                            `${db.is('object_type', options.object_type)} AND ` + 
                            `${db.is('object_id', options.object_id)} AND ` + 
                            `${db.is('created_by', options.created_by)}`)
            if ( ret.length >0) existing = ret[0];
        }
        if ( existing) {
            final_object_type = existing.object_type
            options.id = existing.id //update the id of this like
            if ( options.toggle && options.value == undefined ){    //Toggle can only be done for existing "likes"
                var mag = Math.abs(existing.value)
                options.value = mag > 0  ? 0 : 1;
            }
        } else  {
            //for brand new like records
            if ( ! options.object_type ) throw new Error ("Missing object-type")
            if ( ! options.object_id) throw new Error("Missing object-id")
            if ( options.toggle && options.value == undefined ) options.value = 1;
            
            if ( ! options.value) throw new Error("Missing value")

            final_object_type = options.object_type
        }
        if ( ! final_object_type ) throw new Error("Unexpected - missing object-type")

        var source_table = null; 
        if ( notes_tables_arr.includes (final_object_type) ) source_table = `${db.name}.post_notes`
        if ( post_tables_arr.includes( final_object_type )) source_table = `${db.name}.posts`
        if ( ! source_table ) throw new Error ("Unexpected - unable locate source table for like object type: "+ final_object_type)


        /** {plugin Just before liking an object, potentially modify or perform some action} */
        options = await plugin.run_filter("before_create_like",options); 
        options = await db.update('likes',options)
        options = await plugin.run_filter("create_like",options); 
        
        ret = await db.query(`SELECT COUNT(id) as like_count FROM ${tblikes} WHERE ${db.is('id',options.id)} AND value > 0;`)
        if ( ret.length >0){
            options.like_count = ret[0].like_count
        }

        console.log("--------->", options)
        return options
    }
}
let likes = new Likes()
export default likes  