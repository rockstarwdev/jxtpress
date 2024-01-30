/**
 * PostBinding allows user to add Visually editable Vue Option API that can be inter-mixed with each page render
 * in order to create fully functional runtime Vue apps at production runtime.
 */
export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          this.option_config = chk(instance.data, "option_config", this.get_template())
          this.title = chk(instance.data, "title","")
        }
        
        cp(instance, this)
    }

    get_template (){
return `
{
    // Ran on server right before render_post is finalized and will be merged with
    // data () method.  Use this function to return app data that is source from database and other
    // server logic.
    async app_data (core, render_options) {
        
        return {
            // data to return to frontend and merged with data()
        }
    },
    data () {

        return {
            // data            
        }
    }
    created() {
    
    },
    mounted(){
    
    },
    unmounted() {
    
    },
    methods : { 

    },
    computed: {
    
    },
    watch : {
    
    }
}
`
    }
    edit ({ el , get, set, query, util, block_id } ){     
        return el('serverside',{ 
                attrs: { id : get('element_id')},
            },
            el('inspector',{},
                el('row',{
                    label : 'Title',
                }, el('string', {
                    value : get('title'),
                    onChange(e) {
                        set({ title : e.target.value})
                        util.trigger('blur',e.target)
                    }
                })
                ),
                el('button',{  
                    classes:['inline-flex','items-center'],
                    innerHTML : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                  </svg>
                  <span class="ml-2">Logic</span>
                  `,
                    async onClick(e){
                        
                        var res = await util.code_editor({
                            title : block_id + " " + " Options API",
                            value : get('option_config'),
                        })
                        if ( res.action == 'ok') {
                            set({option_config :  res.value  })
                            util.trigger('blur',e.target)
                        }
                    }
                })
            )
        );  
    }

    async render (core, { esc , is_preview, iattrs, id , block_id, classes   }){
        if ( is_preview ){
            return {
                html : `<span><b>{</b> PostBinding <b>}</b> <span class="color-indigo-500">${this.title || ""}</span> <span class="color-gray-300">no render</span></span>` 
            }
        }else {
            return {
                html : '<!-- PostBinding ' + block_id + ' -->'
            }
        }
 
    }
    style({ edit_mode , block_id} ){
        var extra =  ""
        if ( edit_mode ) extra = `
        background-color: #e3f6e07a;
        border: 1px solid var(--green-300);
        `
        return `
        
        #${block_id}.block-instance {
            display: flex;
            align-items: center;
            ${extra}
        }
        `
    }
    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) { 
        return false 
    }
    /**
     * Defines which blocks and be allow to be inserted into the block
     * @param {Object} blk Block Definition
     * @returns {Boolean}
     */
    insertable (blk){ 
        return false 
    }
}