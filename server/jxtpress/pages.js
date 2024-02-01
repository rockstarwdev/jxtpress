import core from "./core"
import db from "./db"
import db_tables from "./db_tables";
import ecommerce from "./ecommerce";
import plugin from "./plugin"
import users from "./users"


/**
 * Copy contents of  d_instance into class data
 * @param {Object} d_instance The data to copy to class instance
 * @param {Instance} class_instance an instance of a block Object
 * @returns {Instance}
 *//*
let copy_to_instance = (d_instance, class_instance)=>{
    if ( ! d_instance ) return class_instance; 
    if ( d_instance.data ){
      if ( ! d_instance.id ) return class_instance;
      for ( var k in d_instance.data )  {
        class_instance[k] = d_instance.data[k] 
      }
    }
    return class_instance
} */
let copy_to_instance = (block_instance, class_inst)=>{
    if ( !block_instance ||!class_inst) return; 
    if (block_instance.data ===null || block_instance.data===undefined) block_instance.data = {}
    var value = null;
    
    var key_set = Object.keys(block_instance.data)
    for(let key of Object.keys(class_inst)){
        if ( !key_set.includes(key)) key_set.push(key);
    }
    
    //loop all the keys of block_instance data to copy into data
    for ( let key of key_set){
        value = null; 
        if (block_instance.data[key] != undefined )value = block_instance.data[key]
        if ( value == null && class_inst[key] != undefined)value = class_inst[key] 
        //value = block_instance.data[key] || class_inst[key]  
        class_inst[key] = value  
        block_instance.data[key] = value; 
    }
}

class Pages {
    async _init (options){
        let user = options.user || { }; 
        options.user              = await users.get_user({user_id : user.id }) 
        options.page              = options.page; // { url , query, param }

        options.page_data         = {}  //data specific to the page being viewed
    }
    /**
     * Produce a very generic page layout for the user
     * @param {Object} options { post_type }
     * @returns {Object} Post type
     */
    async get_autogen_layout(options){
        return {
            id : "autogen",
            title : options.post_type || options.title ,
            description: "",  type : "layout", status : "published",
            value : [
                { id : 'EO1HeaderNave', type : 'headernav', 
                    data :{
                        logo_text : " {{ site.site_title }}",
                        classes: "mb-5",
                        primary_url : "/",
                        logo_font_size : "1.5em"
                    }
                
                },
                { id : "E01Container", type : "container",
                  data : {},
                  children: [
                    { id : "E01Header", type:"title", data : {  level : 1 ,text : "@page.slug;"}  },
                    { id : "E01SiteTitle", type : "sitetitle", data : {}, children :[]},
                    { id : "E01PostConent",type : "postcontent", data : {}, children:[] },
                    { id : "E01PostLoop", type : "postloop", data : {}, children : [] },
                    { id : "E01PostPagination", type : "postpagination", data : {}, children : [] }
                  ]
                }
            ]
        }
    }
    /**
     * Return a default - resource not found (404) message
     * @param {Object} options 404 Post Description
     * @returns 
     */
    async get_404_post(options){ 
        var title =  (options.type||"Resource") + " not found"
        if ( options.native ) title = null 
        var default_404 = { 
            title , id : options.id,
                description : "Could not locate " + (options.type||"resource") ,
                type : "default-404",status:"published",  image: "/assets/img/404.png", layout : null ,
                value : [
                    {  id : "I404Container", type : "Container", data : {
                        classes : "my-8 py-8"
                    },
                        children : [
                            {   id : "I404Title", type : "title", data :{
                                    level : 1, text : "404", classes : "color-primary-500 text-xl"
                                }, children : []
                            },
                            {   id : "I404Image",
                                type : "Image", data :{
                                    url : "https://cdn.freebiesupply.com/blog/23-11-2018/jepygq-x5.png",
                                    width: "100%", height: "",title: "",description:"",classes: ''
                                }, children : [] 
                            },
                            {   id : "I404Paragraph",
                                type :"Paragraph", data : {
                                text : `Unable to locate the <b>${options.type||"resource"}</b> specified at <u>${options.full_url}</u>.  `+
                                    `Apologies for the inconvenience.  ` +
                                    `Please double check the link and or contact site administrator for assistance.`,
                                    classes: '',
                                title : ``,
                            } , children : []},
                            {
                                id : "I404Paragraph2",
                                type : "Paragraph", data :{
                                    text : `Return to <a href="/">home page</a>.`, classes : 'mt-5 mb-3'
                                },
                                children : []
                            },
                        ]
                    },
                    
                ]
            };

        var opt = await core.get_option({ name : `layout_for_404`})
        if ( opt ) {
            var tbposts = `${db.name}.posts`
            var ret = await db.query(`SELECT id FROM ${tbposts} WHERE ${db.is('id',opt.value)}`)
            if ( ret.length > 0) {  
                var post_obj  = await this.get_post({ id : ret[0].id })
                if ( post_obj ) default_404 = post_obj
            }
        }
        return default_404
    }


