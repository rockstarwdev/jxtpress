export default class {

    constructor(instance, {cp, chk}){
        if ( instance ) {
          this.display              = chk(instance.data, "display"  , "block")
          this.flex_direction       = chk(instance.data, "flex_direction", "row")
          this.padding_vertical     = instance.data?.padding_vertical 
          this.padding_horizontal   = instance.data?.padding_horizontal    
          this.bg_color             = instance.data.bg_color  
          if ( instance.data.centered== undefined) instance.data.centered=true
          this.centered             = instance.data.centered  
          this.bg_image             = instance.data.bg_image  
          this.bg_xpos              = instance.data.bg_xpos  
          this.bg_ypos              = instance.data.bg_ypos  



          this.bg_xrepeat           = instance.data.bg_xrepeat  
          this.bg_yrepeat           = instance.data.bg_yrepeat  
          this.bg_size              = instance.data.bg_size  

          this.bg_video             = instance.data.bg_video 
          this.has_overlay          = instance.data.has_overlay  
          this.bg_overlay_blur      = instance.data.bg_overlay_blur  
          this.bg_overlay_color     = instance.data.bg_overlay_color   
          this.tag_type             = chk(instance.data,"tag_type", "section")
        }
        cp(instance, this)
    }

    get_flex_directions (){
        return [
            { title : "Row", value : "row" },
            { title : "Column", value : "column" },
        ]
    }
    get_tag_types (){

        return [
            { title : "Header", value : "header"},
            { title : "Navigation", value : "nav"},
            { title : "Aside", value : "aside"},
            { title : "Figure", value : "figure"},
            { title : "Section", value : "section"},
            { title : "Main", value : "main"},
            { title : "Footer", value : "footer"},
        ]
    }

    edit ({  el, get, set, util, query,cls  } ){
        let has_video = get("bg_video") ? true : false 
        let has_overlay =  get("has_overlay") ? true : false 

        var style = {
            backgroundColor     : get("bg_color") ,
            paddingTop          : get("padding_vertical"),
            paddingBottom       : get("padding_vertical"),
            paddingLeft         : get("padding_horizontal"),
            paddingRight        : get("padding_horizontal"),
            backgroundImage     : get('bg_image') ? `url(${get('bg_image')})` : null ,
            backgroundPosition  : `${get('bg_xpos')|| ''} ${get('bg_ypos') || ''}`,
            backgroundRepeatX   : get('bg_xrepeat'),
            backgroundRepeatY   : get('bg_yrepeat'),
            backgroundSize      : get('bg_size'),
            display             : get('display')
        }
        var css_selector = ".container"
        var is_flex_box = this.display == 'flex'
        return el('div',{classes:[ 'container', get('centered') ? 'mx-auto' : '',  ... cls() ], style, 
                attrs : { id : get('element_id') } 
            }, 
            !has_video ? null : 
            el ('video', {
                attrs : {
                    src : get('bg_video'),muted:true, loop: true, autoplay:true 
                }
            },),
            !has_overlay ? null : el('div',{classes : ['overlay'],
                style : {
                    backdropFilter : `blur(${get("bg_overlay_blur")})`,
                    backgroundColor : get("bg_overlay_color") ,
                }
            }),//End of overlay

            el('slot',{ style : {width: '100%'}  }),//Always keep strength out 
            el('inspector',{  }, 
                el('div',{}, 
                    el('div',{},
                        el('label',{}, "Display"),
                        el('dropdown',{
                            values : this.get_display_types(),
                            onChange(e){
                                if ( ! e.detail ) return ;
                                var display = e.detail.value  
                                set({display  })
                                var children = query(css_selector);
                                if ( ! children) return; 
                                children.style.display = display
                            }
                        }, get('display'))
                    ),
                    is_flex_box ? el('row',{ label : "Flex Direction"},
                        el('dropdown',{
                            value : get ("flex_direction"),
                            onChange( e) {
                                set( { flex_direction : e.detail.value })
                            },
                            values : this.get_flex_directions()
                        })
                    ) :null ,
                    
                    el('div',{},
                        el('label', {}, "Semantic Tag"),
                        el('dropdown',{
                            values : this.get_tag_types(),
                            onChange(e){
                                set({ tag_type : e.detail.value })
                            }
                        },get('tag_type'))
                    )
                ), 
                el('div',{classes:['flex','gap-2']},
                    el('div',{   },
                        el('label',{}, "Vertical Padding"),
                        el('duplex',{
                            onChange(e){
                                if ( ! e.detail ) return ;
                                var padding_vertical = e.detail.value 
                                set({padding_vertical  })
                                var children = query(css_selector);
                                if ( ! children) return; 
                                children.style.paddingTop = padding_vertical
                                children.style.paddingBottom = padding_vertical
                            }
                        }, get('padding_vertical'))
                    ), 
                    el('div',{   },
                        el('label',{}, "Horizontal Padding"),
                        el('duplex',{
                            onChange(e){
                                if ( ! e.detail ) return ;
                                var padding_horizontal = e.detail.value 

                                set({padding_horizontal })
                                var children = query(css_selector);
                                if ( ! children) return; 
                                children.style.paddingLeft = padding_horizontal
                                children.style.paddingRight = padding_horizontal
                            }
                        }, get('padding_horizontal'))
                    ), 
                ),
                el('div',{classes:['flex', 'gap-2']},
                    el('div',{},
                        el('label',{}, 'Background Color'),
                        el('color',{
                            onChange (e){
                                var bg_color = e.detail.value 
                                console.log ("BG COlor color", bg_color)
                                query('.children-slot').style.backgroundColor = bg_color
                                set({bg_color })
                            }
                        }, get("bg_color"))
                    ),
                   el('div',{},
                        el('label',{},"Margin Centered"),
                         el('checkbox',{
                            label : "Centered"
                        }, get('centered'))
                    ) 
                ),
                el('div',{ },
                        el('label',{},"Background Image" ),
                        el('media',{ 
                            value : get('bg_image') , placeholder : "Background Image",
                            onChange (e){
                                
                                var bg_image  = e.detail && e.detail.d ? e.detail.d[0].url || null : null  ; 
                             
                                set({bg_image })
                                var slot = query(css_selector) ;
                                 
                                slot.style.backgroundImage = `url(`+bg_image+`)`
                                console.log (slot,"> ", slot.style)
                            }
                        })
                ),
                !get('bg_image')  ? null : el('div',{}, 
                    el('div',{ classes : ['flex','gap-2']},
                        el('div',{},
                            el('label',{}, "X Repeat"),
                            el('dropdown',{
                                values : this.get_repeat_options(),
                                onChange(e){
                                    if ( ! e.detail ) return ;
                                    var bg_xrepeat = e.detail.value  
                                    set({bg_xrepeat  })
                                    var children = query(css_selector);
                                    if ( ! children) return; 
                                    children.style.backgroundRepeatX = bg_xrepeat
                                }
                            }, get('bg_xrepeat'))
                        ),
                        el('div',{},
                            el('label',{}, "Y Repeat"),
                            el('dropdown',{
                                values : this.get_repeat_options(),
                                onChange(e){
                                    if ( ! e.detail ) return ;
                                    var bg_yrepeat = e.detail.value  
                                    set({bg_yrepeat  })
                                    var children = query(css_selector);
                                    if ( ! children) return; 
                                    children.style.backgroundRepeatY = bg_yrepeat
                                }
                            }, get('bg_yrepeat'))
                        ),
                    ),
                    el('div',{classes:['flex','gap-2']},
                        
                        el('div',{   },
                            el('label',{}, "Bg X Position"),
                            el('duplex',{
                                onChange(e){
                                    if ( ! e.detail ) return ;
                                    var bg_xpos = e.detail.value 
                                    var bg_ypos = get("bg_ypos")
                                    set({bg_xpos  })
                                    var children = query(css_selector);
                                    if ( ! children) return; 
                                    children.style.backgroundPosition = `${bg_xpos} ${bg_ypos}` 
                                }
                            }, get('bg_xpos'))
                        ), 
                        el('div',{   },
                            el('label',{}, "Bg Y Pos"),
                            el('duplex',{
                                onChange(e){
                                    if ( ! e.detail ) return ;
                                    var bg_xpos = get("bg_xpos") 
                                    var bg_ypos = e.detail.value
                                    set({bg_ypos  })
                                    var children = query(css_selector);
                                    if ( ! children) return; 
                                    children.style.backgroundPosition = `${bg_xpos} ${bg_ypos}` 
                                }
                            }, get('bg_ypos'))
                        ), 
                    ),

                    el('div',{},
                        el('label',{}, "Bg Sizing"),
                        el('dropdown',{
                            values : this.get_bg_sizes(),
                            onChange(e){
                                if ( ! e.detail ) return ;
                                var bg_size = e.detail.value  
                                set({bg_size  })
                                var children = query(css_selector);
                                if ( ! children) return; 
                                children.style.backgroundSize = bg_size
                            }
                        }, get('bg_size'))
                    ),
                ),

                //VIDEO
                el('div',{ },
                        el('label',{},"Background Video" ),
                        el('media',{ 
                            value : get('bg_video') , placeholder : "Video URL",
                            onChange (e){
                                
                                var bg_video  = e.detail && e.detail.d ? e.detail.d[0].url || null : null  ; 
                             
                                set({bg_video })
                                var vd = query('video') ;
                                if ( vd )  vd.src =  bg_video
                            }
                        })
                ),
                el('div',{ classes : [ 'video-detail-pane','flex', 'justify-between'] }, 
                    el('div',{ classes: [ "checkbox-area" ]  },
                        el('checkbox',{label: "Overlay",
                            onChange(e){ 

                                var has_overlay = e.target.checked  
                                set({has_overlay })
                                util.trigger('blur',e.target)  
                            }
                        }, get('has_overlay'))
                    ),
                    el('div',{},
                    
                        el('div',{},
                            el('label',{},"Background Blur"),
                            el('duplex',{
                                values : [{title : "px", value : "px"}],
                                onChange(e){
                                    if ( ! e.detail ) return ;
                                    var bg_overlay_blur = e.detail.value ;
                                    set({  bg_overlay_blur  })

                                    var overlay = query(".container > .overlay");
                                    if ( ! overlay) return; 
                                    overlay.style.backdropFilter = bg_overlay_blur
                                     
                                }
                            }, get('bg_overlay_blur')),
                        ),
                        
                        el('div',{},
                            el('label',{}, 'Overlay Color'),
                            el('color',{
                                onChange (e){
                                    var bg_overlay_color = e.detail.value  
                                    set({bg_overlay_color })
                                    var overaly_elm = query('.overlay');
                                    overaly_elm.style.backgroundColor = bg_overlay_color
                                }
                            }, get("bg_overlay_color"))
                        ),

                    
                    )//end of has overlay detailed properties
                )

            )
        )
    }

    render (core, {inner_html, esc, id, s, iattrs }){
        let vid_url =this.bg_video
        let has_video =  vid_url ? true : false 
        var vid_tag = ``;
        if ( has_video){
            vid_tag = `<video src="${esc(vid_url)}" muted autoplay loop>`
        }
        var overlay = ``;
        if ( this.has_overlay ) {
            var blur = this.bg_overlay_blur
            var bcol = this.bg_overlay_color
            overlay = `<div class="overlay" ` + 
                    `style="backdrop-filter: blur(${esc(blur)}); background-color: ${esc(bcol)}"></div>`
        }
        var pv = this.padding_vertical;
        var ph = this.padding_horizontal;
        var bg_pos = `${this.bg_xpos} ${this.bg_ypos}`;
        var bg_size = this.bg_size 

        var classes = ` class="${esc(this.classes)} container ${this.centered ? 'mx-auto' :''} " `
        /*var styles = ` style="padding-top: ${esc(pv)};padding-bottom: ${esc(pv)}; padding-left: ${esc(ph)};`+ 
                    `padding-right: ${esc(ph)}; background-color: ${esc(this.bg_color) }; ` +
                    `background-position: ${esc(bg_pos)}; background-size: ${esc(bg_size)} "` */

        var styles = `style=" ${s("padding-top",pv)} ${s("padding-bottom",pv)} ${s("padding-left",ph)}`+ 
           `${s("padding-right",ph)} ${s("background-color",this.bg_color) } ` +
           `${s("background-position",bg_pos)} ${s("background-size",bg_size)}"`

        var html=  `<article ${id()} ${classes} ${styles}  ${iattrs()} > ` + 
            ` ${vid_tag} ${overlay}  ${inner_html}
        </article>`
        return { html }
    }



    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) {  
        return true 
    }
    /**
     * Defines which blocks and be allow to be inserted into the block
     * @param {Object} blk Block Definition
     * @returns {Boolean}
     */
    insertable (blk){ 
        return true 
    }
    get_repeat_options (){
        return [
            { title : 'Initial', value : 'initial'},
            { title : 'No Repeat', value : 'no-repeat'},
            { title : 'Repeat', value : 'repeat'},
            { title : 'Revert', value : 'revert'},
            { title : 'Unset', value : 'unset'},
            { title : 'Inherit', value : 'inherit'},
        ]
    }
    get_bg_sizes (){
        return [
            { title : 'Auto', value : 'auto'},
            { title : 'Initial', value : 'initial'},
            { title : 'Contain', value : 'contain'},
            { title : 'Cover', value : 'conver'},
            { title : 'Repeat', value : 'repeat'},
            { title : 'Revert', value : 'revert'},
            { title : 'Unset', value : 'unset'},
            { title : 'Inherit', value : 'inherit'},
        ]
    }
    get_display_types (){
        return [
            {title : 'Default',     value : ''},
            {title : 'Block',       value : 'block'},
            {title : 'Flex',        value : 'flex'},
            {title : 'Grid',        value : 'grid'},
            {title : 'Initial',     value : 'initial'},
            {title : 'Inline',      value : 'inline'},
            {title : 'Inline-Block',value : 'inline-block'},
            {title : 'Inline-Flex', value : 'inline-flex'},
            {title : 'Inline-Grid', value : 'inline-grid'},
            {title : 'Table',       value : 'table'},
            {title : 'Unset',       value : 'unset'},
        ]
    }
}