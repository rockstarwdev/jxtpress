 
import util from "./util";

 
export default function(){
 

    // Apply Typing complete effect 
    let typing_timeout;
    let typing_delay=350;
    util.delegate("submit","form", (e)=>{
        e.preventDefault();
        var form = e.target ;
        var form_data =  { }
        var form_meta = { }
        var form_id = form.getAttribute("form-id")
        var action_endpoint = form.getAttribute("action") || "/api/posts/form";
        var action_method = form.getAttribute("method");

        var form_post_id = form.getAttribute("form-post-id");       //post (type=form) that built/houses the form
        try { form_post_id = parseInt(form_post_id)}catch(x){}
        var data_of      = form.getAttribute("data-of");
        try { data_of = parseInt(data_of); }catch(x){}
        
        var post_wrapper = form.closest("[post-id]");
        var post_id=null, post_type = null;
        if (post_wrapper  ){
            try { post_id = parseInt ( post_wrapper.getAttribute("post-id")) ; }catch(ei){} 
        }



        var arr_fields = form.querySelectorAll("[block-type=formfield]")
        arr_fields.forEach( field =>{
            //field - typically a div that encapsulates a ui form element
            var field_name = field.getAttribute("field-name");
            var field_type = field.getAttribute("field-type");
            var field_id   = field.getAttribute("field-id")

            if ( ! field_name || !field_type) return; 

            form_meta[field_name] = { type :  field_type, id : field_id}

            var val = null, ui;

            if ( field_type == 'dropdown'){
                ui = field.querySelector(".select");
                if ( ! ui ) return; 
                try {    val = JSON.parse(ui.getAttribute("value")); } catch(e) {}
            }else if (field_type == 'switch' || field_type == 'checkbox') {
                ui = field.querySelector("input[type=checkbox]"); 
                if ( ! ui ) return ; 
                val = ui.checked  
            }else if ( field_type == 'text'){
                ui = field.querySelector("textarea");
                if ( ! ui ) return;
                val = ui.value ;
            }else if ( field_type == 'string'){
                ui = field.querySelector("input[type=text]");
                if ( ! ui ) return;
                val = ui.value ;
            }else if ( field_type == 'date'){
                ui = field.querySelector(".date");
                if ( ! ui ) return;
                val = ui.getAttribute("value") ;
            }else if ( field_type == 'datetime'){
                ui = field.querySelector(".date");
                if ( ! ui ) return;
                val = ui.getAttribute("value") ;
            }else if ( field_type == 'datetime'){
                ui = field.querySelector(".date");
                if ( ! ui ) return;
                val = ui.getAttribute("value") ;
            }else if ( field_type == 'color'){
                ui = field.querySelector("button");
                if ( ! ui ) return;
                val = ui.getAttribute("value") ;
            }else {
                console.log ("unknown-type", "<"+ field_type + ">", field_name)
            }
            form_data[field_name] = val  

            //TODO implement data validation here
        })
        //console.log ("Submittion happended",e,form,  form_data, form_meta  );
        if (! action_endpoint || !action_method ) return; 
        action_method = action_method.toLowerCase()
        var config = { method  : action_method }
        var form_submission = {
            form_id, form_name :  form.name || "" ,data_of, 
            form_post_id, post_type, 
            submission_from: post_id, 
            data: form_data,
            meta: form_meta
        }
        if (action_method == 'get' ) { 
            config.query = form_submission;
        }else {
            config.body = form_submission
        }
        console.log ("Post ",   form_submission)
        api(action_endpoint,  config )
    })
    
}