    /**
     * Return a default - access forbidden (403) message
     * @param {Object} options 403 Post Description
     * @returns 
     */
    async get_template_403(options){

        var p_403 = { 
            title : (options.type||"Resource") + " Forbidden", id : options.id,
                description : "You do not have adequate permission for " + (options.type||"resource") ,
                type : "default-403",status:"published",  image: "/assets/img/403.png", layout : null ,
                value : [
                    {  id : "I403Container", type : "Container", data : {
                        classes : "my-8 py-8"
                    },
                        children : [
                            {   id : "I403Title", type : "title", data :{
                                    level : 1, text : "403", classes : "color-primary-500 text-xl"
                                }, children : []
                            },
                            {   id : "I403Image",
                                type : "Image", data :{
                                    url : "https://img.freepik.com/free-vector/403-error-forbidden-with-police-concept-illustration_114360-1923.jpg",
                                    width: "100%", height: "",title: "",description:"",classes: ''
                                }, children : [] 
                            },
                            {   id : "I403Paragraph",
                                type :"Paragraph", data : {
                                text : `The resource <b>${options.type||"resource"}</b> specified at <u>${options.full_url}</u> is restricted.  `+
                                  
                                    `If you believe you shouild have access, please double check the link and or contact site administrator for assistance.`,
                                    classes: '',
                                title : ``,
                            } , children : []},
                            {
                                id : "I403Paragraph2",
                                type : "Paragraph", data :{
                                    text : `Return to <a href="/">home page</a>.`, classes : 'mt-5 mb-3'
                                },
                                children : []
                            },
                        ]
                    },
                    
                ]
            };

        var opt = await core.get_option({ name : `layout_for_403`})
        if ( opt ) {
            var tbposts = `${db.name}.posts`
            var ret = await db.query(`SELECT id FROM ${tbposts} WHERE ${db.is('id',opt.value)}`)
            if ( ret.length > 0) { 
                console.log ("-    Am00 2",ret[0].id )
                var post_obj  = await this.get_post({ id : ret[0].id })
                if ( post_obj ) p_403 = post_obj
            }
             
        }
        return p_403
    }
    async _process_media_update(post){
        if ( ! post ) return; 
        var index = post.url.lastIndexOf("/");
        var sub_url = post.url.substring(0,index);
        var new_url = sub_url+ "/"+ post.title;

        
        var root = core.get_server_root() + (post.is_public== undefined || post.is_public==true ? '/public' : '/private')
        var old_path = root + post.url;
        var new_path = root + new_url;
        core.rename_file(old_path, new_path);

        db.update('posts',{ id : post.id, title : post.title, url : new_url })

        //console.log ("Process Media ", index , `old(${post.url}) vs new(${new_url})`,old_path, new_path)
    }
    async _admin_init(options){
        let page = options.page;
        if (!page) return; 

        if (page.url == "/user/plugins"){
            options.page_data.plugins = await plugin.get_plugins() 
        }
    }
    async frontend_init(options={}){

        if ( ! options.page ) core.throw("frontend_init Requires page object to be specified")

        let page = options.page;   // page the user is calling from;
        options.page              = options.page; // { url , query, param }
        

        await this._init(options);
        /* {plugin A page is being initialized prior to load } */
        plugin.run_action('frontend_init', options );


        /* {plugin Filter the output of admin_init }*/
        return await plugin.run_filter("frontend_init", options);
    }
    /**
     * Invoked during server middleware as user is about to view contents of a page.
     * @param {Object} options settings and data for the page
     * @returns {Object}
     */
    async admin_init (options = {}){
        if ( ! options.user ) core.throw("admin_init Requires a user object")
        if ( ! options.page ) core.throw("admin_init Requires page object to be specified")
        let user = options.user; 
        let page = options.page; 
        // page the user is calling from;
        options.admin_menu_links  = await core.get_menu_links({user_id : user.id, current_page : page.url })
        options.user              = await users.get_user({user_id : user.id })
        options.dashboard_title   = await core.get_option({ name : "dashboard_title", flat: true, value :"" });


        await this._init(options);
        await this._admin_init(options);
        /* {plugin A page is being initialized prior to load } */
        plugin.run_action('admin_init', options );


        /* {plugin Filter the output of admin_init }*/
        return await plugin.run_filter("admin_init", options);
    }
    /**
     * The post passed in is currently not a draft and needs to be a draft (source_id) set
     * @param {Object} post Post to version control
     */
    async __version_post(post){ 
        let tb_post         = `${db.name}.posts`
        let tb_post_tags    = `${db.name}.post_tags`
        let tb_tags         = `${db.name}.tags`
        let tb_metas        = `${db.name}.post_metas`;

        // unset post id so a new id can be obtained
        var post_id = post.id ;
        delete post.id ; 
        if ( ! Array.isArray (post.metas )) post.metas = [];
         
        var existing_metas = await db.query(`SELECT * FROM ${tb_metas} WHERE ${db.is('post_id', post_id)}`)
        existing_metas.forEach(emeta=>{
            var found = post.metas.find ( it => it.name == emeta.name );
            if ( ! found ){//when not found in post.metas, add it
                delete emeta.id; 
                delete emeta.post_id;
                post.metas.push( emeta )
            }
        })
        var meta ;
        for ( var m =0; m < post.metas.length; m++){
            meta = post.metas[m];
            delete meta.id ;     //delete the meta's id so we can get a new one
            delete meta.post_id; //unset post id as new one will be assigned in normal savin
            delete meta.created;
            delete meta.modified;
        }
        
        if ( ! Array.isArray(post.tags)) posts.tags = []
        var existing_tags = await db.query(`SELECT title FROM ${tb_tags} WHERE id IN `+
                                        `(SELECT tag_id FROM ${ tb_post_tags } WHERE ${db.is('post_id', post_id)})`)
        existing_tags.forEach(etag=>{
            var found = posts.tags.find ( str_title => str_title == etag.title)
            if ( ! found ) {
                posts.tags.push ( etag.title )
            }
        })

        post.source_id = post_id;//inform this "new" post, that it is a version of "post_id"
        //clear out created and modified values
        delete post.created 
        delete post.modified
    }
    /**
     * 
     * @param {Object} post a draft post (source_id is set) to be published
     */
    async __integrate_post(post){
        let tb_post         = `${db.name}.posts`
        let tb_post_tags    = `${db.name}.post_tags`
        let tb_tags         = `${db.name}.tags`
        let tb_metas        = `${db.name}.post_metas`;

        if ( ! Array.isArray (post.metas )) post.metas = [];
        if ( ! Array.isArray(post.tags))    post.tags = []
        var source_id       = post.source_id 
        var draft_id         = post.id ;

        

        var all_draft_metas = await db.query(`SELECT * FROM ${tb_metas} WHERE ${db.is('post_id', draft_id)}`)//move draft -> published post
        all_draft_metas.forEach(draft_meta=>{
            var found = post.metas.find ( it => it.name == draft_meta.name );
            if ( ! found ){//when not found in post.metas, add it
                delete draft_meta.id; //delete the draft meta id so so we can integrage with offical  post
                draft_meta.post_id = source_id; //update the meta to the source id
                post.metas.push( draft_meta )
            }
        })
        //At this point, post.metas as all known meta properties

        var meta ;
        for ( var m =0; m < post.metas.length; m++){
            meta            = post.metas[m];
            delete meta.id ;     //delete the meta's id so we can get a new one
            meta.post_id    = source_id; // associated post to the source post that we are publishing
            delete meta.created;
            delete meta.modified;
        }
        //grab all source_meta tags that are currently exist and check it against the post.metas, if not found there then we need to delete
        var all_source_metas = await db.query(`SELECT * FROM ${tb_metas} WHERE ${db.is('post_id', source_id)}`)//move draft -> published post
        for ( var m =0; m < all_source_metas.length; m++){
            meta            = all_source_metas[m];
            var found       = post.metas.find ( it => it.name == meta.name);
            if ( found ) {//if found, it means this meta property is was deleted within draft version and now we need to delete in publish
                db.query(`DELETE FROM ${tb_metas} WHERE id=${meta.id}`);
            }
        }



        var all_draft_tags = await db.query(`SELECT title FROM ${tb_tags} WHERE id IN `+
                                        `(SELECT tag_id FROM ${ tb_post_tags } WHERE ${db.is('post_id', draft_id)})`)
        all_draft_tags.forEach(etag=>{
            var found = post.tags.find ( str_title => str_title == etag.title)
            if ( ! found ) {
                post.tags.push ( etag.title )
            }
        })
        var sql0 = `(SELECT title FROM ${tb_tags} WHERE id=T.tag_id) as title `
        var all_source_tags = await db.query(`SELECT id, tag_id, ${sql0} FROM ${ tb_post_tags } T WHERE ${db.is('post_id', source_id)}`)
        var tag ;
        for( var i=0; i < all_source_tags.length; i++){
            tag = all_source_tags[i];
            var found = post.tags.find ( str_title => str_title == tag.title );
            if ( ! found ) {
                db.query(`DELETE FROM ${tb_post_tags} WHERE id=${tag.id}`)
            }
        }
 
        //clear out created and modified values
        delete post.created 
        delete post.modified 
        post.id         = source_id ;
        post.source_id  = null; //we are no longer a draft
    }
    /**
     * Verisoning is part of {pages.update_post} and is designed to check a post's status to and from status "draft".  Versoning 
     * will only occur for posts that have been saved already (posts with ids)
     * @param {Object} post the post that is about to be saved in the database
     */
    async _perform_verisoning(post){
        if ( ! post )       return; 
        if ( ! post.id )    return ;
        if ( post.status === undefined) return; 
        let tb_post         = `${db.name}.posts`
        let tb_post_tags    = `${db.name}.post_tags`
        let tb_tags         = `${db.name}.tags`
 
        //Get the current state of the post and always set source_id
        var before_post     = (await db.query(`SELECT * FROM ${tb_post} WHERE ${db.is('id',post.id)}`)) [0] || null;
        if ( ! before_post ) return ;
        post.source_id      = before_post.source_id;

        var status_changes  = [before_post.status?.toLowerCase(), post.status?.toLowerCase()]
        if ( before_post.status == post.status) {   return }
        if ( !status_changes.includes('draft')) {  return ;  }

        var is_post_a_draft = post.source_id != null; 

        if ( status_changes[1] == 'published'){ 
            // Status is changing from draft to x
            core.log (` - Integrating ${before_post.status} -> ${post.status}`)
            await this.__integrate_post(post)
        }
        if ( status_changes[1] == 'draft') { 
            core.log (` - Verisoning ${before_post.status} -> ${post.status}`)
            await this.__version_post(post)
        }
        
    }
    /**
     * Save a post
     * @param {Object} post { ... metas:Array, tags :Array } the post to save
     * @returns {Object}
     */
    async update_post(post ){
        if ( ! post ) return post; 
        if ( !Array.isArray(post.tags))post.tags =[]
        if ( !Array.isArray(post.metas))post.metas =[]
        let tb_post         = `${db.name}.posts`
        let tb_post_tags    = `${db.name}.post_tags`
        let tb_tags         = `${db.name}.tags`

        var is_new          = post.id == undefined || post.id == null || post.id==-1;
        var existing_type   =null;
        var existing_url    =null; 
        //Get Existing Data
        var existing_record = null; 
        if ( ! is_new ) {//when not new, get existing recourd
            existing_record = await db.query(`SELECT account_id, group_id,published,status, type, url FROM ${tb_post} WHERE id=${db.esc(post.id)}`);
            if ( existing_record.length >0){ //Record exist?
                existing_record = existing_record[0];
                existing_type   = existing_record.type;
                existing_url    = existing_record.url;
            }//end of record found
        } 
        let type = existing_type || post.type ;
        if ( ! type  )   core.throw("Unable to create post without post.type", { err : 'update_post'});
        let is_private_type = type.charAt(0) == '_'
        post.type = type;

        //Use this if-else-block to ensure that once a post is published, the public date will never change
        var hold_old_published_value = post.published;
        if ( post.status != 'published'){//if status is not published, remove publish date to avoid override publish date
            delete post.published;
        }else {                         //if status is published & this is not a new object && publish date is still empty
            delete post.published       
            if ( !is_new && !existing_record.published ){ //publish using today
                post.published = "now" //create published date once
            }
        }


        // do versioning on all types except for private types - types starting with "_"
        if ( !is_private_type ) await this._perform_verisoning(post);
        
        /**
         * Post being prepared for database insert or update. 
         */
        post            = await plugin.run_filter('before_update_post', post );
        //--------------------------------------------------------
        //DO Database Update
        //--------------------------------------------------------
        post             = await db.update('posts', post);
        post.published   = hold_old_published_value;//restore whatever value was held in published
        console.log ( post ) 

        if ( existing_type == 'media') { 
            post.url = existing_url;
            this._process_media_update(post);
        }

        //If the post type is not private ,auto save metas and tags
        if ( !is_private_type ){
            // Auto Create Tags and associate it with the post.id
            var sql = `SELECT id, title FROM ${tb_tags} WHERE ${db.is('account_id',post.account_id)} AND `+
                        `${db.like("title", post.tags )}`
            var tag_ids = await db.query(sql);
            var tag_arr_to_create = [], tag_arr_existing =[], tag_does_exist=false;
            for (var i=0; i < post.tags.length; i++){
                tag_does_exist=false;
                var str_tag = post.tags[i].toLowerCase()
                for ( var j=0; j < tag_ids.length; j++){
                    if ( tag_ids[j].title && tag_ids[j].title.toLowerCase() ==str_tag){
                        tag_arr_existing.push ({ tag_id : tag_ids[j].id , post_id : post.id  })
                        tag_does_exist = true;
                    }
                }
                if ( !tag_does_exist ){
                    var t_tag = await this.update_tag({ title : post.tags[i] , account_id : post.account_id})
                    tag_arr_existing.push({tag_id : t_tag.id , post_id : post.id})
                }
            } 
            var tag_pair =null, existing_pair;
            for(var i=0; i < tag_arr_existing.length; i++){
                tag_pair = tag_arr_existing[i];
                if ( !tag_pair.tag_id || ! tag_pair.post_id) continue; 
                existing_pair = await db.query(`SELECT id FROM ${tb_post_tags} WHERE `+ 
                                        `post_id=${tag_pair.post_id} AND tag_id=${tag_pair.tag_id}`)
                if ( existing_pair.length==0){//does not exist, if not exist then create it
                    await db.query(`INSERT INTO ${tb_post_tags} (post_id, tag_id) VALUES (${db.esc(tag_pair.post_id)},${db.esc(tag_pair.tag_id)})`)
                }
            }
            //Save post layout
            var pageout_obj = { name : 'layout',  value : post.layout ,   post_id : post.id    }
            var page_image  = { name: 'feature_image', value : post.image , post_id: post.id };
                                
            var manual_metas = ['layout','feature_image']

            if ( ['product','price','order'].includes( type ) ){
                post.type = type;
                await ecommerce.update( post )
            }
            await this.update_meta(pageout_obj)
            await this.update_meta(page_image)

            //Update post Metas
            for (var i=0; i< post.metas.length; i++){
                if ( manual_metas.includes ( post.metas[i].name) ) continue; 
                post.metas[i].post_id = post.id; 
                post.metas[i]  =await  this.update_meta(post.metas[i])
            }

        }

       
        return post 
    }
    /**
     * Get a post by id or its URL
     * @param {Object} options {id, url, eid}
     */
    async get_post(options ) {
        if ( ! options ) return null;  
        let tb_post = `${db.name}.posts`
        let tb_post_tags = `${db.name}.post_tags`
        let tb_tags = `${db.name}.tags`
        let tb_meta = `${db.name}.post_metas`
        let tb_users = `${db.name}.users`
        let tb_groups= `${db.name}.groups`

        var where = [], id_is_type_name =false; 
        if ( options.id ) { 
            where.push(db.is('id',options.id))
            if (!core.is_numeric(options.id)){
                id_is_type_name = true; 
            }
        }
        if ( options.url ) where.push(db.is('url',options.url))
        if ( options.eid ) where.push(db.is('eid', options.eid ))
        if (where.length==0)return null;

        var post = null; 
        if ( id_is_type_name ){
            post = { 
                type : options.id , created_by : options.user_id , 
                parent_id : null, status : "initial", title : "New "+options.id , 
                value : [], description : `Describe the new ${ options.id }` ,
                metas : [], tags : [], is_new_post : true, 
            }
            var arr_post_type = await core.get_post_types() 
            var post_type = await arr_post_type.find( it => it.name == options.id );
            if ( post_type ) { 
                var cap = post_type.capability; 
                if ( ! await core.can_user({ user_id :  options.user_id , cap })) { 
                    post.title ="Permission Denied"
                    post. error = true
                    post.description = `You are not allowed to complete this action for <span class="tag">${options.id}</span>.  Please request access to <span class="tag danger">${cap}</span> and try again.`
                    post.value = [
                        { 
                            type : "paragraph", children : [], 
                            data : {
                                classes: "color-red-500",
                                text : `You are not allow to create <b>Post ${options.id }</b> `
                            }
                        }
                    ]
                }
            }
            return post; 
        }

        var extra_columns = 
        `, (SELECT name FROM ${tb_users} WHERE id=T.created_by) as created_by_name ` +
        `, (SELECT title FROM ${tb_users} WHERE id=T.created_by) as created_by_title` +
        `, (SELECT title FROM ${tb_groups} WHERE id=T.group_id) as group_title`;

        post = await db.query(`SELECT * ${extra_columns} FROM ${tb_post} T WHERE ${where.join(' AND ')}`)
        post = post[0]||null; 
        if (!post ) return null; 

        if ( post.value != null){
            if ( typeof post.value == 'string'){
                if ( post.value.charAt(0) == '[' || post.value.charAt(0) == '{'){
                    post.value = JSON.parse(post.value)
                }
            }
        }
        var tags = await db.query(`SELECT id, title FROM ${tb_tags} WHERE `+
                    ` id IN (SELECT tag_id FROM ${tb_post_tags} WHERE post_id=${post.id})`)
        post.tags = tags.map (it => it.title );

        post.metas = await db.query(`SELECT * FROM ${tb_meta} WHERE post_id=${post.id}`)
        for (var i=0; i < post.metas.length; i++){
            post.metas[i].value = await core.type_cast( post.metas[i].value, post.metas[i].name && post.metas[i].name.endsWith('_secret') )
        }
        if ( post.amount != null) post.amount = parseFloat(post.amount )
        //Keep the layout at top level
        let layout          = post.metas.find(it => it.name == 'layout'); 
        let feature_image   = post.metas.find(it => it.name == 'feature_image')
        post.layout         = layout ? layout.value : null; 
        post.image          = feature_image ? feature_image.value : null; 
        return post 
    }
    /**
     * Return an array of post that match a given set of criteria.  If you wish to include the meta properties as part of the results
     * then ensure to set { meta : true } within options argument
     * @param {Object} options Search by { type, group_id, created_by, status,linked_to, id, parent_id , meta: Boolean }
     * @returns {Array}
     */
    async get_posts ( options ) {
        if ( ! options ) return [];  
        let tb_post         = `${db.name}.posts`
        let tb_post_tags    = `${db.name}.post_tags`
        let tb_tags         = `${db.name}.tags`
        var tb_postaccess   = `${db.name}.post_access`
        let tb_meta         = `${db.name}.post_metas`
        let tb_groups       = `${db.name}.groups`
        let tb_users        = `${db.name}.users`
        if ( ! options.user_id ) options.user_id = null
        /* Set this to true when what is being selected is a calendar like event */
        let selecting_events= false;
        options             = await plugin.run_filter("before_get_post",options)
        //Where expressions 
        var where = [];
        if ( options.type       ) { 
            where.push(db.like('type',options.type )) 
            if ( options.type == 'calendardata') { 
                selecting_events = true; 
            }
        }
        if ( options.account_id ) where.push(db.is('account_id', options.account_i))
        if ( options.group_id   ) where.push(db.is('group_id', options.group_id))
        if ( options.created_by ) where.push(db.is('created_by', options.created_by))
        if ( options.status     ) where.push(db.is('status', options.status))
        if ( options.linked_to  ) where.push(db.is('linked_to', options.linked_to))
        if ( options.id         ) where.push(db.like('id', options.id ))
        if ( options.eid        ) where.push(db.like('eid', options.eid ))
        if ( options.linked_eid ) where.push(db.like('linked_eid', options.linked_eid  ))
        if ( options.parent_id  ) where.push(db.is('parent_id', options.parent_id ))
        if ( options.source_id  ) where.push(db.is('source_id', options.source_id))

        // handy function to repeat logic that sets conditional expression based on key types that exist 
        db.add_temporal_condition( 'start'      , options, where)
        db.add_temporal_condition( 'end'        , options, where )
        db.add_temporal_condition( 'encounter'  , options, where )
        db.add_temporal_condition( 'created'    , options, where )
        db.add_temporal_condition( 'updated'    , options, where )
        
        
        where.push( "(" + this.get_post_sql_access_rights( options.user_id ,  "Posts")  +" ) ")

        if (where.length==0)    return [];
        var group_title = `(SELECT title FROM ${tb_groups} WHERE id=Posts.group_id) as group_title`
        var user_name = `(SELECT name FROM ${tb_users} WHERE id=Posts.created_by) as created_by_name`
        var child_count = `(SELECT COUNT(id) FROM ${tb_post} WHERE parent_id=Posts.id AND (status != "deleted" AND status != "delete" )) as child_count `
        
        
        
        //Get the posts
        var where_expr = where.join(' AND ');
        if ( selecting_events ) { // for calendar event types, splice in additional conditions to target events that reoccur
            where_expr = `(${where_expr}) OR (type='calendardata' AND aux IS NOT NULL AND aux LIKE 'FREQ=%')`
             
        }
        var sql_columns = "*"
        var sql_includes_value = true; 
        if ( options.columns || options.cols){
            var columns = options.columns || options.cols;       
            if ( !Array.isArray(columns) ) columns =columns.split(/,/gm);

            for(var i=columns.length-1; i > -1;  i--){
                columns[i] = columns[i].trim();
                if ( ! columns[i] ) {//empty string, so skip
                    columns.splice(i,1);
                    continue;
                }
                if ( !db_tables.posts.includes( columns[i] )){//if not column name does not exist in post table, skip
                    columns.splice(i, 1);
                    continue; 
                } 
            }
            if ( columns.length > 0 ) sql_columns = columns.join(",")
            sql_includes_value = columns.includes('value')
        }
        var sql_prep = `SELECT ${sql_columns}, ${group_title}, ${user_name}, ${child_count} FROM ${tb_post} Posts WHERE ${where_expr} `;
        var limit_query = await db.page_limit(options)

        var do_pagination = true; 
        if ( selecting_events ) {
            do_pagination = false;  
        }

        if ( !do_pagination){
            limit_query = ''; 
        }
        var sql = `${sql_prep } ${ limit_query }`
    
         
        var posts = await db.query(sql) 
        if ( do_pagination ){ 
            await db.pagination(posts,{ table : tb_post, where: where_expr, p : options.p, limit : options.limit, table_alias: "Posts" })
        }

        if ( selecting_events ) { 
            await this.generate_occurrence_instances ({ source_posts : posts, start : options.start   })  
        }

        //Grab all the meta properties that matches all the posts that we just selected
        var all_metas           = []; 
        var all_access          = [];
        var meta_option         = options.metas || options.meta ; 
        var access_option       = options.access || true 
        var include_metas = meta_option == 'true' || meta_option == true
        var include_access = access_option == 'true' || access_option == true 

        if ( include_metas ) { 
            var sql_metas = `SELECT * FROM ${tb_meta} WHERE post_id IN (SELECT id FROM ${tb_post} Posts WHERE ${where_expr} )`
            all_metas = await db.query(sql_metas);
        }
        if ( include_access ) {
            var presel = `SELECT title FROM ${tb_groups} WHERE `
            var cols = `(${presel} id = T.read_group) as read_title, (${presel} id = T.update_group) as update_title, (${presel} id = T.delete_group) as delete_title `
            var sql_access = `SELECT *, ${cols} FROM ${tb_postaccess} T WHERE post_id IN (SELECT id FROM ${tb_post} Posts WHERE ${where_expr} )`
            all_access = await db.query(sql_access);
        }
        //Type Cast the post.value into Array/Object when appropriate && 
        // associate metas with their right post object
        if ( include_metas || sql_includes_value ){  //only do below work if value column was asked or meta values were asked for
            for(var i=0; i < posts.length; i++){
                if ( sql_includes_value ) posts[i].value = await core.type_cast( posts[i].value)
                if ( include_metas ) { 
                    posts[i].metas = [];
                    if ( all_metas.length > 0 ) {
                        posts[i].metas = all_metas.filter( meta => meta.post_id == posts[i].id ) || []
                    }
                }
            }
        }
        if ( include_access && Array.isArray(all_access)  ){
            for(var i=0; i < posts.length; i++){
                posts[i].access = all_access.filter (access => access.post_id == posts[i].id ) || []
            }
        }


        /**
         * {plugin Filter results of posts being queried}
         */
        return await plugin.run_filter("get_post",posts); 
    }
    async update_tag(tag ){
        return await db.update('tags', tag);
    }
    /**
     * Manage removal of a post by transitioning it to 
     * @param {Object} options { id }
     * @returns Boolean True when the post is removed from the database
     */
    async remove_post(options){
        if ( ! options ) return false; 
        var id      = options.id;
        let tb_post = `${db.name}.posts`
        let tb_metas = `${db.name}.post_metas`

        //Get the current status of the post from the db
        var ret = await db.query(`SELECT id,status,type,url FROM ${tb_post} WHERE ${db.is('id',options.id)}`);
        if ( ret.length == 0) return false; 
        var post = ret[0];
        // not already marked as delete, flag it for deletion
        if (  post.status != 'delete') {
            if ( post.type != 'media'){ 
                post.status = 'delete'
                db.update('posts', post);
                plugin.run_action('remove_post_pre', post)
                return false;
            }
        }
        
        if ( post.type == 'media'){
            var sub_root = "/public";
            if ( post.is_public == false || post.is_private==true){
                sub_root = "/private"
            }
            var path = core.get_server_root() + sub_root + post.url; 
            await core.remove_file(path);
        }
        //at this point, the post was previously marked as delete, so we can go ahead and delete it
        await db.query(`DELETE FROM ${tb_metas} WHERE ${db.is('post_id', post.id)} OR ` + 
                        `post_id IN (SELECT id FROM ${tb_post} WHERE ${db.is('source_id', post.id )})`)
        await db.query(`DELETE FROM ${tb_post} WHERE ${db.is('id', post.id)} OR ${db.is('source_id', post.id)}`)
        plugin.run_action('remove_post', post)

        return true
    }
    /**
     * Create or Update a meta for a specific post_id while ensuring the meta property does not repeat more than once 
     * for a specific post_id and name combination
     * @param {Object} meta {id , post_id, name, value} or Array of { id, post_id, name, value }
     * @returns {mixed} An Array or Object based on what was passed in
     */
    async update_meta( meta ) {
        let ret = null; 
        if ( ! Array.isArray(meta)){  // for individual meta properties that need to be saved
            if ( ! meta) return null;  
            if ( ! meta.post_id ) return meta ;
            if ( ! meta.name ) return meta;  

            var record = await db.query(`SELECT id ,name, value FROM ${db.name}.post_metas `  + 
                        ` WHERE ${db.is('post_id',meta.post_id)} AND ${db.is('name',meta.name)}`)
            if ( record.length >  0){
                meta.id = record[0].id ;
                if ( meta.value === undefined && meta.name === undefined) return meta;//skip when asked to save nothing
                if ( meta.value === undefined && meta.name === record[0].name) return meta;//skip if no value was provided, and the name is same
            }
        
            ret= await db.update('post_metas', meta);   
        }else {
            //For Array of meta properties that need to be 
            var arr = meta, m; 
            var needing_ids = [], query_post_ids = [], query_meta_names = []
            for ( var i=0; i < arr.length; i++){//loop all these meteas, seach for those without ids
                m = arr[i];
                if ( ! m.id ) { //if no id
                    if ( !m.post_id ) {   continue;  }
                    if ( !m.name ) {     continue;  }
                    // Add to tracking, collect ids and meta names
                    needing_ids.push ( m );
                    query_post_ids.push( m.post_id )
                    query_meta_names.push ( m.name )
                }
            }
            //Use below query to search for the meta ids of the "needing_ids" list
            let tbpm = `${db.name}.post_metas`
            let sql = `SELECT id, name, post_id FROM ${tbpm} WHERE ` + 
            `(name IN ${db.arr(query_meta_names)}) AND ` + 
            `(post_id IN ${db.arr(query_post_ids)})`
            
            var existing = await db.query(sql )
            var em, nm ;//em=existing meta, nm =new meta 
            //Do cross find to locate and update the id
            for(var i=0; i < needing_ids.length; i++){
                //Update references
                nm = needing_ids[i]
                em = existing.find( it => it.name == nm.name && it.post_id == nm.post_id )
                if ( ! em) continue; 
                nm.id = em.id 
            }
            //Now - update the entire mass
            ret= await db.update('post_metas', arr);  
        }
        if ( ret )  plugin.run_action('updated_meta', ret );
        
        return ret 
    }
    /**
     * Return true if the specified url, type, and id is available within the database of posts
     * @param {Object} options {id,type,url}
     * @returns {Boolean}
     */
    async is_url_available(options){
        if ( !options) return false;

        var type = options.type
        var id = options.id || null; 
        var url = options.url ;
        if ( ! url || ! type ){
            core.log("is_url_available", options, "type and url required")
            return false; 
        }
        var tb_posts = `${db.name}.posts`
        var sql = `SELECT id FROM ${tb_posts} WHERE ${db.is('type',type)} AND ${db.is('url',url)}`
        var ret = await db.query(sql);

        var output = false; 
        if ( ! id || id =='new') {//When brand new, return true if there where no url conflicts
            output = ret.length==0
        }else { 
            output = true; //assume true, but change if at least one ID in ret does not match
            for ( var i=0; i < ret.length;i++){
                if ( ret[i].id != id){
                    output = false; 
                    break;
                }
            }
        }

        return output; 
    }
    async _post_value_to_html(post){

    }
    /**
     * Given a post { type, url,full_url,query, params}, fetch the post and render its blooks. 
     * Then return entire post as an object with key "rendered".  
     * with rendered data.  Additionally, the rendered post object will have property "the_loop", if applicable,
     * for the dataset (search, tag, cateories) that is to be looped.
     * @param {Object} options {type : post type of the page, url:link without query strings,
     *      full_url: url with query strings, query : HTTP request query, params : HTTP request query, user_id: optional, 
     *      cookies : Object user cookies, headers: HTTP request headers, now : Object, HTTP H request object,
     *      post_id - optional, 
     *      child_id : optional - when present(ie forms) will include consumable_child_data and __the_child as part of the rendered post }
     * @returns {Object} The rendered output
     */
    async render_post( options ) {

        if (! options) return null; 
        if ( options.url && options.url.includes('[empty]'))return null; 
        core.log ("_   pages.render-post(", options.type, ", url:" + options.url  )
        var tb_posts        = `${db.name}.posts`
        let is_404_post     =false; 
        let is_403_post     = false; 
        
    
        /** Determines whether the user can see the edit button that allows use to edit the post being rendered */
        let show_edit_post_handle = false; 
 
        //For admin-page post types, we need to rewrite the URL such that we remove "/user/some-admin-page" to just "/some-admin-page"
        if ( options.type == 'admin-page' && options.url ){
            options.url = options.url.replace(/\/user\//gm,'/') 
        }
        
        if ( options.url == "/user") options.url = "/"
        /** A Page is about to be rendered, utilize this filter to modify the parameter of what should be rendered */
        options = await plugin.run_filter('before_render_post', options);

        //-------------------------------------------------------------------------
        // Build of query of what needs to be rendred
        //-------------------------------------------------------------------------
        let { where_exprs, sql, render_type,do_layout_retrieval_for_this_post } = await this.select_render_view(options)
        //Grab the record 
        var records = await db.query(sql);  
        await db.pagination(records,{ table : tb_posts, where: where_exprs, 
            p : options.query.p, limit : options.query.limit,  table_alias: "T"  })
        options.pagination = { p : null, limit : null, url :  options.url  }  
        if ( records.length > 0) options.pagination = records[0].pagination 
        
        

        /** This flag allows a way to divert away from always having checking if what
         * was specified in query  was found or not. */
        let follow_normative_search_branch = true; 
        var post = null, post_id = null, post_type = null;
        // For non render_type='general_post' , the records returned from db is not a post id , so retrieve it
        if ( ['tags','tag','categories','category','search','searches'].includes(render_type) ){
            var layout_type = "";
            if ( ['tags','tag'].includes( render_type ) ){
                layout_type = 'tag';
            }else if (['category','categories'].includes(render_type)){
                layout_type = 'category'
            } 
            post                            = await this.get_post_layout({ post_type : layout_type });  
            post.the_loop                   = records;    //Store the data that the page will iterated within "the loop"
            records                         = [];         //clear the records 
            follow_normative_search_branch  = false;      //no need for 404 check or get post call
        } 

        //If no results, lookup and find 404 template layout
        var template_id_404 = -1;
        if ( follow_normative_search_branch && records.length == 0 ){  //We are unable to locate the targeted resource
            is_404_post  = true;
            // 
            // Lookup the 404 template post id
            sql = `SELECT id, type FROM ${tb_posts} WHERE type LIKE "layout" AND (title LIKE "404" or title LIKE "404-%")`
            records = await db.query(sql )
            if ( records.length == 0)  records.push({ id : template_id_404 }) 
            template_id_404     = records[0].id  
            options.id          = records[0].id 
        }
        
        if ( follow_normative_search_branch ) { //default branch - normal process for 90% of renders - get the post from here
   
            //normative branch - ensures we serve a 404 page when unable to find resource
            post_id         = records[0].id; 
            post_type       = records[0].type || options.type 
            if ( post_id == template_id_404 ){
                is_404_post  = true;
                
                console.log ("--------------------------------------- Post is 404+++-4500.2", is_404_post)
                post = await this.get_404_post(options) 
            }else {  
                post = await this.get_post({ id: post_id })//the post is not 404
            }

            if ( ! is_404_post ) {//If Not 404, check if the post is visible to user 
                var subject = { post_id , user_id : options.user_id }
                var user_can_read_post = await pages.can_user_read (subject)
                if ( !user_can_read_post ){
                    post            = await this.get_template_403(options);
                    post_id         = post.id; 
                    post_type       = post.type ;
                    is_403_post  = true; 
                    //if it returned default 403, then skip grabbing a layout, since a default was already returned
                    if ( post_type == 'default-403') {
                        console.log ("------------Resource was denied - no special denial layout needed will use denial template as post and default layout")
                        do_layout_retrieval_for_this_post =false;  
                    }
                }
                if (options.is_preview) {
                    var can_user_edit_post = 
                            await pages.can_user_update(subject) && 
                            await core.can_user({ user_id : options.user_id , cap: 'manage_account'})
                     
                    if ( ! can_user_edit_post) {
                        post = await this.get_template_preview_denied()
                        post_id = null; 
                        post_type = null
                    }
                } 
            }            
        }else { 
            //special case route - tags, categories, etc; the post object was initialize above 
            post_id     = post.id ;
            post_type   = post.type 
            post.layout = null; 
            do_layout_retrieval_for_this_post = false; 
        } 
    
        
        
        /** Indicates whether or not this post being rendered has a child that <it> can consume data from in 
         * order to properly display itself - ie a form post consuming formdata in order to fill out or 
         * render a form or form content
         */
        var render_with_consumable_child = ['string','number'].includes ( options.child_id )  
        /** A Object data that can be consumed within each block.  The data itself comes from the post-meta of a child post object*/
        var consumable_child_data  = {}
        if ( render_with_consumable_child ){ 
           consumable_child_data = await this.get_consumable_child_data(options )
        }
        
 


        var blk_instance = null;
        post.rendered = "";
        //Wrap the post in some standard HTML
        post.rendered += `<main class="Post relative" outcome="${post.outcome}" post-id="${post.id}" post-type="${post.type}" status="${post.status||''}">`
        post.user_is_admin = false
        post.user_id = options.user_id || null 
        show_edit_post_handle = await  pages.can_user_update({  post_id  , user_id : options.user_id })

        //If the User is logged in include a quick way to edit the Post item directly
        if ( show_edit_post_handle) {
            post.user_is_admin = true; 
            post.rendered += `<div class="post-handle pointer-events-none absolute p-2 flex justify-center z-20" style="min-width:100%"><div>`; 
            var classes=`p-2 hover:color-white rounded ripple hover:bg-primary-500 opacity-50 hover:opacity-100 pointer-events-initial`
            var title =` title ="Post(${post.id}) - ${post.title}" `
            post.rendered += `<a class="post-edit ${classes}" href="/user/posts/edit?id=${post.id}&type=${post.type||'n/a'}" ${title}><span style="text-shadow: -1px 1px 1px var(--white);">edit</span></a>`
            post.rendered += `</div></div><!--End post handle-->`
            post.rendered += `<div class='overlay'></div>`
        } 
        //Check if the post is empty or not
        var is_empty_post = false; 
        if ( ! post.value  || (post.value && Array.isArray(post.value) && post.value.length==0) ){
            is_empty_post = true; 
            post.value = []
        }

        var ret_output, render_options = { 
            post, 
            global_css      : {}, 
            global_script   : {}, 
            block_assets    : [],
            google_fonts    : [] , 
            consumable_child_data,
            page            : options, 
            user_id         : options.user_id ,
            headers         : options.headers, 
            cookies         : options.cookies,
            now             : options.now,
            param           : options.param, 
            query           : options.query, 
            pagination      : options.pagination ,//pagination of this page's list of items to iterate through
            req             : options.req, // holds route http event
            is_404          : is_404_post,
            is_403          : is_403_post
        }

        // 
        // Check for forms - if post type "form", find all forms and instruct them to submit formdata parented to this post 
        //
        if ( post.type == 'form'){ 
            var forms = await core.get_block_instance_types({ block_type : "form", blocks : post.value });
            for ( var j=0; j < forms.length; j++){
                forms[j].data.__submit_to = post_id; //The post that houses the form
            } 
        }


        //----------------------------------------------------------------------
        // Loop the blocks of the post and render each & its' children to HTML
        //
        //----------------------------------------------------------------------
        for(var i =0; i < post.value.length; i++){
            blk_instance = post.value[i];  
            ret_output = await this.render_block( blk_instance , render_options);
            post.rendered += ret_output.html 
        }
        //If Post was empty - render comment string
        if ( is_empty_post) {
            post.rendered += `<!-- Empty Post:${post.type}(${post.id}) -->`;
        }
        post.rendered += `</main>`


        let finalize_output_post = async  (target_post)=>{
            console.log ("-====================================Render Fine", target_post.id )

            if ( ! target_post ) return target_post;

            // Post-process any PostBinding and expose variables to client side by running options_config.app_data
            target_post.binding_data = {}
            target_post.binding_blocks = []

            //An array of { id, type, children , data : { title , option_config : String } }
            var bindings = await core.get_block_instance_types({ block_type : 'postbinding', blocks: target_post.value })
            var bind = null, str_object, option_object , local_d
            for ( var i=0; i < bindings.length; i++){
                bind = bindings[i];
                target_post.binding_blocks.push(bind)
                if ( ! bind.data || (bind.data && ! bind.data.option_config)) continue 
                str_object = bind.data.option_config
                // convert the massive string "option_config" into it's JS Object
                var fn_convert_to_object = new Function("return " +  str_object )
                var option_object = fn_convert_to_object() ;
                if ( ! option_object ) continue ; //if nothing, skip
                //Here: option_object = Object { app_data : Function, methods :{}, computed : {} }
                if( typeof option_object.app_data == 'function') {
                    local_d = await option_object.app_data(core, render_options);
                    target_post.binding_data= { ... local_d , ... target_post.binding_data }
                }
                
            }
            
            target_post = await plugin.run_filter("after_render_post", target_post);

            var style = "", script ="" ; 
            var val;
           
            for (var key of Object.keys(render_options.global_css)) { 
                val = render_options.global_css[key];
                if ( val ) style += val; 
            }
            for (var key of Object.keys(render_options.global_script)) {
                val = render_options.global_script[key];
                if ( val ) script += val; 
            }
            if ( is_404_post ) target_post.__is_404 = true;
            target_post.block_assets = render_options.block_assets 
            target_post.google_fonts = render_options.google_fonts
            target_post.head_dynamic_css = style;
            target_post.inline_script = script
            target_post.rendered = target_post.rendered.replaceAll(/[\n]/gm,'')
                                    
            return target_post
        }

        //------------------------------------------------------------------------------------------------------
        //Get the layout, but if none is found, immediately exit
        var layout_id   = post.layout ;  
        var layout      =  null; 

        //Get the layout for this post we are rendering, unless this behavior is being canceled
        if ( do_layout_retrieval_for_this_post ){ 
            layout = await this.get_post_layout({ post_type , layout_id }) ; 
        }
        


                
        if ( ! layout ) {    
            return await finalize_output_post(post) 
        }else {
            layout_id = layout.id
        }
   


        //This Post does have a layout, so lets inflate the LAYOUT and update post.rendered
        var rendered_layout = `<div class="Layout Post relative ${layout.title} ${layout.id}" layout-path="${layout.outcome}">`;

        //Created Edit Handle for the layout as a whole
        var can_user_edit_layout = await pages.can_user_update({  post_id : layout_id , user_id : options.user_id   })


        
        if ( can_user_edit_layout ) {
            rendered_layout += `<div outcome="${layout.outcome}" class="post-handle pointer-events-none absolute p-2 flex justify-center z-20" style="min-width:100%"><div>`; 
            var classes = `p-2 hover:color-white rounded ripple hover:bg-primary-500 opacity-50 hover:opacity-100 pointer-events-initial`
            rendered_layout += `<a class="post-edit ${classes}" href="/user/posts/edit?id=${layout.id}&type=${post.type||'n/a'}" title="Post(${layout.id}) - ${layout.title}">`+
                        `<span style="text-shadow: -1px 1px 1px var(--white);">edit layout</span></a>`
            rendered_layout += `</div></div><!--End post handle-->`
            rendered_layout += `<div class='overlay'></div>`
        }
        post.rendering = true; 
        var lblk_instance ;
        
        //Update fields of the render_options before passing it to rendering of layout
        render_options.post = post; 
        render_options.embed_html = post.rendered;
        render_options.is_layout = true; 
        render_options.parent_block = null;  
        for(var i =0; i < layout.value.length; i++){
            lblk_instance = layout.value[i];
            ret_output = await this.render_block( lblk_instance ,  render_options);
            rendered_layout += ret_output.html 
        }
        rendered_layout += `</div><!-- End layout ${layout_id }-->`
        post.rendered = rendered_layout

        return await finalize_output_post(post)
    }


    /**
     * Render a block instance data and its' children. 
     * children are rendered first to HTML String then passed to parent block itself to have final 
     * control over placement of children.  Any Block Type that starts with Post<Name> or Site<Name>
     * will have it's instance-instance.data fused with "post" and it's inner_html automatically 
     * set to "embed_html"
     * @param {Object} block_instance data representing a block { id, type, data:{} }
     * @param {Boolean} render_option {
     *      post : the post the user is viewing of which the block is either defined within or will consume,
     *      global_css : An object with key of block type for global css,
     *      global_script : An object with key of block type for global script,
     *      embed_html : Block name starts with 'Post' or 'Site' the value is a HTML String to be used the markup within for the inner contents of a block,
     *      is_layout : Boolean set to true when a block is part of a layout post type,
     *      parent_block : reference to the block that parents block_instance
     *      self_only, 
     *      is_preview_render : Boolean indicates if we are to just render an isolated block   
     *      consumable_child_data : an Object key/value pair of meta data from a child post that can help in rendering post this block belongs to
     * }  
     * @returns {Object} { html : HTML Output }
     */
    async render_block(block_instance, render_option = {}){
        if ( block_instance.__already_rendered ) return { html : "<!-- Repeat:render-block no -->" }
        block_instance.__already_rendered = true 

        // Function Guarding
        if ( !block_instance) return { html: "<!-- Null block instance passed -->" } 
        var block_type  = block_instance.type ;
        if ( !block_type ) return { html : `<!-- Block type required for ${block_instance.id} -->`}    
        block_type = block_type.toLowerCase();
       
        
        var block = await core.get_blocks({type: block_type})//type: ie "PostTitle"
        if ( ! block ) return { html:  `<!-- MissingBlock(${block_instance.type}) => ${JSON.stringify(block_instance)} -->`}; 
    
        
        //--------------------------------------------------------------------------
        //when doing real rendering and we encounter postembed blocks directly
        //grab the block(s) that was embed and return them the generated HTML
        //--------------------------------------------------------------------------
        if ( block_type=='postembed' && !render_option.is_preview_render){ 
            // Should we ignore instruction to ONLY render the block and none of its children?
            if(render_option.self_only && block_instance.override_render_children )render_option.self_only = false; 
            

            var postemb_replacement = await this.get_embeded_blocks({ post_id :  block_instance.data.post_id });  
            
            var forms = await core.get_block_instance_types({ block_type : "form", blocks :postemb_replacement });
            for ( var j=0; j < forms.length; j++){
                if ( !forms[j].data ) forms[j].data = {}
                forms[j].data.__submit_to = block_instance.data.post_id;//post_id is typically an array within integer post id,ie [521] 
            } 

            var ret , accum ={html:''}; //return variable and accumulator
            for ( var j=0; j < postemb_replacement.length; j++){ 
                if ( !postemb_replacement[j].data ) postemb_replacement[j].data = {}
                postemb_replacement[j].data.__embed_from = block_instance.data.post_id
                 
                ret= await this.render_block(postemb_replacement[j], render_option)
                accum.html += ret.html 
            } 
            return accum ; 
        }//End of - if postembed

        
        //Store the post id and type on hand in case of errors or if we want to access within this function
        var post_id         = render_option.post?.id  || -1;
        var post_type       = render_option.post?.type  || "Untyped"
        var initial_html    = '', has_initial_html =false

        //
        // Dynamic Core Blocks:  Post|Site<Content|Title|...> 
        //  - for specialized blocks (Post...,Site...), embelish its instance data
        if ( block_type.startsWith('post') ||block_type.startsWith('site')){
            initial_html = render_option.embed_html || '' 
            if (initial_html) has_initial_html = true; 
            
            block_instance  = { 
                id : block_instance.id, type: block_type , children: block_instance.children,
                data : { ... render_option.post, ... block_instance.data },  
            } 
        }
        
        // instantiate the block editor
        block_instance = await plugin.run_filter('render_block_instantiate',block_instance)
        block = new block(  block_instance, { cp : copy_to_instance, chk : core.chk });
        
        // --------------------------------------------------------------
        // Append list of loaded assets to the front end 
        //---------------------------------------------------------------
        if ( typeof block.assets == 'function' && render_option.block_assets){
            //fn_str, tag (link,script), is_editor_only
            var arr = block.assets();
            if ( Array.isArray(arr))  {
                arr.forEach( item =>{
                    if ( ! render_option.block_assets.find((it)=> it.id == item.id )){ 
                        item.block_type = block_instance.type 
                        render_option.block_assets.push ( item   )
                    }
                })
            }
        }
        //---------------------------------------------------
        // Append block style and css
        //--------------------------------------------------- 
        this._append_block_style_class(block, block_instance, render_option)

        //Loop through this instance-blocks children and store them temporary
        var inner_html = initial_html, child_ret ={}, inner_arr=[]

        
         //should we render children
        var allow_render_children = !render_option || (render_option && !render_option.self_only );
        if ( block_instance.override_render_children ){
            allow_render_children = true; 
            render_option.self_only = false; //clear out the flag to allow recursion to also render children
        }

        var c_render_option = { //"copied" render options
            post                    : render_option.post ||null, 
            post_id                 : render_option.post?.id , 
            is_preview              : render_option.is_preview_render == true, 
            consumable_child_data   : render_option.consumable_child_data, 
            of_layout               : render_option.is_layout ?true:false  , 
            param                   : render_option.param , 
            query                   : render_option.query, 
            headers                 : render_option.headers, 
            cookies                 : render_option.cookies ,
            now                     : render_option.now ,
            pagination              : render_option.pagination, 
            req                     : render_option.req , 
            user_id                 : render_option.user_id, 
            block_id                : block_instance.id , block_type, 
            is_404                  : render_option.is_404 ,
            is_403                  : render_option.is_403 
        }
        

        //todo call block.show_children  and assign to allow_render_children 
        var include_children_blocks = true;  //is this blocks children render loop dynamic?
        if ( typeof block.show_children == 'function') {//ie Conditional.mjs
            var ret_sc = await block.show_children(core , c_render_option)
            if ( ret_sc !== undefined) include_children_blocks = ret_sc
        }
        if ( !has_initial_html && allow_render_children && Array.isArray( block_instance.children)){ 
            var child_type ;
            //store the parent that was passed when this render-block was called
            var preceeding_parent = render_option.parent_block; 
            render_option.parent_block = block_instance;
            var child_it = null; 
            var pass_props = null; 
            if (typeof block.pass_props == 'function') pass_props = block.pass_props()

            //If necessary, sort the children 
            if ( typeof block.get_sort_fn == 'function'){
                var sort_by = block_instance.data.sort_by
                var sort_fn = block.get_sort_fn( sort_by ) //default is "none"
                if ( sort_fn ) {  
                    block_instance.children.sort( sort_fn  )
                }
            }
            
            
            //-------------------------------------------------------
            // Render the children
            //-------------------------------------------------------
            let ref_to_render_children = null;

            let render_children_normally = async ()=>{  

                inner_html += `<!-- ${block_type }:${block_instance.id } render children normally -->`

                for(var i=0; i < block_instance.children.length; i++){
                    child_it = block_instance.children[i]
                    if ( ! child_it ) continue; 
                    if ( ! child_it.type) continue; 
                    child_it.props = pass_props ;   //M3030 Send passed in props

                    child_type = child_it.type.toLowerCase()
                    child_ret  = await this.render_block (child_it, render_option)
                    
                    inner_arr.push ( child_it )
                    inner_html += child_ret.html 
                }
            }
            let render_children_via_data = async ()=>{
                // when doing preview - do not render actual data
                if ( render_option.is_preview_render || render_option.is_preview){
                    render_children_normally(); return; 
                }
                //post object, which holds 'the_loop'
                var xpost = render_option.post; 
                if ( ! xpost ) {
                    render_children_normally(); return; 
                }
                
                var the_loop    = xpost.the_loop || [];
                if ( ! Array.isArray(the_loop )) the_loop =  []
                var the_data = null; 

                inner_html += `<!-- ${block_type }:${block_instance.id } render children with data-loop -->`
                
                //Initialize the child template used to render each data
                var temporary_templates = block_instance.children;  
                if ( temporary_templates.length == 0 ) {   
                    temporary_templates = [{
                        type : "media", id: "autogen_template",
                        data : {
                            title : "@post.title;",
                            description : "@post.description; ",
                            image : [" @post.feature_image;" ],
                            svg : null,
                            url : "@post.url"
                        }
                    },
                    
                    ]
                }
                //Holds all the templates found within 'PostLoop'
                var arr_templates = [];
                var arr_temp_id_used = null; 
                for(var j=0; j < temporary_templates.length;j++){ 
                    if ( temporary_templates[j].type =='postembed'){
                        arr_temp_id_used = temporary_templates[j].data.post_id 
                        //Resolve postembed
                        arr_templates.push( 
                            ... await this.get_embeded_blocks({ 
                                post_id : arr_temp_id_used
                            })    
                        )
                    }else {
                        arr_templates.push( temporary_templates[j ] )
                    }
                } 
                inner_arr.push ( ... arr_templates )
                
                //temporary store the original post data
                var xprev_post = render_option.post;
                render_option.post = the_data;
                
                inner_html += `<!-- the_loop_begin within ${block_type}:${block_instance.id}-->`
                //Loop the content data 
                for ( var i=0; i < the_loop.length; i++){
                    the_data = the_loop [i];// ie - { id, title, description, url,value...}
                    
                    render_option.post = the_data 
                    for ( var j=0; j< arr_templates.length; j++){  
                        arr_templates[j].props = pass_props
                        
                        child_ret = await this.render_block (arr_templates[j], render_option)
                        if (! render_option.is_preview_render ) {  
                            child_ret.html = await this.resolve(child_ret.html, { post : the_data,  page : render_option.page });
                        }
                        inner_html += 
                        `<!-- loop_iter(${i}):template[${j}] #child.${arr_templates[j].type}(${arr_templates[j].children?.length}) :item.id(${ the_data.id }) --> ` + 
                        ` ${child_ret.html }`
                                         
                    }
                } 
                inner_html += `<!-- the_loop_end -->`
                //restore the original post object
                render_option.post = xprev_post;
            }//end of fx render children with data 

            ref_to_render_children = render_children_normally;

            //temporary store the loop that was originally passed in - to prevent it from being overriden
            var tmp_holder_current__the_loop =render_option.post.the_loop
            if ( block_type == 'postloop') { 
                var loop_type = block_instance.data.loop_type;
                var e_url = block_instance.data.endpoint_url; 
                var e_conf= block_instance.data.endpoint_config;
                var e_method =block_instance.data.endpoint_method
                
                if ( loop_type=='api' && e_url && render_option.post){ 
                    //Search the specified API in order to retrieve the data
                    try { e_conf = JSON.parse(e_conf)}catch(xe){e_conf={}}
                    var fetch_option = {
                        ... e_conf,
                        url : e_url,
                        method : e_method,
                    }
                    var f_res = await core.fetch(fetch_option)
                    render_option.post.the_loop = f_res.d   
                }else if (loop_type == 'plugin_method'){ 
                    //Execute a plugin function a return its data
                    var plug_res =  [] , fn_name = block_instance.data.data_source ;
                    if (fn_name  ) {//format=<name_of_plugin>.<name_of_function_in_plugin> 
                        /** {plugin Run an exported function from.  Format needs to be 'plugin_name.exported_function_name' } */
                        plug_res = (await plugin.run_filter(fn_name,  {  }, render_option));
                        render_option.post.the_loop = plug_res || []
                    }
                }
                ref_to_render_children = render_children_via_data 
            }
            if ( include_children_blocks ) { 
                await ref_to_render_children();
            }else {
                inner_arr = []
                inner_html = '<!-- do not include children blocks -->'
            }
            //  if postloop, retore the original "the loop" variable -  in cases where it was overriden
            if ( block_type == 'postloop') {
                var loop_type = block_instance.data.loop_type;
                if ( ['plugin_method', 'api'] )  render_option.post.the_loop = tmp_holder_current__the_loop
            }
            //now restore the parent block that was originally supplied
            render_option.parent_block = preceeding_parent 
        }

        //--------------------------------------------------------------------------
        // Create some utility functions to be used in block.render
        //--------------------------------------------------------------------------
        let esc =(str)=>{
            if ( ! str) return '';
            var type = typeof str ;
            if ( ['null','undefined','object'].includes(type)) return '';
            if ( type == 'string' && str.endsWith('--'))str='';
            return str ; 
        }
        let id = (str="")=>{
            if ( ! block_instance.data) return ""
            var val = block_instance.data.element_id || str ;
            if ( ! val ) return ''
            return val ? `id="${val}"` : ``
        }
        let attr = (name="", val="")=>{
            if ( ! name ) return ''
            if ((val==null ||val=='') &&  ! ['checked'].includes(name)) return '';
            return ` ${name}="${val}" `
        } 
        /** Not encouraged - use css method */
        let sty = (name="", val="")=>{
            if ( ! name ) return ''
            if ((val==null ||val=='') )return ''
            val = esc(val);
            if ( ! val) return '';
            return ` ${name}:${val}; `
        }
        let classes =(str='')=>{
            if ( ! block_instance.data ) return ""
            var cls = esc(block_instance.data.classes)
            var id = block_instance.id || ""
            return `class="${id} ${cls} ${str} ${block_instance.type}" block-type="${block_instance.type}" `
        }
        /// Compile time css is any css that selects any element within the block css and is generated within block.render
        var css_accumulator = "";
        let css = (text_css) => {
            if ( ! text_css )return; 
            css_accumulator += text_css;
        }

        var __did_css=false; 
        let finalize_css = ()=>{ 
            if (!block_instance.data) return `<!-- nothing for ${block_instance.id} -->`;
            if ( __did_css)  return `<!-- ${block_instance.id} CSS already printed -->`;
            
            var val         = block_instance.data.css ||""
            //"extra_css" will use the block id as the selector and apply the style immediately to the root element
            var extra_css    = "";  
            //Add in extra CSS
            if ( block_instance.data.font_family){
                var font_name = block_instance.data.font_family||"";
                if ( font_name == 'google') { 
                    font_name = block_instance.data.font_google
                    //Add it to font names list
                    var e_font_name = font_name.replace(/\s/gm,'+');
                    var index = render_option.google_fonts.indexOf(e_font_name)
                    if ( index==-1)render_option.google_fonts.push(e_font_name);
                }
                
                extra_css += `font-family: ${font_name};\n`
            } 
            if ( block_instance.data.font_size && block_instance.data.font_size != '100%'){
                var font_size = block_instance.data.font_size||"";
                extra_css += `font-size: ${font_size};\n`
            }
            if ( extra_css ) {
                extra_css = `.${block_instance.id}{${extra_css}}\n`
            }

            val +=  extra_css;
            val += css_accumulator
            if ( ! val ) return `<!-- nothing for ${block_instance.id} as val is null/empty -->`;

            __did_css = true; 
            var keyname = "CSS-"+block_instance.id;
            var x= `/** Custom CSS-${block_instance.id} ${block_type} Block*/\n${val}\n`
            if ( ! render_option.global_css ) render_option.global_css = {}
            render_option.global_css[keyname] = x
            
            return "" //return nothing because we the css is added above to global_css
        }
        let iattrs = ()=>{ // { } :attrs:
             
            var arr = block_instance.data.attrs
            if ( ! arr || ! Array.isArray(arr)) return " "
            if ( arr.length == 0 ) return " "
            var out = "";
            for(var i=0; i < arr.length; i++){
                if ( ! arr[i].name) continue; 
                out += ` ${arr[i].name}="${arr[i].value}"`
            }
             
            return out 
        }
        

        let blk_option = { ... c_render_option, css, esc, classes,id, attr,sty, s : sty, style : sty ,iattrs,  
            props : block_instance.props || null,  //#see M3030
            children : block_instance.children || [], 
            inner_html, inner_arr , 

            is_404                  : render_option.is_404 ,
            is_403                  : render_option.is_403 
        }
        

        //Check if a plugin has an alternative render function
        let alternate_render_fn = await plugin.run_filter("render_block_renderer", (block_instance));
        try { 
            var blk_output = null, block_type = block_instance.type.toLowerCase()
            //Now Call the block-classes "render" function
            if ( typeof alternate_render_fn == 'function') {
                blk_output = await alternate_render_fn.call(block_instance, blk_option)
            }else {//Otherwise just the block in accordance with the block's default render function
                try {  
                    blk_output =await block.render (core, blk_option )
                }catch(xrfn){
                    core.throw(`Within block<${block_type}>.render -  ${xrfn.message}`)
                }
            }

            var text_resolved= blk_output.html;
            //when doing real render, then resolve the any built in expressions
            if (! render_option.is_preview_render ){  
                text_resolved = await this.resolve(text_resolved, { post : render_option.post, 
                    page : render_option.page 
                });
            }

            blk_output.html = ` ${finalize_css()}   ${text_resolved}  `

            return blk_output; 
        }catch(e){
            var otag = "<span>", etag= "</span>"
            var extra_message = "";
            if ( /*render_option.post?.user_is_admin || render_option.user_is_admin*/ true ){
                otag = `<a href="/user/posts/edit?id=${post_id}">`
                etag = `</a>`
                extra_message = `<ul class="pl-8 color-gray-700"><li>${block_instance.type}.render(): ${e.message}</li></ul>`
            }
            var html =  `<!-- block.render ${e.message} --><div class="RenderError p-5 color-red-600">` + 
            `Error while rendering ${block_instance.type}.${block_instance.id} of Post:${otag}${post_type}(${post_id})${etag}` +
            `${extra_message}`+ 
            `</div>`

            return { html } 
        }
      }//End of render block

    /**
     * Append all global Styles and Script that were defined in the block-class into a temporary storage
     * within render-options
     * @param {Class} block_class instantiated Block Class definition 
     * @param {Object} block_instance block class object representation { id, type, children, data }
     * @param {Object} render_option Object that was originally passed to render-block function
     */
    _append_block_style_class(block_class, block_instance, render_option){
        if ( ! block_class || ! block_instance || ! render_option) return; 
        var block_type = block_instance.type.toLowerCase()
        var val = null; 
        if ( typeof block_class.style == 'function' &&  
             render_option.global_css && 
            !render_option.global_css[block_type] ) {

            try { 
                val = block_class.style(render_option)
                if ( val ) { 
                    render_option.global_css[block_type] = `/** ${block_type} */\n${val}\n\n`
                }
            }catch(e){ }
        }

        if ( !render_option.global_script ) render_option.global_script = {}
        if ( typeof block_class.script == 'function' && 
            render_option.global_script  ) {
            try { 
                val = block_class.script(render_option)
                if ( val ){ 
                    
                    render_option.global_script[block_id] = `<script t="${block_type}">${val }</script>`
                
                }
            }catch(e){
                render_option.global_script[block_type] = `<div class="text-red-500">Append Script:${block_type} ${e.message}</div>`
            }
        }
    }
    /**
     * Return an array of posts that match a given set of criteria and the post type is layout
     * @param {Object} options { optional:[account_id, group_id, created_by, status,linked_to ,limit, p]}
     * @returns {Array}
     */
    async get_layouts ( options ) {
        if ( ! options ) return [];  
        let tb_post         = `${db.name}.posts`
        let tb_post_tags    = `${db.name}.post_tags`
        let tb_tags         = `${db.name}.tags`
        let tb_meta         = `${db.name}.post_metas`
        var columns         = "*"
   
        
        if ( options.short != undefined) columns = "id, title"
        //Where expressions 
        var where = [];
        where.push(db.like('type', 'layout' )) 
        if ( options.account_id)where.push(db.is('account_id' , options.account_id))
        if ( options.group_id)  where.push(db.is('group_id'   , options.group_id))
        if ( options.created_by)where.push(db.is('created_by' , options.created_by))
        if ( options.status)    where.push(db.is('status'    , options.status))
        if ( options.linked_to) where.push(db.is('linked_to', options.linked_to))
        if (where.length==0)return [];

        //Get the posts
        var where_expr = where.join(' AND ');
        var sql = `SELECT ${columns} FROM ${tb_post} T WHERE ${where_expr} ${await db.page_limit(options)}`
 
        var posts = await db.query(sql)
        await db.pagination(posts,{ table : tb_post, where: where_expr, p : options.p, limit : options.limit, table_alias: "T"  })
        
        return posts; 
    }

    /**
     * Given a set of parameters, return all medias 
     * @param {Object} options { public: Boolean - default true, folder: relative to server root, is_initial : For very first call upon server start up so that a recursive call can be then made}
     * @returns {Array}
     */
    async get_media (options ){
        if ( ! options) return null; 
        var root = core.get_server_root()

        var folder = options.folder || "/";//relative for server root
        if (! folder.endsWith("/")) folder = folder + "/"
        var is_public = options.public!= undefined ? options.public : true
        if( options.user_id ) {
            var the_user = await users.get_user({ user_id : options.user_id , cols : ['name']})
            if (the_user ){
                var user_folder = `${root}/public/uploads/${the_user.name}`
                var res = await core.create_directory ( user_folder)
                console.log ("Created the user ",res, user_folder)
            } else {
                console.log("????x")
            }
        }
        let T = (n,str)=>{
            var base = "---";
            var tabs = "";
            for ( var i =0; i < n ; i++) tabs +=base 
            console.log (tabs+str)
        }
        var source_folder = is_public ? "public" : "private"
        var path = `${root}/${source_folder}${folder}`
        T(0,"Get_Media ::"+path )

        var dir_path =`${source_folder}${folder}`
        //<*> Get Array of {path(hard drive),is_file,is_directory,is_socket,inode,ext,name(full)}
        var dir_records = await core.get_dir_files(dir_path)
        if ( ! dir_records) throw new Error(dir_path + " does not exist or is throwing errors")
        var arr_inodes = []
        dir_records.forEach(it => arr_inodes.push(it.inode ))
        if ( dir_records ) {
            T(1, "directory records length="+dir_records.length )
            var subfolders = dir_records.filter(file => file.is_directory)
            if ( options.is_initial) { 
                for( var i=0; i < subfolders.length;i++){

                    var copy_options = JSON.parse( JSON.stringify(options) ); 
                    copy_options.folder = subfolders[i].url 
                    await this.get_media( copy_options )
                    
                }
            } 
        } 
        if (arr_inodes.length == 0) arr_inodes.push("NULL")
        //<*> Get all existing Records and see if they exist within what is actually on hard drive
        var tb_posts= `${db.name}.posts` 
    
        //Select All media that are in the database and match the specific folder being queried
        var sql =`SELECT * FROM ${tb_posts} WHERE type="media" AND value IN ${db.arr(arr_inodes)} ` 
        var DB_records=await db.query(sql); 
        

        //<*> Cross check existing with harddrive, ensure alignment: delete whatever no longer exist, and update/rename things that still exist
        var db_rec, f_rec;
        var promise_waiting = []
        
        var i=0;
        
        // This regex will be used to validate that a post record that is about to be deleted
        // is truely part of the options.folder we are searching within

        var re_path_starts = new RegExp("^"+options.folder) 
        // Loop what we know is in the database
        for(var i=0;  i <DB_records.length; i++){
    
            db_rec = DB_records  [i];  // { id, title, url, amount, value : holds inode }
            try {  db_rec.value = JSON.parse(db_rec.value )  }catch(xwo){   }


            f_rec = dir_records.find (it => { 
                if ( it.__do_skip == true ) return false; 
                var result = it.inode == db_rec.value || it.url == db_rec.url 
                if ( result ) it.__do_skip= true; 
                return result
            });
            if ( ! f_rec ) {//when the record is not found, delete it database record  
                var name_only = db_rec.url.replace(re_path_starts, "");
                if ( options.folder == "/" && name_only.charAt(0)=="/") name_only=name_only.substring(1)
                var is_db_rec_in_folder = name_only == db_rec.title
                if ( is_db_rec_in_folder ){ 
                    console.log ("OH--- I am being told to delete", db_rec,options) 
                    promise_waiting.push( db.query(`DELETE FROM ${tb_posts} WHERE id LIKE ${db_rec.id}`) )
                }
            }else { 
                f_rec.already_processed = true;
                //if the record is found, then we want to make sure that the name and url of the file matches the latest and greatest of what is on the hard drive
                promise_waiting.push( db.update('posts', { id : db_rec.id, url : f_rec.url, title : f_rec.name}) )
            }
        }

        //<*> Process what is on harddrive
        var output = [];
        for (  i=0; dir_records&&  i < dir_records.length; i++){
            f_rec =  dir_records[i];
            if ( f_rec.already_processed) continue; //skip if already processed;
            if ( f_rec.is_directory){ 
                output.push({ title : f_rec.name, url : f_rec.url , id : null, value : f_rec.inode , 
                    is_directory : true, status: "published" })
                continue; 
            }

            //At this point, we need to create records of newly found file media
            promise_waiting.push( 
                db.update('posts', {
                    title : f_rec.name, url : f_rec.url, value : f_rec.inode , status : "published", amount : f_rec.size,
                    type : "media"
                })
            )
        }
        //Finalize all promises
        await Promise.all( promise_waiting )
        
        //Get all matching records using the query we constructed earlier
        var records =[ ... output, ... await db.query(sql) ]; 

        return records
    }
    /**
     * Given a post type name, return its registered layout, if any.  Additionally is options.layout_id exists, then
     * that value is used instead of the registered layout id.  If the post type does not have an associated layout and layout_id
     * was not specified or is null.  One of post_type or layout_id is required or null will be returned immediately.
     * 
     * @param { Object } options { post_type: optinal, layout_id : optional id of a layout to override any post_type found }
     * @return { Object |Null } Return the post object or null if the post goes not have a layout and a default layout does not exist
     */
    async get_post_layout(options){
        var { layout_id , post_type } = options;
        if ( ! layout_id && ! post_type ) { 
            return null; 
        }

        var id = null, ret = null; 
        var tbposts = `${db.name}.posts`, opt = null; 
        var outcome="layout-outcome-unknown"
         
        //Check if page as aspecific layout to use for this post, and see if that layout actually exist
        if ( layout_id ){
            ret = await db.query(`SELECT id FROM ${tbposts} WHERE ${db.is('id', layout_id)}`)
            if ( ret.length > 0) { 
                id = ret[0].id ;   //`Used layout_id branch;`
                outcome = "layout-specific"
            }

        }
        //if a specific layout did not exist, check to see if the post-type has a default layout for it
        if ( ! id ) { 
            opt = await core.get_option({ name : `layout_for_${db.esc(post_type,true)}`}) 
            if ( opt ) {
                ret = await db.query(`SELECT id FROM ${tbposts} WHERE ${db.is('id',opt.value)}`)
                if ( ret.length > 0) { 
                    id = ret[0].id;
                    outcome="layout-general-frontend"
                }
            }//`Used else branch;`
        }

        var post = null; 
        //<check-auto-layout >
        // if layout is still not found (even for layout_for_xxx), but the post type is for one of below then create auto generated layout
        if ( ! id && ['tag','category'].includes(post_type) ){
            outcome = `autogen-${post_type}`
            post = await this.get_autogen_layout({ post_type })
            post.outcome = outcome 
            return post
        }
        //<end-of-auto-layout > 


        //if prior attempts for layout where not success, see if there is a global generic layout
        if ( ! id ) { 
            var option_name = post_type == 'admin-page' ?  `layout_for_default_admin` : `layout_for_default`
            opt = await core.get_option({ name : option_name })
            if ( opt ) {
                ret = await db.query(`SELECT id FROM ${tbposts} WHERE ${db.is('id',opt.value)}`)
                if ( ret.length > 0) { 
                    id = ret[0].id; 
                    outcome=`layout-default-${post_type == 'admin-page' ? 'backend':'frontend'}`
                }
            } //`Using global default branch;`
        }

        /**
         * Return a custom layout from a plugin that can be used to render a post.  options passed in is { post_type, layout_id }.
         * If return value is null or does not contain keys { id, value, type} then return value will be ignored in lieu of
         * post object returned by library function instead of the filtered result. 
         */
        var plugin_layout = await plugin.run_filter('get_post_layout', options );
        if ( plugin_layout && plugin_layout.id && plugin_layout.value&& plugin_layout.type  ) {
            if ( plugin_layout ) {
                plugin_layout.outcome = outcome
            }
            return plugin_layout
        }
        post = await this.get_post({ id });
 
        if ( post )    post.outcome = outcome
        
        return post 
    }
    /**
     * Repeatedly searches the text to locate all items that match the regex
     * @param {RegExp} regex Regular expression object
     * @param {String} text The string to be searched
     * @returns {Array} Array of { match: the string that matched the regex exactly, items: captured items }.Empty array when no matches found.
     */
    get_all_matches( regex , text ) { 
        var matches =  [], m;
        var group = null; 
        while ((m = regex.exec(text)) !== null) {
      
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => { 
                if ( groupIndex == 0 ) {
                    group = { match , items : [] }
                    matches.push(group )
                }else {
                    group.items.push(match )
                } 
            });
        }

        return matches
    } 
    /**
     * 
     * @param {String} text Text string
     * @param {Object} obj Object that to use in resolving text.  Any key you want to reference within obj must exist. So if you want to access "post", make sure to pass in { post : ... }
     * @returns {String} The clean up string 
     */
    async resolve(text, obj = {}){
      //  return text 
        if  (!text) return text ; 
        
        var match , term , i
        
        //Get all expressions housed within:    {  <post|site>.key_name} or  { fun_name ( post.some.thing ) }
        /*let re =   /\{\s*([\w.$;&\(\),]+)\s*\}/gm  
        let matches = this.get_all_matches(re, text);
        if (matches.length > 0 ) {
                
            for( i=0; i < matches.length; i++){
                match = matches [i];
                if ( match.items.length == 0 ) continue;
                term = match.items[0]
                var value = await  core.get_resolve(term , obj, {})// ie: post.title, post.id, site.title, . . .
                
                
                text = text.replaceAll(match.match , `<span class="term" x="${term}">${value}</span>`)
            }  
        } */

        //Get all expressionions housed within: [post.key]
        let re =   /\@\s*([\w.$;&\(\),]+)\s*\;/gm  
        let matches = this.get_all_matches(re, text ) 
        if ( matches.length > 0 && matches[1] != 'media'){ 
            for( i=0; i < matches.length; i++){
                match = matches [i];
                if ( match.items.length == 0 ) continue;
                term = match.items[0]
                
                var value = await core.get_resolve(term , obj, { tagless : true} )// ie: post.title, post.id, site.title, . . .
                if ( value && typeof value.trime == 'function' ) value = value.trim()

                text = text.replaceAll(match.match , `${value}`)
            }  
        }
         
        return text 
    }
    /**
     * For any given post-id, return all access (Permission) records matching the post id.  Function returns null on error or an 
     * Array of matches found
     * @param {Object} options {post_id}
     * @returns {Array }
     */
    async get_access_for(options){
        if ( ! options) return null; 
        var { post_id } = options;
        if ( ! post_id ) return null; 

        var tb_post = `${db.name}.posts`
        var tb_groups = `${db.name}.groups`
        var tb_access = `${db.name}.post_access`
        var cols =
            `*, (SELECT title FROM ${tb_post} WHERE id=A.post_id) as title,\n` +
            `(SELECT title FROM ${tb_groups} WHERE id=A.read_group) read_group_title,\n`+
            `(SELECT title FROM ${tb_groups} WHERE id=A.update_group) update_group_title,\n`+
            `(SELECT title FROM ${tb_groups} WHERE id=A.delete_group) delete_group_title\n`
        var sql_select = `SELECT ${cols} FROM ${tb_access} A where \n\t${db.is('post_id',post_id)}`
        var ret = await db.query(sql_select)

        return ret; 
    }
    /**
     * Check whether a user can can the post permission to either read, update, or delete a post specified.
     * Function check
     * @param {Object} options { user_id , post_id, action : "read|update|delete" }
     */
    async can_user_perform(options){
        if ( ! options ) return false; 
        
        if (   !options.post_id || !options.action ) return false; 
        var { user_id , post_id , action } = options

        if ( ! ['read','delete','update'].includes( action )) return false; 
        var where_col = `${action}_group`

        var tposts=`${db.name}.posts`
        var tgrp_mbr=`${db.name}.group_members`
        var taccess=`${db.name}.post_access`

        var sql_user_grp_id =`SELECT group_id FROM ${tgrp_mbr} WHERE ${db.is('user_id',user_id)} AND status='approved'` 
        var sql_user_approved = `SELECT id FROM ${taccess} WHERE ${where_col} IN (${sql_user_grp_id}) AND ${db.is('post_id',post_id)}`;

        //This must be be exactly zero to Mean that there is NOT an entry within post_access table 
        // where <action>_group is set to null.  In this scenarios, it means the user or group of users
        // have not taken care to setup a specific access limitation for the named (post_id) resource
        // (SELECT NOT EXISTS (SELECT id FROM jxt_dev.post_access WHERE post_id = 543 and update_group is NULL) as T2);
        var sql_public0 =`SELECT id FROM ${taccess} WHERE ${db.is('post_id', post_id)}` 
        var sql_public =`SELECT id FROM ${taccess} WHERE ${db.is('post_id', post_id)} AND ${where_col} IS NULL` 

        var sql = `SELECT id FROM ${tposts} WHERE ${db.is('id',post_id)} AND  \n` +
                `((` +
                `(SELECT COUNT(*) FROM (${sql_user_approved}) as T0) >= 1 OR ` +
                `( (SELECT COUNT(*) FROM (${sql_public0}) as T1 ) = 0 OR (SELECT COUNT(*) FROM (${sql_public}) as T2) >= 1 )\n` +
                `))`
        
                
        var rows = await db.query( sql )
        return rows.length > 0
    }
    /**
     * For the given post-id, determine wether user can or cannot read the post.  Internally, this
     * function utilizes {Pages.can_user_perform}
     * @param {Object} options { post_id , user_id }
     * @returns 
     */
    async can_user_read(options){
        return await this.can_user_perform({
            action : "read",
            user_id : options.user_id , 
            post_id : options.post_id ,
            sql : options.sql,
        })
    }
    /**
     * For the given post-id, determine wether user can or cannot update the post,  Internally, this
     * function utilizes {Pages.can_user_perform}
     * @param {Object} options { post_id , user_id }
     * @returns 
     */
    async can_user_update(options){
        return await this.can_user_perform({
            action : "update",
            user_id : options.user_id , 
            post_id : options.post_id ,
            sql : options.sql,
        })
    }
    /**
     * For the given post-id, determine wether user can or cannot delete the post.  Internally, this
     * function utilizes {Pages.can_user_perform}
     * @param {Object} options { post_id , user_id }
     * @returns 
     */
    async can_user_delete(options){
        return await this.can_user_perform({
            action : "delete",
            user_id : options.user_id , 
            post_id : options.post_id ,
            sql : options.sql,
        })
    }
    /**
     * Update the post permission level for a specific post.  It can be useful to first call {Pages.can_user_update} prior to
     * invoking this method. 
     * @param {Array|Object} data  Array: {post_id, read|update|delete_group } to database relating to the access(permission) for a given post 
     */
    async modify_access ( data ) {
        if ( ! data ) return null; 
        if (!Array.isArray(data)) data = [data ]

        return await db.update('post_access', data )

    }
    /**
     * Remove a specific permission/access that belongs to a post
     * @param {Object} data { id : permission/access id to remove from a post }
     */
    async remove_access( data) {
        if ( ! data ) return false;
        var { id } = data;
        if ( ! id ) return false; 
        var tb = `${db.name}.post_access`
        var sql = `DELETE FROM ${tb} WHERE ${db.is('id',id )}`
         await db.query(sql);
        return true 
    }

