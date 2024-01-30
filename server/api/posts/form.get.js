import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users'; 
import pages from '~/server/jxtpress/pages';

let get_form_object = async (options )=>{
    var form_post_id = options.post_id;  ; 
    var user_id = options.user_id ;


    var post  = await pages.get_post({id :form_post_id , user_id })
    if ( ! post ) return null; 

    let blocks          = post.value;   //Get blocks
    var form_blocks     = (await core.get_block_instance_types({ block_type : "form", blocks })) ;
    var the_form        = form_blocks[0];
    if ( ! the_form )  {
        console.log (`Post ${form_post_id } does not contain a form`);
        return null; 
    } 

    var fields          = await core.get_form_fields({  form_id : the_form.id,  blocks })
    if (fields){
        fields.__meta.title = post.title 
        fields.__meta.post_id = post.id 
    }
    return fields 
}
/**
 * Get an existing form that is on the site.  The returned value will be
 * the form meta and fields.
 * @param Query { id : the post-id of the form to get }
 */
export default defineEventHandler( async (event) => {
 
    
    //var param = event.context.params

    //const body = await readBody(event)
    const query = getQuery(event)
    let user            = event.user;
    if ( user ) {
        query.user_id = user.id; 
    } 
    var fields          = await get_form_object ( { post_id : query.id , user_id : query.user_id , }) 
    if ( ! fields )       return core.res_error(event, { d : null, msg: "Unable to locate the requested form. "})

    return { d : fields   }
  })