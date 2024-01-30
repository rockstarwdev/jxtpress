/**
 * Post Embed Allows user to import and render an existing post  into the block.
 */
export default class {
    constructor(instance, { cp, chk} ){
        if ( instance ) {
            this.post_id = chk ( instance.data, 'post_id', [] )    
            this.search_context = chk(instance.data,'search_context', 'posts')
        }
        cp(instance, this)
    }
    get_badge_icon(){
        return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" 
        stroke="currentColor" class="w-4 h-4 color-orange-800" style="transform:rotate(45deg)">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
        </svg>
      `
    }
    edit ({  el, set, api , get, query, create_block_id, util, post_types   }){
        var arr_types = [ {title : "Any Posts", value : "posts"}, ...post_types ]
        let ready = async  (e) =>{
            var res = await useRequest({url:"/api/posts",query :{id : get("post_id")  }})
            var post = res.d ? res.d[0] : null; 
            var blk_inst = null; 
            if (post ) {
                try {  post.value = JSON.parse(post.value); }catch(e){}
                if ( Array.isArray(post.value)) { 
                    blk_inst = { 
                        children : post.value, 
                        type: 'element',
                        data : {
                            tag : 'div'
                        }
                    }
                } 
            }
            
            if ( blk_inst) { 
                var force_ids = (B)=>{
                    if  ( ! B.id ) B.id = create_block_id();
                    for(var i=0; B.children && i < B.children.length; i++) force_ids(B.children[i])
                }   
                force_ids(blk_inst)
                blk_inst.override_render_children = true ; 
            }

            res = await useRequest({  url: "/api/site/block-render", method: "post", body: blk_inst });
            if ( res.d ) { 
                let { html } = res.d 
                var preview_elem = query(".PostEmbedRenderPreview");
                if ( html && preview_elem) preview_elem.innerHTML = html ;  
            }
        }
        return el ( 
            'div', { 
                classes: [ 'PostEmbed', 'relative', 'p-1' ] , 
                onReady : ready , style : { minHeight: '42px'}
            }, 
             el('div',{classes : ['PostEmbedRenderPreview','user-select-none'] } ),
             el('div', {classes: ['CoverTape','absolute'],style:{
                left:0,right:0,top:0,bottom:0, height:'100%', width:'100%',
                //backdropFilter: 'blur(0.05em)',
                borderRadius: '3px'
             } },),
             el('div', {classes: ['Icons','Flag','absolute'],
                style : {
                    bottom: '0em',right : '1em'
                }
             },
                el('span',{innerHTML : this.get_badge_icon() })
             ),
             el('inspector',{},
             
                el('label',{}, "Post to Embed"),
                el('lookup', { context : this.search_context , 
                    onChange(e){
                        console.log ("Lookup changed to ", e, e.detail, e.value )
                        set({  post_id : e.detail.value  })
                        ready(null)
                    },
                    
                }, this.post_id ),
                el('row',{ label: "Context"},
                    el('dropdown',{ value: this.search_context ,
                        values : arr_types,
                        onChange(e){
                            set({ search_context : e.detail.value })
                        }
                    })
                )
             )//End inspector
        )
    }

    async render (core, { inner_html, id, classes , is_preview, iattrs  } ){

        
        var html = null;
        
        if ( is_preview ) {  
           html = `<div class="PostEmbed"> <b>{</b> PostEmbed <b>}</b>   </div>`
        }else {
            html = `<div>PostEmbed need to <span class="color-green-500">render</span></div>`
        }
        return {
            html 
        }
    }

    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) {  
        return false 
    }

}