    /**
     * Get all meta properties that exist for a given post 
     * @param {Object} options { post_id , like : optional}
     */
    async get_metas(options){
        if ( ! options) return [];
        if ( ! options.post_id ) return []; 
        var tbmeta = `${db.name}.post_metas`
        let { post_id} = options
        let where = [ db.is('post_id', post_id ) ];
        if ( options.like ) {
            where.push(` name LIKE ${db.esc(options.like )}`)
        }
        var sql = `SELECT * FROM ${tbmeta} WHERE ${ where.join(' AND ')}` 
        var ret = await db.query(sql )
        var m ;
        //Inflate the value
        for(var i=0; i<ret.length;i++){
            m = ret[i];
            if ( m.value == null ) continue 
            m.value = await core.type_cast( m.value, m.name && m.name.endsWith("_secret") )  
        }
        /**
         * Filter the metas we are about to return 
         */
        var metas = await plugin.run_filter ("get_metas", ret, options )
        return metas;
    }
    /**
     * Return all variation data associated with the specified post id.  Prior to returning,
     * additional transformation is ran on each variation to make it ready for presentation.  It is
     * not advised to use the return value of this function to modify aspects of the original post.
     * @param {Object} options { post_id : the post whose "variations_" meta data is requested }
     * @returns {Array} Array of { id : meta id, name, value, title : pretty verison of name field }
     */
    async get_variations (options ) {
        var metas = await this.get_metas({ ... options , like : "variations_%"})
        if ( ! metas ) return []; 

        var m; 
        var real_name; 
        for( var i =0; i < metas.length; i++){
            m = metas[i];
            real_name = core.get_name_only(m.name,'variations_')
            m.name  = real_name
            m.title = core.capitalize (real_name)
            delete m.created;
            delete m.modified 
            delete m.post_id 
        } 
        return metas    
    }
    /**
     * Get a meta property for a post
     * @param {Object} options { post_id, name , flat }
     */
    async get_meta(options){
        if ( ! options) return null;
        if ( ! options.post_id ) return null; 
        if ( ! options.name ) return null 
        var tbmeta = `${db.name}.post_metas`
        let { post_id, name } = options
        var ret = await db.query(`SELECT * FROM ${tbmeta} WHERE ${db.is('post_id', post_id )} AND ${db.like('name',name )}`)
        var m = ret[0]
        if ( ! m ) return null; 

        m.value = await core.type_cast( m.value, m.name && m.name.endsWith("_secret") ) 
        if ( options.flat ) return m.value 
        return m;
    }
    /**
     * See if the named property is within post.metas and if not search the database and return the flat value 
     * @param {Object} options { post : Post we want to search within for the meta property, name: meta property  }
     * @returns {mixed}
     */
    get_meta_or_query = async ( options )=>{
        let post_obj        = options.post  
        let meta_name        = options.name 
        if ( ! post_obj ) return null; 
        if ( ! meta_name) return null; 
        if ( ! post_obj.id) return null; 
        let do_query = false,value 
        if ( ! post_obj.metas) {
            do_query = true; 
        }else {
            var meta = post_obj.metas.find(it => it.name == meta_name );
            if ( ! meta ) { 
                do_query = true;
            }else {
                value = meta.value 
            }
        }
        if ( do_query ) {
            value = await pages.get_meta({ post_id : post_obj.id , name : meta_name , flat : true })
        }
        return value 
    }
    /**
     * Get series of tags and counts of associated posts
     * @param {Object} options { user_id, <tags> :array of ids or tag titles, <post_type>: Tags associated with a specific post type }
     * @returns {Array} Returns an array of { id, title, description, count }
     */
    async get_tags ( options ){
        var tbtag = `${db.name}.tags`
        var tb_posttag =`${db.name}.post_tags`
        var tb_posts =`${db.name}.posts`
        var where = [];

        var tags = options.tags || options.tag
        if ( tags ){
            if ( ! Array.isArray( tags)){
                 tags = [ tags]
            }
            var a = db.is('id',  tags)
            var b = db.like('title', tags )
            where.push(`(  (${a}) OR  (${b}) )`)
        }

        var post_type = options.post_type ;
        //Get all tags that are associated with a specific post typee
        if ( post_type ) {
            var sel_post_ids =`SELECT id FROM ${tb_posts} WHERE ${db.is('type',post_type)}`
            var slqtype =`SELECT id FROM ${tb_posttag} WHERE post_id IN (${sel_post_ids})`

            where.push(`(SELECT COUNT(*) FROM (${slqtype}) T001 ) > 0`)
        }

        //Combine Results and output to SQL where expression
        if ( where.length ==0) where.push(1);
        var where_exprs = where.join(" AND ")
        
        var sel_count=`SELECT COUNT(id) FROM ${tb_posttag} WHERE tag_id=Tag.id`
        var final_sql = `SELECT *, (${sel_count}) as count FROM ${tbtag} Tag WHERE ${where_exprs}`
        var tags =await db.query(final_sql)
 
        return tags 
    }
    /**
     * Given a post ID, return the block instance that are part of the post identifier
     * @param {Object} options { post_id : Array of ids  that needs to be looked up and the block instances returned
     * @returns { Object } Block instance that was iembeded
     */
    async get_embeded_blocks(options ){
        var arr = options.post_id
        var def = [{
            type : "paragraph", data : {
                text : "This was returned from get_embeded_block",
                title : "Ok"
            },  children : []   }]
        var out = def; 
        if ( ! arr ) {
            out[0].data.text = `get_embeded_block: no post ids supplied`
            return out; 
        }
        var post_id = arr[0] || null ;
        if ( ! post_id ) {
            out[0].data.text = `get_embeded_block: ${post_id} is invalid or null`
            return out; 
        }
        var tbpost = `${db.name}.posts`
        var sql_sel_val = `SELECT value FROM ${tbpost} WHERE ${db.is('id',post_id)} ` +
                    `#Other expression/conditions`
        
                    
        var rows = await db.query(sql_sel_val );
        if ( rows.length == 0 ) {
            out[0].data.text = `get_embeded_block: id(${post_id}) was not found`
            return out; 
        }

        var value_blks = null;
        try { value_blks = JSON.parse ( rows[0].value ); }catch(e){}

        
        if ( value_blks == null ) {
            out[0].data.text = `get_embeded_block: id(${post_id}) value is empty`
            return out; 
        }

        
        if ( !Array.isArray(value_blks) ) {
             value_blks = [value_blks ]
        }

        let force_id = (o)=>{
            if ( ! o ) return ; 
            if ( ! o.id ) {
                var now = Date.now().toString().substring(8)
                o.id = "TID-"+core.random_str(5)+'-'+now 
            }
            if (Array.isArray(o.children)){
                for(var j=0; j< o.children.length; j++) force_id( o.children[j] )

            }
        }
        out = value_blks;
        for ( var i=0; i < out.length; i++) force_id(out[i]);

        return out 
    }
    async page_init(options){
        var opt = await core.get_options({ like : ['site_fonts_arritem' ]})
        console.log ("pages.page_init  job ", opt )
    }


