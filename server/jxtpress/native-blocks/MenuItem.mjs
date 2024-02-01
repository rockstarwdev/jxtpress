export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  )  { 
            this.text = chk(instance.data, 'text' , '') 
            this.url  = chk(instance.data, 'url'  , '')
            this.use_new_tab = chk(instance.data, 'use_new_tab'  , false)
            this.trigger_open = chk(instance.data,'trigger_open', false)
            this.mega_menu = chk(instance.data,'mega_menu', false)
            this.ripple = chk(instance.data,'ripple', false)
        }
        cp ( instance,this );
        
    }
    get_chevron (){
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
      `
    }
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query,cls, child_count  }) {  
        var self    = this; 
        var placeholder = `<span class='opacity-50 user-select-none'><i>Menu-Item</i></span>`
        var chevron_html = this.get_chevron()
        if ( child_count== 0 ) {
            chevron_html = ''
        }
        var the_text  = '<span>'  +(this.text || placeholder ) + '</span> ' + chevron_html 
        var forcible_open = get('trigger_open')
        var is_mega = this.mega_menu 
        return el ( 'li' , { classes : [... cls(), 'inline-block', ],
                    onReady(e){
                        var parent =  e.target.parentElement
                        var pparent = parent.parentElement;
                        if (pparent &&  !pparent.classList.contains("tl-menu")) return ;
                        parent.classList.add("flex","flex-col","justify-center")
                    }
                }, 
                el('div', { 
                    classes: ['menu-title','relative'],  
                    innerHTML : the_text
                }),
                forcible_open ? el('slot',{ classes:['menu-item-manual-open','sub-menu', is_mega ? 'mega' : ''] , style:{
                    minWidth : is_mega ? "380px" : ""
                } }) : null,
                el('inspector', {},[
                    el('row', { label : 'Text'}, 
                        el('string', {
                            value : get('text'),placeholder: 'Menu Text',
                            onChange(e){
                                set({text : e.target.value})
                            },onInput(e){
                                var mt = query(".menu-title");
                                if ( mt ) {
                                    mt.innerHTML = e.target.value 
                                }
                            }
                        })
                    ),
                    el('div', {classes:['flex','gap-2']},
                        el('checkbox',{label: 'New Tab', classes:['sm'],
                            value :  get('use_new_tab'),
                            onChange(e){
                                set({ use_new_tab : e.target.checked })
                            }
                        }),
                        el('string', {
                            value : get('url'), placeholder : '/menu-link/url',
                            onChange (e){
                                set({ url : e.target.value  })
                            }
                        })
                    ),
                    el('div',{
                        classes : ['mt'], },
                        el('checkbox', {label: 'Is Mega Menu', classes:['sm'],
                            value : this.mega_menu ,
                            onChange(e){
                                set({ mega_menu : e.target.checked })
                            }
                        })    
                    ),
                    el('div',{
                        classes : ['mt'], },
                        el('checkbox', {label: 'Do ripple', classes:['sm'],
                            value : this.ripple ,
                            onChange(e){
                                set({ ripple : e.target.checked })
                            }
                        })    
                    ),
                    el('div',{
                        classes : ['mt','mt-7','mb-6'], },
                        el('checkbox', {label: 'Edit Mode: Forcibly Keep Open', classes:['sm'],
                            value : forcible_open ,
                            onChange(e){
                                set({ trigger_open : e.target.checked })
                            }
                        })    
                    ),
                    el('div',{classes:['my-3']})
                ]) 
            
        )
    }
    render (core, { id, classes, s , inner_html, children, block_id, iattrs  } ){ 
        /*
            this.text = chk(instance.data, 'text' , '') 
            this.url  = chk(instance.data, 'url'  , '')
            this.use_new_tab = chk(instance.data, 'use_new_tab'  , false)
            this.trigger_open = chk(instance.data,'trigger_open', false)
        */
       var chev = this.get_chevron()
       if ( children.length == 0){
        chev = '<svg class="w-4 h-4"></svg>';
       }

        var link_target='';
        if ( this.use_new_tab) {
            link_target = ` target="_blank" `
        }
        var link=`<a class="menu-link ${this.ripple ? 'ripple':''}" href="${this.url||'#'}" ${link_target}> <span>${this.text}</span>  <span>${chev}</span> </a>`
        var clz_mega_menu = ``;
        if ( this.mega_menu ) {
            clz_mega_menu = 'mega'
        }
        var children_wrapper = `<div class="sub-menu ${clz_mega_menu}" sub-menu-of="${block_id}" ><ul class="content" >${inner_html} </ul></div>`
        if ( children && children.length== 0){
            children_wrapper = ``
        }
        var html =  `<li ${classes("menu-item menuitem-block")} ${id()} ${iattrs()} > ${link} ${children_wrapper}</li>`
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
}