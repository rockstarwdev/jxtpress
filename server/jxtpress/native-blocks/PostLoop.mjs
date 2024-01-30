export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          this.loop_type    = chk(instance.data,'loop_type','default' )
          this.data_source  = chk(instance.data,'data_source', '')
          this.endpoint_url = chk(instance.data,'endpoint_url', '')
          this.endpoint_method = chk(instance.data,'endpoint_method', 'get')
          this.wrap_loop    = chk(instance.data, 'wrap_loop',true)
          this.endpoint_config = chk(instance.data, 'endpoint_config','')
        }
        cp(instance, this)
    }
    get_loop_icon(){
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
        stroke-width="2.5" stroke="currentColor" class="w-6 h-6 color-orange-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
        </svg>`
    }
    edit ({  el, query, set , get , api, util   }){
        var self = this; 
        var description = this.get_loop_type_descriptions().find(it =>  it.value == self.loop_type) ||{}
        
        var advanced_settings = null;

        if ( self.loop_type == 'plugin_method'){
            advanced_settings = el('row',{classes: ['AdvancedSettings', 'Data'],
                    label :  'Data Source'},
                el('input',{
                    placeholder: '<plugin name>.<filter name>',
                    onChange(e){
                        var data_source = e.target.value 
                        console.log ("CHANGED", data_source)
                        set({ data_source})
                    }
                } ,this.data_source)
            )
        }else if (self.loop_type == 'api') {
            advanced_settings = el('div',{classes: ['AdvancedSettings', 'Endpoint'] },
                el('row',{label: "HTTP Method"},
                    el('dropdown',{
                    values : this.get_http_methods(),
                    onChange(e){
                        var endpoint_method = e.detail.value 
                        set({endpoint_method })
                    }
                }, this.endpoint_method) ) ,

                el('row',{ label: 'Endpoint URL' },
                    el('string',{
                    value : this.endpoint_url,
                    placeholder: 'http://path/to/endpoint',
                    onChange(e){
                        var endpoint_url = e.target.value 
                        set({endpoint_url})
                    }
                } )),
                el('row', {'label':'Request Configuration JSON'  },
                    el('text',{
                    value : this.endpoint_config,
                    placeholder : "JSON string to be be sent via endpoint",
                    onChange(e){
                        let endpoint_config = e.target.value 
                        set({ endpoint_config })
                    }
                })),
                el('div',{classes:['flex','justify-center']},
                    el('button',{classes:['button'],
                        async onClick(e){
                            var config = get("endpoint_config");
                            try { config = JSON.parse(config); }catch(xe){
                                console.error("Error in config", xe);
                                config = {}
                            }
                            var body = {
                                ... config,
                                url : get("endpoint_url"),
                                method : get("endpoint_method"),
                            }
                            //
                            var res = await useRequest({url:"/api/site/http",method:'post', body } )

                            var data = res.d; 
                            if ( ! data  ) return;
                            var str_content = ``;
                            if ( Array.isArray(data)) {
                                var N = 10;
                                //If an array was returned, loop and print the first N amount
                                if(N > data.length) N = data.length;
                                str_content += `<h2>Array (${data.length})</h2>` 
                                for ( var j=0; j < N; j++){
                                    str_content+=`<div class="item mb-4"><b>${j}</b>: ${JSON.stringify(data[j])}</div>`
                                }
                                if ( data.length > N) str_content += "<div class='item mb-4'>...</div>"
                            }else {
                                //If an object was returned, then just  stringify and output a certain length
                                var N =350
                                str_content = JSON.stringify(data);
                                if ( str_content.length>N ) 
                                    str_content = str_content.substring(0,N) +"..."
                            }
                            //Show the Previewed data
                            util.open_modal({
                                style : { maxWidth: '480px' , maxHeight: '620px'},
                                title  : `<span class="font-extrabold color-primary-500">${body.method} : ${body.url }</span>`,
                                content : `<div style="max-height:400px;overflow-y:auto; overflow-x:hidden">${str_content}</div>`,
                            })
                            console.log ("Preview Data=","Do preview", res)
                        }
                    }, 'Preview')
                )

            )
        }
        return el ( 
            'div', { classes: ['PostLoopWrapper','p-3'] }, 
             el('serverside', {}, null),
             el('slot', {} ),
             el('div',{ classes: ['flex','justify-end', 'absolute'], style:{bottom: 0, right: '15px' }},
                el('span',{innerHTML  : this.get_loop_icon() } )
             ),
             el('inspector',{},

                el('row', {label: "Loop Type"},
                el('dropdown',{values : this.get_loop_types(), 
                    onChange ( e){
                        var loop_type = e.detail.value
                        set({ loop_type  })

                        var desc_el     = query(".Description");
                        var dobj        = self.get_loop_type_descriptions().find(it =>  it.value == loop_type) 
                        var root        = e.target.closest('.inspector-elements');
                        if ( ! desc_el) desc_el = root.querySelector(".Description");
                        if (dobj && desc_el) desc_el.innerText = dobj.title ; 
                    }
                }, self.loop_type)),

                advanced_settings,
                el('div',{classes:['Description', 'text-sm', 'color-gray-600','mt-1','mb-3'], innerText: description.title  }),
                el('checkbox',{ label: 'Wrap Loop', 
                    onChange(e){  
                        var wrap_loop = e.target.checked
                        set({  wrap_loop  }) 
                    }
                }, get('wrap_loop') )

             )
        )
    }

    async render (core, { inner_html, id, classes, is_preview , sty, iattrs  } ){
        
        var html = null; 
        if ( is_preview ){        
            var loop_icon = this.get_loop_icon()
            var preview_text = `<b>{</b><span class="color-primary-500 font-extrabold">Post Loop</span><b>}</b>`
            
            var preview = `<div class='PostLoopPreview flex items-center'>  ${loop_icon} <span style="display:block;width:1em;"></span>  ${preview_text}</div>`
         
            html = `<div class="PostLoop">${  preview }  </div>`;
        }else { 
            var tag_open =`<div ${id()} ${classes('PostLoop')} ${sty()}  ${iattrs()} >`
            var tag_close=`</div>`
            if (! this.wrap_loop ){ 
                tag_open =  tag_close = ``;
            }
            html = `${tag_open} ${ inner_html } ${tag_close}`
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
        if ( instance.type=='postembed') return true; 
        if ( instance.type=='element') return true; 
        if ( instance.type=='title') return true; 
        return false 
    }
    get_loop_types (){
        return [
            {title : "Page Query", value : "default"},
            {title : "Plugin Method", value : "plugin_method"},
            {title : "API Endpoint", value : "api" } 
        ]
    }

    get_loop_type_descriptions (){
        return [
            
            {title : "Loop the post/page's default result dataset - such as posts associated with a tag, or posts associated with search results",
             value : "default"},
            {title : "Loop any custom data the user specifies below via an exposed plugin filter function.", value : "plugin_method"},
            {title : "Specify a GET URL endpoint for which user can use to retrieve data to looped and rendered.", value : "api" } 
        ]
    }
    get_http_methods(){
        return [
            {title : "GET", value :"get"},
            {title : "POST", value :"post"},
            {title : "PUT", value :"put"},
            {title : "DELETE", value :"delete"},
        ]
    }
}