    /**
     * Get an SQL where expression that can be used in combination with the user id to ensure that a given user has
     * permission to read(view) 
     * @param {Interger} user_id User ID or null
     * @param {String } T String symbol representing the token name for post table
     * @returns 
     */
    get_post_sql_access_rights (user_id=null, T="Posts"){

        const tb_access         = `${db.name}.post_access` 
        const tb_group_members  = `${db.name}.group_members`

        var select_approved_groups = `\n\t\t\tSELECT group_id FROM ${tb_group_members} WHERE \n\t\t\tuser_id=${user_id} AND status LIKE 'approved' AND ${user_id}<>-1 #Get user's approved groups\n`
        var sql_approved = `SELECT read_group FROM ${tb_access} WHERE #For this post, does user have approved group\n`+
                                `post_id=${T}.id AND read_group IN (\n${select_approved_groups}\n\t\t)`
        var sql_public = `SELECT read_group FROM ${tb_access} WHERE \n\t\t\tpost_id=${T}.id AND read_group IS NULL #For this post, is the read group explicitly public\n`

        var sql_any_defined = `SELECT read_group FROM ${tb_access} WHERE post_id=${T}.id`
        var sql_accessible_or_public = 
                        `\t( (SELECT COUNT(*) FROM (${sql_approved}\n\t) as TX00  ) > 0 OR \n` +
                        `\t (SELECT COUNT(*) FROM (${sql_public}) as TX01 ) > 0  ) OR \n` +
                        `\t (SELECT COUNT(*) FROM (${sql_any_defined}) as TX02) = 0`

    
                        
        return sql_accessible_or_public;
    }
    /**
     * Check each post to see if it is a Event with reoccurring pattern, if so generate all occurrences and add to the output
     * 
     * @param {Array} options {source_posts : List of posts that exist from the database, start : An array of time periods to view }
     */
    async generate_occurrence_instances (options){
    
        if ( ! options ) return; 
        let { source_posts , start } = options 
        if ( ! Array.isArray(source_posts)) return; 
        if ( ! Array.isArray(start)) throw new Error ('Generate occurrences expects array indicating start and end period' )
        
        var post =null; 
        let  arr_promises=[];

        var s0 = core.type_date(start[0]),s1 = core.type_date(start[1]);
        var range = [s0,s1].sort( (a,b) => a-b )
        
        for ( var i=source_posts.length-1; i > -1; i--){
            post = source_posts[i];
            //Is this event reoccurring - defined as having aux
            if ( post.aux && post.aux.toLowerCase().startsWith('freq=') ) { 
                //remove this reoccurring event if it is outside the range we need
                if (!(  range[0] <= post.start  && post.start <= range[1])) source_posts.splice(i,1);
                
                arr_promises.push( core.generate_occurrences({ post, start : range }))
            }
        }
        //Wait for results
        let arr_results = await Promise.all(arr_promises)
 
        arr_results.forEach( occurrences =>{
            if ( occurrences.length==0 ) return; 
            let occurence = null, prev_instantied;
            //Check if a each occurrence has previously been created and saved to the database and if so, drop the newly generated one
            for ( var j=occurrences.length-1; j > -1; j--){
                occurence = occurrences[j];
                prev_instantied = source_posts.find ( post => {
                    return post.parent_id == occurence.parent_id && post.value == occurence.value 
                })
                if(prev_instantied) {
                    //this this instance occur has already been generated, avoid duplicating it
                    occurrences.splice(j,1);
                    prev_instantied.is_occurrence = true; 
                }
            }
            //Add the results into the output
            source_posts.push( ... occurrences ) 
        })          
    }

