export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  )  {
            this.width          = chk(instance.data,'width','480px')
            this.height         = chk(instance.data,'height','320px')
            this.has_controls   = chk(instance.data,'has_controls', true)
            this.url            = chk(instance.data,'url',"")
            this.do_loop        = chk(instance.data,'do_loop', false)
            this.is_muted       = chk(instance.data,'is_muted',true )
            this.do_preload     = chk(instance.data,'do_preload', 'auto')
            this.poster_url     = chk(instance.data,'poster_url','')
        }
        cp ( instance,this );
    }

    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query,cls }) { 

        var self    = this; 
        var attrs = {};
        attrs.width = this.width
        attrs.height = this.height
        attrs.controls = this.has_controls
        //attrs.src   = this.url  //intentionally not setting the video attribute
        attrs.muted = this.is_muted
        attrs.preload = this.do_preload
        attrs.loop = this.do_loop 
        if ( this.poster_url) attrs.poster= this.poster_url

        return el ( 'div' , { classes : [ 'p-1', 'bg-gray-400', 'pointer-events-none', ... cls()] }, 
            el('video',{
                classes: ["border-gray-500", "border", "rounded"], attrs 
            }),
            el('inspector', {},
                el('div',{},
                    el('label',{text: "Video URL"  } ),
                    el('string',{
                        value : this.url,
                        onChange(e){
                            set({ url : e.target.value })
                        }
                    })
                ),
                el('div',{},
                    el('label',{text: "Video Thumbnail"  } ),
                    el('string',{
                        value : this.poster_url,
                        onChange(e){
                            set({ poster_url  : e.target.value })
                        }
                    })
                ),
                el('div',{classes: ['group','flex','gap-2']}, 
                    el('div',{},
                        el('label', {}, "Width"),
                        el('duplex',{ 
                            value : this.width,
                            onChange(e){
                                set({ width: e.detail.value })
                            }
                        })
                    ),
                    el('div',{},
                        el('label', {}, "Height"),
                        el('duplex',{ 
                            value : this.height,
                            onChange(e){
                                set({ height: e.detail.value })
                            }
                        })
                    )
                ),
                el('div', {classes: ['flex','gap-1', 'flex-wrap']},
                    el('checkbox',{ 
                        label: "Has Controls", classes : [ "" ],  
                        value : this.has_controls,
                        onChange(e){
                            var has_controls = e.target.checked    
                            set({ has_controls })
                        }
                    }),
                    el('checkbox',{ 
                        label: "Loop", classes : [ "" ],  
                        value : this.do_loop,
                        onChange(e){
                            var do_loop = e.target.checked    
                            set({ do_loop })
                        }
                    }),
                    el('checkbox',{ 
                        label: "Mute Video", classes : [ "" ],  
                        value : this.is_muted,
                        onChange(e){
                            var is_muted = e.target.checked    
                            set({ is_muted })
                        }
                    }),
                ),
                el('div',{},
                    el('label',{},"Preload"),
                    el('dropdown',{
                        values : this.get_preload_options(),
                        onChange(e){
                            var do_preload = e.detail.value; 
                            set({ do_preload })
                        }
                    },this.do_preload)
                )
            ) 
            
        );//
    }
    render (core, { id, classes, s , inner_html, iattrs  } ){ 
        var tag = this.tag ; 
        var attr = "";
        if(this.do_loop)attr += ` loop `
        if(this.has_controls)attr += ` controls `
        if(this.do_preload)attr += ` preload="${this.do_preload}" `
        if(this.is_muted)attr += ` muted `
        if(this.width)attr += ` width="${this.width}" `
        if(this.height)attr += ` height="${this.height}" `
        if(this.poster_url)attr += ` poster="${this.poster_url}" `
        if(this.url)attr += ` url="${this.url}" ` 

        var html =  `<video ${id()} ${classes('video')} ${attr} ${iattrs ()}></video>`
        
        return {
            html 
        }
    }

    get_preload_options(){
        return [
            { title : "Nothing", value : "none"},
            {title : "Auto", value : "auto"},
            {title : "Meta Only", value: "metadata"},
        ]
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
}