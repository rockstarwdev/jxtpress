export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  )  { 
            this.action         = chk (instance.data,'action', '')
            this.method         = chk (instance.data,'method', 'post')
            this.autocomplete   = chk (instance.data,'autocomplete', '')
            this.form_name      = chk (instance.data,'form_name', '')  
        }
        cp ( instance,this );
    }

    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query, cls }) { 
 
        return el ( 'form' , { 
                    classes : [ this.classes, "relative" , "p-1", ... cls()] ,
                    attrs : {
                        name : get ("form_name"), 
                        method: get("method") ,
                        autocomplete : get("autocomplete") ,
                    }
                }, 
                el("div",{
                    classes:["absolute", "top-right"]
                    },
                    el("span",{innerHTML : this.get_icon(),classes:['color-yellow-500'] })
                ),
                el('slot',{ 
                     
                }),
                el('inspector', {},
                    el("row",{label:"Form Name"},
                        el("string",{ 
                            onChange(e){
                                set({ form_name : e.target.value  })
                            } 
                        } , this.form_name)
                    ),
                    el("row",{label : "Method"}, 
                        el('dropdown',{   
                            value :get('method'), classes : ['method'],
                            values : [ 
                                { title : "Get", value : 'get' },  
                                { title : "Post", value : 'post' },    
                            ],
                            onChange(e){
                                set({method : e.detail.value })
                            } 
                        })
                    ),
                    el("row",{ label : "Action"}, 
                        el('string',{
                            value : get('action'), classes : ['action'],
                            onChange(e) {
                                set({ action : e.target.value })
                            }
                        })
                    )
                )
            
        )
    }
    render (core, { id, block_id,  classes, s , inner_html, name,attr , consumable_child_data, iattrs  } ){  
        var submit_to = "";
        var data_of = "";
        if ( this.__submit_to ){ //this property is available when the form is embeded into a post
            //__submit to is typically an array pointing to the post-type "form" in which the original form was designed & stored
            //Upon submission of the form, we know which post to tie the submission to
            var post_id = this.__submit_to;
            if ( Array.isArray(post_id) ) post_id= post_id[0]
            if ( post_id ){ 
                submit_to = ` ${attr('form-post-id', post_id)}`
            }
        }
        if ( consumable_child_data && consumable_child_data.__id ) {
            data_of = ` ${attr('data-of', consumable_child_data.__id )} `
        }
        var html =  
                `<form form-id="${block_id}" ${classes("form-block")} ${id()}  ${iattrs()} `+ 
                ` ${attr ("method",this.method)} ${attr("autocomplete",this.autocomplete)} ` +
                ` ${attr("name",this.form_name)} ${attr("action",this.action)} ${submit_to} ${data_of}>` +
                ` ${inner_html } ` +
                `</form>`
        return {
            html 
        }
    }

    
    drop ( instance ) {
        return true 
    }
    style(render){
        return ` 
        `
    }
    script (render){

    }
    get_icon(){
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      `
    }
}