    /**
     * Based on theoptions passed in, start to construct a sql query for that page post objects needs to be retrieved from
     * the database and passed to the render of render_post
     * @param {Options} options 
     * @returns {Object }  sql render_type, where_exprs
     */
    async select_render_view(options){
        var where_exprs = []
        var sql=null; 
        /** Always true except when rendering for search, tags, archives, forms, admin page etc */
        let do_layout_retrieval_for_this_post = true; 
        var tb_posts        = `${db.name}.posts`
        var tb_meta         = `${db.name}.post_metas`
        var tb_tags         = `${db.name}.tags`
        var tb_categories   = `${db.name}.categories`
        var tb_posttags     = `${db.name}.post_tags`
        
        var render_type = 'general_post'
        var sql_limit = `${await db.page_limit(options.query)}`

        if(options.type == 'tags' || options.url?.startsWith("/tags/")) {
            render_type = 'tags'
            var tag_parts = options.url.trim().split(/\//gm);
            var tag_name = tag_parts[0];
            for ( var i=tag_parts.length-1; i >-1; i--){
                if (tag_parts[i]) {
                    tag_name = tag_parts[i];
                    break; 
                }
            }
            var sel_tag_id = `SELECT id FROM ${tb_tags} WHERE ${db.like('title', tag_name)}`
            var sel_postid = `SELECT post_id FROM ${tb_posttags} WHERE tag_id IN (${sel_tag_id})`
            var xcols = `(SELECT value FROM ${db.name}.post_metas WHERE name LIKE "feature_image" and post_id=T.id) as feature_image`

            where_exprs = [ `  id in (${sel_postid})  ` ] 
            where_exprs.push( '('+ this.get_post_sql_access_rights( options.user_id , "T") + ')' )
            where_exprs = where_exprs.join( " AND ")
            sql = `SELECT title, description, url, type, ${xcols} FROM ${tb_posts} T WHERE ${ where_exprs  } ${ sql_limit }`            
        }else if(options.type == 'categories' || options.url?.startsWith("/categories/")) {
            render_type = 'categories'
            var cat_parts = options.url.trim().split(/\//gm);
            var cat_name = cat_parts[0];
            for ( var i=cat_parts.length-1; i >-1; i--){
                if (cat_parts[i]) {
                    cat_name = cat_parts[i];
                    break; 
                }
            }
            

            var sel_category_id = `SELECT id FROM ${tb_categories} WHERE ${db.like('title', cat_name)}`
            var sel_postid = `SELECT id FROM ${tb_posts} WHERE category_id IN (${sel_category_id})`
            var xcols = `(SELECT value FROM ${db.name}.post_metas WHERE name LIKE "feature_image" and post_id=T.id) as feature_image`
            where_exprs = [` id in (${sel_postid}) `]
            where_exprs.push( '('+ this.get_post_sql_access_rights( options.user_id , "T") + ')' )
            where_exprs = where_exprs.join( " AND ")
            sql = `SELECT title, description, url, type,${xcols} FROM ${tb_posts} T WHERE ${ where_exprs  } ${ sql_limit}`
 
        } else { 
            //for normal , none-special pages 
            if ( options.url && options.url.startsWith("/preview/")){
                options.is_preview = true; 
            }
            where_exprs = []
            where_exprs.push (  `${options.id ? db.is('id', options.id) : db.like('url', options.url)}` )
            where_exprs.push (  `${db.like('type', options.type)}` )
            if ( options.post_id ) {
                where_exprs = [  `${db.is('id', options.post_id )}` ] 
                do_layout_retrieval_for_this_post = false; 
                if (options.query.full != undefined || options.query['include-layout'] != undefined)
                    do_layout_retrieval_for_this_post = true 
            }
     
            where_exprs = where_exprs.join( " AND ")
            sql = `SELECT id, type FROM ${tb_posts} WHERE ${ where_exprs }` 
        }

        return { sql, render_type, where_exprs, do_layout_retrieval_for_this_post}
    }
    /**
     * When rendering a post and the options include a valid identifier for a child post, this function serves
     * to grab the child post and prepare it for consumption within the target post that is being rendered
     * @param {Object} options { child_id : String or Number id of the child }
     * @returns {Object} Object 
     */
    async get_consumable_child_data(options) {
        let consumable_child_data = {}
        var sel_by_user = `(SELECT name FROM ${db.name}.users WHERE id=P.created_by) as created_by_name`
        var sel_cols    = `id, created, modified, created_by, ${sel_by_user}, type, status,description`
        var where_child = ` ${db.is('id',options.child_id)}`
        var child_post  = (await db.query(`SELECT ${sel_cols} FROM ${tb_posts} P WHERE ${where_child}`)) [0] || null
        var child_exist = child_post != null;

        var can_read_child = await  pages.can_user_read({  post_id : options.child_id , user_id : options.user_id })
        if ( ! can_read_child ) child_exist = false; //deny to user that 
        
        if ( child_exist ) { 
            //Read child post definiation
            consumable_child_data.__the_child = child_post 
            post.consumable_child_data = consumable_child_data
            //Read all meta properites <-----
            var child_metas = await db.query(`SELECT name, value FROM ${tb_meta} WHERE ${db.is('post_id', options.child_id)}`)
            if ( child_metas?.length > 0){ 
                consumable_child_data.__id = options.child_id 
                for( var i=0; i < child_metas?.length; i++) {
                    consumable_child_data[child_metas[i].name] = await  core.type_cast( 
                        child_metas[i].value ,
                        child_metas[i].name && child_metas[i].name.endsWith("_secret")
                        );
                } 
            }
        }else { //forceably clear the child property so there is no confusion moving forward
            options.child_id = null; 
        }
        return consumable_child_data
    }
    /**
     * Get a generic template post to show the user for when the user is trying to preview a post that they do not have access to
     * @returns {Object}
     */
    async get_template_preview_denied(){
        return {
            id : 'preview-not-allowed',
            title : "Preview Denied",
            description : "You are not permitted to preview posts",
            tags : ["denied", "preview","rights"],
            value : [
                {
                    type : 'container',
                    data : {},
                    children : [  
                        { type : 'title', data : 
                        { classes:'my-2'  ,text : 'Unable to Preview Post '+ post_id , level: 1 } },
                        { type : 'paragraph', data : {
                            text:`You are not allow to this post(${post_id}) because you do not have edit access.`} },
                        { type : 'paragraph', data : { text : 'Return to <a href="/">home-page</a>.'}}        
                    ]
                }
            ]
        }
    }
}
let pages = new Pages()
export default pages  