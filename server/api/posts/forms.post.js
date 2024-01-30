import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';

import pages from '~/server/jxtpress/pages';


 
/**
 * Typically, a page containing a form has submitting a completed form.  This enpoind exist to process the form submission.
 * 
 * @param {  Body } body = {    form_id : Block instance id of the form, 
 *                              form_name : Block data form name as define within the form block instance, 
 *                              form_post_id : The post id from which the block was defined/built/houses within  
 *                              data_of : if provided, points to the Id of a prior submission of which this new submission will override
 *                              data : Object : the data from the form where each key (field) points to the value from the form
 *                              meta : Object - unofficial form field descriptors where each key (field_name) points to { type: field type, id : block id} - informational only
 *                              submission_from : the page in which the form was viewed and submitted from - informational only
 *                          }
 * @return { }
 */
export default defineEventHandler( async (event) => {
    var promises =  [  readBody(event),  getQuery(event),  core.verify_user(event)  ]
    var promised_results = await Promise.all(promises )
    let body            = promised_results[0]
    var query           = promised_results[1];
    let user            = promised_results[2];
    
    var params          = event.context.params
    if (! body ) return {}

    var form_post_id = body.form_post_id || null; // The post-id from which the form as built in
    /**  official form fields Object - each each points to { field_name, field_id, type, is_required, validation, values } */
    var offical_ffields = await core.get_form_fields ({ post_id : form_post_id, form_id  : body.form_id })
    if ( ! offical_ffields ) return core.res_error(event, { msg : "Hmm, unable to locate form<" + body.form_id+">"})
    
    //Below two are submission (sub) data from the user that we may not trust
    var sub_meta        = body.meta // submission data: each { id : block id, type : block type}
    var sub_data        = body.data // data - each key maps to a value;  key => value 
    var sane_data       = {}        // a clean and trusted version of sub_data
    var data_of         = body.data_of//the id of a previously submitted data that this form submission is updating/ if any
    if ( ! sub_meta ) return core.res_error(e, { msg : "Form meta properties is required" })
    if ( ! sub_data ) return core.res_error(e, { msg : "No submission data provided"      })
    
    //Use here to collect validation errors;
    var validation_errors = [] 
    var offical_keys =  Object.keys(offical_ffields);
    var field_name;

    // Check for validation errors
    for (field_name of offical_keys ){
        if ( offical_ffields[field_name].is_required && sub_data[field_name] == undefined){
            validation_errors.push({ field : field_name, msg : "is required"});
        } 
    }
    if ( validation_errors.length > 0 ) return core.res_error(e, { d : validation_errors, msg : "Form has errors "})

    var form_instance_data = null; 

    var data_as_meta_props = [];
    var existing_metas = null; 
    if ( data_of ) {
        existing_metas = await db.query(`SELECT id, name FROM ${db.name}.post_metas WHERE ${db.is('post_id', data_of)}`)
    }
    // Sanitize values
    for (field_name of offical_keys ){ 
        //skip any internal keys
        if ( field_name.startsWith('__')){ 
            if ( field_name == '__meta') form_instance_data = offical_ffields[ field_name]
            continue; 
        }
        // field_name,field_id,type, is_required, validation
        var col = {
            name : field_name ,
            value : db.santize(sub_data[field_name] )
        }
        if ( data_of ) {
            var exists = existing_metas.find( e_meta => e_meta.name == field_name)
            if ( exists ) col.id = exists.id 
        }
        data_as_meta_props.push(col)  
    }

    //At this point, sane_data is ready to be submitted

    
    var is_new_submission = true; 
    var post_submission = {
        type : "formdata",
        value : form_instance_data,
        metas : data_as_meta_props,
        parent_id : form_post_id, //parent to the post whre the form was defined
        created_by : user ? user.id : null, 
        status : "submitted",
        linked_to : body.submission_from,
        description: `Submission from ${body.submission_from} `,
    }
    if (data_of ) {  
        var is_able_to_edit_submission =await pages.can_user_update({ post_id : data_of , user_id : user ? user.id :null })
        if ( !is_able_to_edit_submission) {
            return core.res_error(event, { msg : `You dont have access to edit submission ${data_of} for form ${form_post_id}`})
        }
        is_new_submission = false;
        delete post_submission.linked_to
        delete post_submission.type;
        delete post_submission.value
        delete post_submission.created_by 
        delete post_submission.status;
        delete post_submission.description
        post_submission.id = data_of;
    }

 
    post_submission = await plugin.run_filter('form_before_submission', post_submission );
    if ( ! post_submission ) return core.res_error(event, { msg : "unable to accept submission" })

    await pages.update_post(post_submission, {}) 

    /* { A new formas been submitted } */
    plugin.run_action('form_submisssion', post_submission );

    return { d : null  }
  })