export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  )  {
            this.fullwidth      = chk(instance.data,'fullwidth',true)
            this.logo_url       = chk(instance.data, 'logo_url', null)
            this.logo_text      = chk(instance.data,'logo_text',null)
            this.logo_font      = chk(instance.data,'logo_font', null)
            this.logo_font_size = chk(instance.data,'logo_font_size',null)
            this.spacing        = chk(instance.data, 'spacing', 'between')
            this.reverse_flow   = chk(instance.data,'reverse_flow',false)
            this.gap_level      = chk(instance.data,'gap_level', 'gap-2')
            this.primary_url    = chk(instance.data, 'primary_url', '')
            this.theme          = chk(instance.data, 'theme', 'theme-default');
            this.mobile_center_title=chk(instance.data,'mobile_center_title', false)
            this.sticky         = chk(instance.data,'sticky', false)
        }
        cp ( instance,this );
        
    }

    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query,cls, append , util, fonts, block_id  }) { 
        var clz_spacing = this.spacing_to_class(this.spacing)
        var clz_reverse = this.reverse_flow ? 'flex-row-reverse' :''
        var self = this; 

        return el ( 'header' , { classes : [... cls(),'Header-Nav', this.theme  ] }, 
            el('div',{ classes: ['wrapper', get('fullwidth') ? '':'container mx-auto', clz_spacing, clz_reverse ] },
                el('div',{classes:['logos']},
                    this.logo_url ? el('img',{classes:['logo-image'],src: get('logo_url')}):null,
                    el('span',{classes :['logo-title'], 
                    style : {fontFamily : get('logo_font'), fontSize : get('logo_font_size')},
                    innerHTML : get('logo_text')}),
                ),
                el('nav',{ classes: [ ] , style:{minWidth: '320px' }},
                    el('slot',{  tag: 'ul', classes: ['tl-menu', self.gap_level] })
                )
            ),
            el('inspector', {}, 
                el('dropdown',{classes:[], values : this.get_themes() ,
                    value : get('theme'),
                    onChange(e){
                        set({ theme : e.detail.value })
                    }
                }
                    
                ),
                el('row',{label: "Logo Text"},
                    el('string', { value : get('logo_text'), placeholder : 'Title',
                        onInput (e){ 
                            var lt = query('.Header-Nav .logo-title')
                            if ( lt )lt.innerHTML = e.target.value 
                        },
                        onChange(e){
                            set({ logo_text : e.target.value })
                        }
                    })
                ),
                el('div',{},
                    el('label',{ },  "Logo Font" ),
                    el('dropdown',{   value : get('logo_font')  , 
                        classes:['block-font-family'], 
                        values : fonts,
                        html ( it ){
                                    return `<span style="font-family:${it.value}">${it.title} </span>`
                        },
                        onChange(e){
                            let font_family = e.detail.value 

                            var elem = document.querySelector(`#${block_id} .logo-title`);
                            if ( elem ) {
                                elem.style.fontFamily = font_family
                            }

                            set({ logo_font : font_family })
                        }
                    }), 
                ),

                el('div',{}, 
                    el('label',{}, "Logo Font Size"),
                    el('duplex',{
                        onChange(e){
                            if ( ! e.detail) return; 
                            var editcontrols = document.querySelector(`#${block_id} .logo-title`);
                            if ( editcontrols ) {
                                editcontrols.style.fontSize = e.detail.value 
                            }
                            set({ logo_font_size : e.detail.value })
                        }
                    },this.font_size),
                ),
                el('row',{label: "Primary URL"},
                    el('string', { value : get('primary_url'), placeholder : '/link/to/home/page', 
                        onChange(e){
                            set({ primary_url : e.target.value })
                        }
                    })
                ),
                el('row',{label: "Logo URL/SVG"},
                    el('text', { value : get('logo_url'), placeholder : 'Logo URL/SVG',
                        onChange(e){
                            set({ logo_url : e.target.value })
                        }
                    })
                ), 
                el('div', {classes:['flex','gap-2']},  
                    el('div',{}, 
                        el('checkbox',{classes:['sm', 'w-1/2'], 
                            label : 'Reverse',
                            value : get('reverse_flow'),
                            onChange(e){
                                set({reverse_flow : e.target.checked })
                            }
                        }), 
                        el('checkbox',{ value : get('fullwidth'), label:'Full Width', classes:['sm'], 
                            attrs: {'data-title': 'Span entire document'},
                            onChange(e){
                            set({fullwidth : e.target.checked })
                        }  }),
                    ),
                    el('row',{label: 'Spacing', classes:['w-1/2']},
                        el('dropdown', { value : get('spacing'), 
                            values : this.get_spacing_options(),
                            onChange(e){
                                var wrapper = query('.Header-Nav > .wrapper');
                                if ( wrapper ) {
                                    wrapper.classList.remove("justify-between","justify-evenly","justify-around")
                                    wrapper.classList.add( self.spacing_to_class( e.detail.value ) )
                                }
                                set({ spacing : e.detail.value })
                            }
                        })
                    )
                ),
                el('div',{classes:['flex','gap-2']},
                    el('checkbox',{classes:['sm', 'w-1/2'], 
                        label : 'Sticky',
                        value : get('sticky'),
                        onChange(e){
                            set({sticky : e.target.checked })
                        }
                    }),    
                    el('checkbox',{classes:['sm', 'w-1/2'], 
                        label : 'On Mobile: Center Title',
                        value : get('mobile_center_title'),
                        onChange(e){
                            set({mobile_center_title : e.target.checked })
                        }
                    }),
                ),
                
                el('row',{label: 'Item Gaps', },
                    el('dropdown',{ value: get('gap_level'), values: this.get_gap_options(),
                        onChange(e){
                            var gap_level = e.detail.value 
                            var tl_menu = query(".tl-menu");
                            if ( tl_menu ) {
                                var arr = self.get_gap_options();
                                for (var i=0; i < arr.length; i++ ){ //remove old classes
                                    tl_menu.classList.remove ( arr[i].value  )
                                }
                                tl_menu.classList.add ( gap_level )
                            }
                            set({ gap_level })
                        }
                    })
                ),
                el('div',{classes:['my-2']},
                    el('button', {classes:['button'], innerHTML : "Add Menu Item",
                        onClick(e){ 
                            append ({ type : 'menuitem' , data :{ }})
                            util.trigger('blur', e.target )
                        }
                    })
                )
                
            )             
        )
    }
    render (core, { id, classes, s , inner_html, css, block_id , iattrs } ){ 
        var tag     = "header"; 
        var clz_spacing = this.spacing_to_class(this.spacing)
        var clz_reverse = this.reverse_flow ? 'flex-row-reverse' :''
        var clz_fullwidth=this.fullwidth ? 'container mx-auto' : ''
        var clz_on_mobile_center= this.mobile_center_title ? 'sm:flex-1':''
     
        var css_lff= this.logo_font ? "font-family:"+this.logo_font : "";
        var css_lfs= this.logo_font_size ? "font-size:"+this.logo_font_size : ""
        var final_css = `.${block_id} .logo-title { ${css_lff};${css_lfs}; }`

        
        css(final_css)

        let logos   = `<div class="logos ${clz_on_mobile_center}">`;
        logos += `<a href="${this.primary_url}">`
        if ( this.logo_url && this.logo_url.toLowerCase) {
            var lurl = this.logo_url.trim();
            if ( lurl.startsWith('<svg')){
                logos += `<span class="logo-image">${lurl}</span>`;
            }else { 
                logos += `<img class="logo-image" src="${lurl}">`
            }
        }
        if ( this.logo_text ){
            logos += `<span class="logo-title">${this.logo_text}</span>`
        }  
        logos += `</a>`
        logos += `</div>`


        let nav_button = `<button class="nav-button"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> </svg>  </button>`
        let on_small_screen =`<div class="mobile ${clz_spacing} ${clz_reverse} "> ${nav_button} ${logos}</div>`
        let nav = `<nav>${on_small_screen} <ul class="tl-menu ${this.gap_level}">  ${inner_html } </ul></nav>`
        let wrapper =`<div class="wrapper ${clz_spacing} ${clz_reverse} ${clz_fullwidth}"> ${logos} ${nav} </div>`;

        var clz_header_extra = ` ${this.theme } ${this.sticky ? 'sticky': ''}`
        var html =  `<${tag} ${classes("header-nav-block Header-Nav " + clz_header_extra) } ${id()}  ${iattrs()} > ${wrapper}  </${tag}>`
        return {
            html 
        }
    }

    get_spacing_options(){
        return [
            {title : 'Between', value : 'between'},
            {title : 'Around', value : 'around'},
            {title : 'Even', value : 'even'},
        ]
    }
    spacing_to_class (value){
        switch(value){
            case 'between': return 'justify-between';
            case 'around': return 'justify-around';
            case 'evenly': return 'justify-evenly';
        }
    }
    get_gap_options (){
        return [
            { title : "No Gap", value: "gap-0"},
            { title : "Gap 1", value: "gap-1"},
            { title : "Gap 2", value: "gap-2"},
            { title : "Gap 3", value: "gap-3"},
            { title : "Gap 4", value: "gap-4"},
            { title : "Gap 5", value: "gap-5"},
            { title : "Gap 6", value: "gap-6"},
            { title : "Gap 7", value: "gap-7"},
            { title : "Gap 8", value: "gap-8"},
            { title : "Gap 9", value: "gap-9"},
        ]
    }
    get_themes(){
        return [
            {title : 'Default' , value : 'theme-default'},
            {title : 'Dark', value : 'theme-dark'},
        ]
    }
    drop ( instance ) {
        if (instance.type.toLowerCase() != 'menuitem') return false; 
        return true 
    }
    style(render){
        return ` 
        `
    }
    script (render){

    }
}