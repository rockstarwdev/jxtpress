import core     from '~/server/jxtpress/core'
import db       from '~/server/jxtpress/db' 
import plugin   from '~/server/jxtpress/plugin';
import users    from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Uses this page to process (pre-render a post) and return output a completely rendered page for the user.
 * Internally invokes  { pages.render } with body { type: String post type name, url: String, full_url, query, param,
 *  store : Boolean -whether to include store operational variables to frontend, 
 *  post_id : optional - if provided will override url and query,  child_id : optional - specifies another post whose data will be consumed by the rendered page }.
 * The difference between url and full_url is that full_url is the url with the post type name preceding it.
 * 
 * @return {
 *   ... Post ,rendered, aux
 * }
 */
export default defineEventHandler( async (event) => {
    var promises =  [  readBody(event),  getQuery(event)   ]
    var promised_results = await Promise.all(promises )
    let body            = promised_results[0]
    
    var query           = promised_results[1];
    let user            = event.user;
 
    var params = event.context.params
    if (! body ) return {}
    var post_type = body.type ; 

    var server_now = new Date()
    let today = core.to_user_time({ date: server_now  })
    let now  = {
        today       , 
        date        : today.getDate(),
        hours       : today.getHours(),
        minutes     : today.getMinutes(),
        month       : today.getMonth(),
        day         : today.getDay(),
        year        : today.getFullYear(),
        stz         : server_now.getTimezoneOffset()
    } 
  
    
    var render_option = {
        ... body , query, params , param   : params ,
        user_id : (user ? user.id : null),
        cookies : parseCookies(event),
        headers : getHeaders(event), 
        now , req : { event }
    };
    var processed_post = null; 

    var do_rendering = true; 
    if ( body.native_page ){
        do_rendering = false; 
        processed_post = {  }
        if ( body.post_id ) {
            do_rendering = true; 
        }
    }
    processed_post = await pages.render_post (render_option)

    let store = {}
    if ( body.store ) {// this means we want to load store related data to our response
        store.currency = await core.get_option({ name : "stripe_currency", flat :true} );
        store.public_key = await core.get_option({ name : "stripe_publishable_key", flat: true})
        store = await plugin.run_filter("include_store_data", store)
    }
    processed_post.store = store 
    
    if ( processed_post ) {
        processed_post.site = await core.get_site_info()
        processed_post.aux = {}
        processed_post.registered_components = (await core.get_components()).map( comp => comp.fn )
        promises = [
            core.get_options({ like : ['meta_%','script_%','link_%', 'style_%'] }),
            core.get_options({ like : ['cookie_%']}),
            core.get_option({ name : "site_fonts_arritem" , flat : true})
        ]
        promised_results            = await Promise.all( promises ) 
        var arr_opt_meta            = promised_results[0];
 
        if ( ! processed_post.metas ) processed_post.metas = []
        
        //Load up global Properties
        processed_post.metas.push(  ... arr_opt_meta ) //Add on any just props

        //Load up global cookies that might exist, 
        // then loop each cookie and update the cookie's value for the user
        var arr_cookies = [ ... promised_results[1], 
                            ... processed_post.metas.filter(
                                    it=>it.name && it.name.startsWith('cookie_')
                                ) 
                          ]; 
        processed_post.aux.google_fonts  = promised_results[2] || [];//will be an array of google font names
        
        var ck;
        var initial_value, obj_value, new_cookie_value = null; 

        //Loop and check for  cookies
        for ( var i=0; i < arr_cookies.length; i++){ //Loop each cookie
            ck                  = arr_cookies[i];
            if (  ! ck.value ) continue ; 
            initial_value   = null; 
            obj_value       = null;  
            if ( ! Number.isNaN(ck.value)) initial_value = Number.parseFloat(ck.value )

            if ( isNaN(initial_value) ) {
                var parts   = ck.value.split(/,/gm) ;//An array of parts
                var tokens  = null;  
                obj_value   = { }
                for ( var j=0; j < parts.length; j++){
                    tokens                        = parts[j].split(/=/gm);
                    obj_value[ tokens[0].trim() ] = await core.type_cast ( tokens[1]||null )
                } 
                initial_value = obj_value.initial_value || obj_value.value  
            }
            ck.name             = core.get_name_only( ck.name,  "cookie_" )
            new_cookie_value    = getCookie(event, ck.name) || initial_value; 

            if ( obj_value ) {
                var step = obj_value.step || 1;
                if ( !isNaN(step)) step = parseFloat(step);

                if (obj_value.action == 'inc'){
                    if( typeof new_cookie_value != 'number') { 
                        try { new_cookie_value= JSON.parse(new_cookie_value); }catch(exp) {}
                    }
                    new_cookie_value += step;
                } 
                if (obj_value.action == 'dec'){
                    if( typeof new_cookie_value != 'number') { 
                        try { new_cookie_value= JSON.parse(new_cookie_value); }catch(exp) {}
                    }
                    new_cookie_value -= step;
                }
                if (obj_value.action == 'now') {
                    new_cookie_value = Date.now() 
                }
                if ( obj_value.action == 'set') {  
                }
            }
            setCookie(event, ck.name , new_cookie_value , obj_value)

            
            /* {plugin A page has been post-processed and about to be rendered to the user  } */
            plugin.run_action('process_post',processed_post);
            
        }//End of looping all cookies
        if ( ! processed_post.__is_404 && post_type != 'preview') {
            var viewing_data = { 
                user_id : user ? user.id : null,
                post_id : processed_post.id || null, 
                url_to: body.full_url || body.url, 
                url_from: body.from_url || event.jxtpress.referer, 
                //ip : event.jxtpress.ip 
            } 
            processed_post.analytics = viewing_data
        }
    }else {
        processed_post = { msg : "Hmmm, pleae contact administrator as at least 404 should be displayed here "}
    }

    processed_post.current_user = user 

    return { d : processed_post  }
  })