import { defineStore } from 'pinia'


export const useMainStore = defineStore('main', {
  state: () => ({ 
    debug_use_request : false, 
    counter: 409,
    admin_menu_links : [],
    dashboard_title : null, 
    user : null, 
    blocks : [],
    posts : [], post : null,
    users : [] ,
    user_metas : [],
    /** List of roles assigned to a specific user */
    user_roles : [], 
    /** List of all roles */
    roles : [],
    /** Site options */
    options : [],
    groups : [],
    rendered_post: null,
    host_url : null,
    custom_font_names : [],
    tags : [],
    categories : [],
  }),
  actions: {

    
    increment() {
      // `this` is the store instance
      this.counter++
    },
    set_host_url(url){
      this.host_url = url
    },
    get_host_url(){
      return this.host_url
    },
    async login(user){
      try {  //Using cookies to manage
        var res= await useRequest({url: "/api/login", method: "post", body : user })
        if( res.d ) {
            var path = res.redirect || "/user"
            var query = res.query || {}
            navigateTo({ path , query })
        } 
      }catch(e){
          console.log (e.message, e.data )
      }
    },
    /**
     * The user is supplying their email address so we can send them an email that allow them to reset their password
     * @param {Object} user { email }
     */
    async request_login_reset(user ){
      var res = await useRequest({ url:"/api/forgot-password", method : "post", body : user })
      return res; 
    },
    /**
     * 
     * @param {Object} options { reset_token, password }
     */
    async reset_password (options ){
      var res = await useRequest ( { url: "/api/reset-password",method : "post", body : options })
      return res; 
    },
    async logout() {
      let jxt_token = useCookie('jxt-token')
      jxt_token.value = null; 
    },
    async load_blocks(){
      try {
        //Get blocks
        var ret = await useRequest({url: '/api/site/blocks', method:'get'})

        let fetched_blocks =  [];
        if ( ret ) fetched_blocks = ret.d 
        if ( ret == null){
          console.log("Blocks fetched are null", ret )
        }
        
        this.blocks = []
        var fb = null, bloc,matched=false, matched_index; 
        //compare fetched blocks with current block and if not aready in there, add ed
        for ( var i =0; i < fetched_blocks.length; i++){
            fb = fetched_blocks[i];
            matched = false ;
            matched_index = -1;
            for ( var j=0; j < this.blocks.length; j++){
              bloc = this.blocks[j];
              if ( fb.name == bloc.name){
                matched = true; 
                break;
              }
            }
            if (!matched){
              this.blocks.push(fb);
            }else {
              //Replace it
              this.blocks.splice(matched_index, 1, fb);
            }
        }//end loop
        return this.blocks
      }catch(e){
        console.error( "==> ", e )
      }
    },//end blocks

    async load_groups (){ 
      var ret = await useRequest({url: '/api/groups', method:'get'})
      this.groups = ret.d;
      return ret.d;
    },

    async modify_groups (group){ 
      var ret = await useRequest({url:'/api/groups', method:'post', body: group})
      this.load_groups()
      return ret.d;
    },
    /**
     * Loads an array of posts
     * @param {Object} options { limit, p, type }
     */
    async load_posts (options ){
      if ( ! options.limit ) delete options.limit 
      if ( ! options.p ) delete options.p 
      var ret = await useRequest({url: '/api/posts', method:'get', query : options })
      this.posts = ret.d; 
      return ret.d 
    },
    /**
     * Load a specific post or a shell of a specific post type using 
     * @param {Object} options { id }
     */
    async load_post ( options ) {
      var ret = await useRequest({url :  `/api/posts/${options.id}` } )
      this.post = ret.d; 
      if ( this.post ) {
        if ( this.post.value == null) { 
          this.post.value = []
        }
      }
      return this.post; 
    },
    /**
     * Query the server to produce a list of tags that match the search object supplied
     * @param {Object} options Query values
     * @returns {Array} Return an Array of tags
     */
    async load_tags (options ) {
      var ret = await useRequest({url: `/api/site/tags`, method: 'get', query: options})
      this.tags =  ret.d 
      
      return this.tags 
    },
    /**
     * Delete a tag by it's ID
     * @param {Object} options { id }
     * @returns null
     */
    async remove_tag (options){
      var ret = await useRequest({url: `/api/site/tags`, method:'delete',body: options});
      return ret.d; 
    },

    async modify_tag (options){
      var ret = await useRequest({url: `/api/site/tags`, method:'post',body: options});
      return ret.d; 
    },
    /**
     * Get website categories from the server
     * @param {Object} options types of categories to return
     * @returns {Array} arr of categories 
     */
    async load_categories(options){

      var ret = await useRequest({url: `/api/site/categories`, method: 'get', query: options})
      this.categories =  ret.d 
      
      return this.categories 
    },

    /**
     * 
     * Update the properties of a catergory
     * @param { Object } options category
     * @returns { Array }
     */
    async modify_category (options){
      var ret = await useRequest({url: `/api/site/categories`, method:'post',body: options });
      return ret.d; 
    },

    /** 
     * Delete a catergory
     * @param { Object } options category
     * @returns { Array }
     */
    async remove_category (options) {
      var ret = await useRequest({url: `/api/site/categories`, method:'delete',body: options });
      return ret.d; 
    },

    /**
     * 
     * @param {Object | Array } options An array of posts or just the post object itself
     * @returns 
     */
    async modify_post(options){
      if ( Array.isArray(options) && options.length==0) return null ; 
      if ( ! options ) return null 
      var res = await useRequest( { url: `/api/posts` , method: 'post', body : options})
      return res.d; 
    },
    /**
     * Get all the layout types that exist
     * @param {Object} options 
     */
    async load_layouts ( options ) {
      var ret = await useRequest({ url :`/api/posts/layouts` })
      this.layouts = ret.d;
      return this.layouts; 
    },
    /**
     * Get the currently signed in user profile information 
     * @returns {Object}
     */
    async get_profile (){
      var res = await useRequest({ url : "/api/users/profile" } ) 
      return res.d;
    },
    /**
     * Get the info of the currently logged in user
     */
    async get_current_user(){
      var res = await useRequest({ url : "/api/users/details"})
      this.user = res.d 
      return res.d 
    },
    /**
     * Get the info of the currently logged in user
     * @param {Object} options { user_id }
     */
    async get_user(options ){
      var res = await useRequest({ url : "/api/users/details", query: options })
      this.user = res.d 
      return res.d 
    },
    /**
     * 
     * @param { Object } options { user_id, action }
     * @returns { Object }
     */
    async can_user(options){
      return await useRequest({ url : '/api/site/can-user', method : 'post', body: options })
    },
    /**
     * Update either the user object or meta properties associated with the user
     * @param {Object} profile { id ,  ...., metas : Array meta properties } The data to update 
     * @returns Saved chagnes
     */
    async modify_profile(profile) { 
      var res = await useRequest({ url: "/api/users/profile",  method: 'post', body : profile })
      return res.d;
    },
    async load_users (options){ 
      var ret = await useRequest({ url : `/api/users`,  method: 'get', query: options })
      this.users = ret.d;
      return this.users; 
    },
    async load_user_roles (options){ 
      var ret = await useRequest ({ url: `/api/users/role-list`, method: 'get', query: options })
      this.user_roles = ret.d;
      return this.user_roles; 
    },
    async load_roles (options) {
      var ret = await useRequest( {url : `/api/users/roles`, method: 'get', query: options })
      this.roles = ret.d;
      return this.roles ; 
    },
    async load_user_metas(options) {
      var ret = await useRequest({ url: "/api/users/metas", query : options } )
      this.user_metas = ret.d;
      return this.user_metas
    },

    async load_options(options) {
      var ret = await useRequest ({url: "/api/site/options",  query : options } )
      this.options = ret.d;
      return this.options
    },
    /**
     * Modify the currently signed in user store settings such as payment options
     * @param {Object} options { optional - payment_id, remove_payment_id  ...}
     */
    async modify_user_account(options) {
      var ret = await useRequest({ url: "/api/users/account", method: "post", body: options})
      return ret.d 
    },
    async page_init(to){ 
     // var ret = await api("/api/site/page-init", { method: 'post', body : to } )
       return true 
    },
    /**
     * Request the server to provide an object that represents the post that resides at the specified url
     * @param {Object} options { type: String post type name, url : String url per address bar,  full_url 
        query: Object query parameters,  param : Object params };
       
    }
     * @returns 
     */
    async process_post(options, extra_options = {} ){
      //this.rendered_post = { meta_seo:  [], head_scripts : [], links: [], head_style: [] }
      //return this.rendered_post
      
      if ( ! options) return null; 

      var is_native_page = extra_options.native
      
      /*var today = new Date()
      let localtime = {
        timezone        : Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_short  : today.toLocaleDateString('en-US', {  day: '2-digit',  timeZoneName: 'short' }).slice(4),
      }
      console.log ("server", localtime, today, process.client ? "CLinet": "Server" , getHeaders(event)) */
      var req_url = "/api/posts/process"
      var payload = { 
        use_async : true, 
        method: 'post', url : req_url,
        body: {  ... options,  url : options.url, store : options.store,
          type : options.type , full_url : options.full_url,
          native_page : is_native_page }, query : options.query, params :  options.params 
      }
 
      var ret = await useRequest(payload)
      

        var post = ret.d ; 
        var today = new Date();

      
      if (typeof extra_options.after == 'function' ) {  
          await extra_options.after()
      }

      if ( post  ){ 
          var year          = today.getUTCFullYear()
          var site_name     = post.site_title 
          var cpy_right_by  = site_name
          var keywords      = post.tags || [] 
          keywords          = keywords.join(",")
          var meta_props    = []
          var link_props    = [];
          var script_props  = [ ]
          if ( Array.isArray(options.scripts )) script_props.push(...  options.scripts  )
          if ( options.store ) {
            script_props.push({ src : "https://js.stripe.com/v3/" })
          }
          var style_props   = [] 
          if ( post.head_dynamic_css ){
            style_props.push ({ innerHTML : post.head_dynamic_css ,id:"DynamicHeadStyle"})
            
          }
          if ( Array.isArray(options.styles )) style_props.push(...  options.styles  )
          
          link_props.push({ rel:"preconnect", href:"https://fonts.googleapis.com" })
          link_props.push({ rel:"preconnect", href:"https://fonts.gstatic.com" })
          var gf_baseurl = `https://fonts.googleapis.com/css2?`

          var font_selectables = [];
          var font_query_names = [];

          //Helper function that transforms  font fames into easy form
          let a2f_list = (name)=>{//add to fonts list
            if ( ! name) return; 
            name = name.trim() ;            //ie: Roboto:wght@100;300;500
            var parts = name.split(/[:;]/gm)
            var selectable_name =  parts[0].trim() ;
            if ( !selectable_name ) return; 
            font_selectables.push ( selectable_name )
            font_query_names.push( `family=${name}` )
          }
          
          if ( Array.isArray( post.google_fonts) && post.google_fonts.length >0 ) post.google_fonts.forEach(name => a2f_list(name) )
          if ( Array.isArray( post.aux?.google_fonts)   ) post.aux?.google_fonts.forEach(name => a2f_list(name) )

          
          this.custom_font_names = font_selectables || [] 
          if ( font_query_names.length > 0 ){ 
            link_props.push({ rel: `stylesheet`,  href: `${gf_baseurl}${font_query_names.join('&')}`  })
          }

          meta_props.push({ name : 'server',     content : 'JxtPress' })
          //SEO specific
          meta_props.push({ property : 'og:title',     content : post.title })
          meta_props.push({ property : 'og:description', content : post.description })
          meta_props.push({ property : 'og:type',      content : 'website'});
          meta_props.push({ property : 'og:site_name', content : `${site_name}`});
          meta_props.push({ property : 'og:url',       content : options.full_url });
          meta_props.push({ property : 'og:locale',    content : 'en_US'})
          meta_props.push({ property : 'og:image',     content : post.feature_image })
          meta_props.push({ name     : 'description',  content: post.description })
          meta_props.push({ name     : 'keywords',     content: keywords }) 
          meta_props.push({ property : 'twitter:title',     content : post.title })
          meta_props.push({ property : 'twitter:description', content : post.description }) 
          meta_props.push({ property : 'twitter:site', content : `${site_name}`}); 
          meta_props.push({ property : 'twitter:image',     content : post.feature_image }) 
    



          //General
          meta_props.push({ name     : 'copyright',    content : `© ${cpy_right_by}, ${year}. All rights reserved`})
          meta_props.push({ property : 'generator',    content : 'JxtPress' })
          meta_props.push({ property : 'author',       content : post.created_by_title || post.created_by_name })

          if ( Array.isArray( post.metas)){
            var meta , value, the_obj 
            for(var i=0; i < post.metas.length; i++){//End to loop
              meta  = post.metas [i ];
              value = meta.value;
              if ( ! meta.name ) continue; 

              //  Get Meta Properties
              if ( meta.name.startsWith("meta_") && meta.name.endsWith("_arrobj")) {
                if ( Array.isArray(value)){
                  for(var j=0; j < value.length; j++){
                    if ( value[j].name ) {
                      meta_props.push({ name : value[j].name , value : value[j].value })
                    }
                  }
                } 
              }else if ( meta.name.startsWith("meta_" && meta.name.endsWith("_arritem"))){
                if ( Array.isArray(value)){
                  meta_props.push({ name : value[j].name , value : value[j].value.join(",") })
                } 
              }else if ( meta.name.startsWith("meta_")){
                meta_props.push({ name : meta.name.substr(5) , value  })
              }

              //  Get Link Properties
              if ( meta.name.startsWith("link_" ) ){
                if ( typeof value != 'string') continue; 
                var parts = value.split(/,/gm) ;//An array of parts
                var tokens = null;  
                the_obj = {}
                for ( var j=0; j < parts.length; j++){
                  tokens = parts[j].split(/=/gm);
                  the_obj[ tokens[0]] = tokens[1]
                }
                the_obj['s-id'] = meta.name.substr(5)
                link_props.push( the_obj )
              }//End of 


              //  Get Link Properties
              if ( meta.name.startsWith("script_" ) ){
                if ( typeof value != 'string') continue; 

                if ( meta.name.includes("raw")){
                  the_obj.innerHTML = value ;
                }else { 
                  var parts = value.split(/,/gm) ;//An array of parts
                  var tokens = null;  
                  the_obj = {}
                  for ( var j=0; j < parts.length; j++){
                    tokens = parts[j].split(/=/gm);
                    the_obj[ tokens[0]] = tokens[1]
                  }
                }
                the_obj['s-id'] = meta.name.substr(7) 
                script_props.push( the_obj )
              }//End of 

            
              if ( meta.name.startsWith("style_") && typeof value == 'string') {
                style_props.push({ innerHTML : value , 's-id' : meta.name.substr(6)})
              }
            
            }//End of looping all meta properties
          } // End of Arrays of post.metas
        post.meta_seo       =  meta_props 
        post.links          =  link_props
        post.head_scripts   = script_props;
        post.head_style     = style_props; 


        //See if there are blocks that require custom CSS and/or JS in order
        //to function property
        if ( Array.isArray(post.block_assets )) {
          post.block_assets.forEach( asset=>{
              if ( ! asset) return; 
              var loadable_resource = {}
              
              //fn_str, tag (link,script), is_editor_only
              for (var lkey in asset ) {  
                if ( lkey =='tag') continue;  
                if ( lkey =='fn_str') {  
                  asset.tag = 'script'
                  loadable_resource.innerHTML  = asset[lkey];
                }else { 
                  loadable_resource[lkey] = asset[lkey];
                } 
              }
              
              
              if ( asset.tag == 'link'){ 
                if ( asset.is_editor_only )  return; ; 
                 post.links.push( loadable_resource )
              }else if ( asset.tag == 'script'){
                if ( asset.is_editor_only )  return; ; 
                post.head_scripts .push(loadable_resource )
              } 
          })
        }//End of custom block CSS & JS
        
      }

      this.rendered_post = post 
      return this.rendered_post
    },
  
    async load_form (options ) {
      if ( ! options ) return null; 
      var { post_id } = options ;
      var res = await useRequest({ url: "/api/posts/form", method: 'get', query : { id : post_id }})
      return res.d 
    },
    /**
     * From a shopping location, process the user click event of 
     * subscribe, buy_now, or add_to_cart by sending to server. 
     * 
     * @param {Object} body { post_id, action , quantity}
     * @requires {Object} server response
     */
    async post_action_button(body){
       if ( ! body  ) return null; 
       var res = await useRequest( {url:"/api/ecommerce/post-action", method: 'post', body })
    },
    /**
     * Retrieve the source code for a plugin 
     * @param {Object} options { src_path }
     * @returns {Object} { src : the Source Code }
     */
    async get_plugin_src(options ) {
      if ( ! options ) return null;
      if ( ! options.src_path ) throw new Error("Source Path is required")

      var res = await useRequest({
        method : 'get',
        url : "/api/site/plugin-src",
        query : { src : options.src_path }
      })
      return res.d 
    },
    /**
     * Create or update a new plugin
     * @param {Object} options { src_path , value : new content}
     * @returns 
     */
    async set_plugin_src ( options ) {
      if ( ! options ) return null; 
      if ( ! options.src_path ) throw new Error("Source Path is required")
      if ( options.value == undefined) throw new Error("Source code value is required")

      var res = await useRequest({
        method : 'post',
        url : "/api/site/plugin-src",
        body  : { src : options.src_path, value : options.value  }
      })
      return res.d 
    },
    /**
     * Delete plugin specified by src_path 
     * @param {Object} options { src_path}
     */
    async remove_plugin( options ) {
      var res = await useRequest({
        method : 'delete',
        url : "/api/site/plugin-src",
        body  : { src : options.src_path }
      })
      return res.d 
    }, 
    /**
     * Get a new plugin
     * @returns {String} Sample code for a new plugin
     */
    async get_new_plugin_template(){ 
      var res = await useRequest({
        method : 'get',
        url : "/api/site/plugin-src-new", 
      })
      return res.d 

    },
    /**
     * Get comments related to specified post
     * @param {Object} options { post_id }
     */
    async load_comments(options){
      var res = await useRequest({ method: 'get', url : '/api/comments' , query : options })
      return res.d 
    },
    /**
     * Submit a new comment to for a given post
     * @param {Object} options { title, post_id, value }
     */ 
    async post_comment(options) {
      var res = await useRequest({ method: 'post', url : '/api/comments' , body : options })
      return res
    },
    /**
     * Manage the status of a comment 
     * @param {Object} options { id : Comment id, status }
     */
    async manage_comment(options){
      var res = await useRequest({ method: 'post', url : '/api/comments/manage', body: options })
      return res;
    },
    /**
     * The user would like to mark their preference for an object 
     * @param {Object} options { object_type, object_id , value : optional }
     * @returns {Object}
     */
    async like ( options ) {
      var res = await useRequest({ method: 'post', url : '/api/likes', body : options})
      return  res 
    },
    /**
     * Create a popup notice that will auto close based or closes when clicked.  Use type to specify color presentation
     * @param {Object} options { title, content , type : optional (danger,primary, success, warn)}
     */
    push_notice(options ) {
      if ( ! options ) return false;

      // get or create the notice container
      let notice_root = document.querySelector(".notice-container");// container to hold notices
      if ( ! notice_root ) {
        notice_root = document.createElement('article')
        notice_root.classList.add("fixed","position-fixed", "flex", "items-center","justify-center", "flex-col","gap-1", "p-2", "w-full","z-500") 
        notice_root.style.bottom="0px" 
        document.body.appendChild(notice_root)
        notice_root.classList.add("notice-container")
      }

      //Create the notice shell and style it
      let notice = document.createElement("ul") 
      notice.classList.add("notice","flex", "gap-2","items-start", "opacity-20","shadow")
      notice.style.transition= "transform 240ms ease-in-out, opacity 240ms ease-in-out"
      notice.style.transform = "translate(0px,30px) scale(0.6)"
      notice.style.minWidth="11.5em"
      notice.style.minHeight="1.0em"
      let notice_content = document.createElement("li")
      notice_content.classList.add("notice-content", "m-0","flex-1")

      //placement for notice image -if any && for text
      let notice_media = document.createElement("li") 
      notice_media.classList.add("notice-media", "m-0")
      

      notice.appendChild(notice_media)
      notice.appendChild(notice_content)

      //Fill out text, description and image
      var title=document.createElement("h3")
      title.innerHTML = options.title || ""
      title.classList.add("text-base")
      var txt_content = document.createElement("div")
      txt_content.innerHTML = options.content || ""
      notice_content.appendChild(title)
      notice_content.appendChild(txt_content) 
      if ( options.img ) {
        if ( options.img.startsWith("<svg")) {
          notice_media.innerHTML = options.img 
        }else { 
          notice_media.innerHTML =`<img src="${options.img}">` 
        }
      } 
      //Add notice to root
      notice_root.appendChild(notice) 
      setTimeout(()=>{
        notice.classList.remove("opacity-20")
        notice.classList.add("opacity-100")
        notice.style.transform = "translate(0px,0px) scale(1.0)"
      },5)

      if ( options.type == 'danger'){
        title.classList.add("color-red-500")
      }else if ( options.type == 'success'){
        title.classList.add("color-green-500")
      }else if ( options.type == 'primary'){
        title.classList.add("color-primary-500")
      }

      let delay = 5350
      if ( options.delay != undefined){
        if ( options.delay == false ) delay=null; 
        else {
          delay = options.delay 
        }
      }
      let close_notice = ()=>{
        notice.style.transform = "translate(0px,15px) scale(0.6)"
        notice.classList.add("opacity-10")
        setTimeout(()=> notice.remove(),250)//allow animation time to save and then close out
      }
      if ( delay ) {
        setTimeout(()=> close_notice() ,delay)
      }
      notice.addEventListener('click', close_notice )
    }
  },

})

