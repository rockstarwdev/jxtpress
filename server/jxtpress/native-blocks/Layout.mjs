export default class {
    constructor(instance, {cp,chk}){
         
        if ( instance ) { 
            
            this.layout_column  = chk(instance.data,"layout_column",null)
            this.layout_row     = chk(instance.data,"layout_row",  null) 
            this.layout_type    = chk(instance.data,"layout_type","layout-row")
            this.layout_gap     = chk(instance.data,"layout_gap", "gap-2")
            this.layout_reverse = chk(instance.data,"layout_reverse",false);
            this.tag_type       = chk(instance.data,"tag_type", "article")
        }
        cp(instance, this) 
        
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
    layout_css (t, reverse=false) {
        if ( t == 'layout-custom')return this.layout_column; 
        
        switch(t){
            case 'layout-row': return `1fr`; 
            case 'layout-50/50': return `1fr 1fr`; 
            case 'layout-40/60': return !reverse ? `40% 60%` : `60% 40%`;  
            case 'layout-30/70': return !reverse ? `30% 70%` : `70% 30%`;  
            case 'layout-1x3': return   `repeat(3, 1fr)`; 
            case 'layout-1x4': return   `repeat(4, 1fr)`;  
        }
    }
    get_layout_types (){
        return [
            {title : "Row"          , value : "layout-row"    } , 
            {title :"Sidy by Side"  , value : "layout-50/50"  } , 
            {title :"40 / 60"         , value : "layout-40/60"    } , 
            {title :"30 / 70"         , value : "layout-30/70"    } , 
            {title :"1 x 3"         , value : "layout-1x3"    },
            {title : "1 x 4"        , value : "layout-1x4"    },
            {title : "Custom"       , value : "layout-custom" }   
        ];
    }
    edit ({el, set, get, query , cls, append, util   }){
        var layout_type = get('layout_type')
        var layout_reverse = get('layout_reverse')

        var self = this; 
        
        var gap_types = [{ title : 'None', value : 'gap-0'}]
        for ( var i=1; i < 15; i++){
            gap_types.push({ title : 'Gap ' + i , value : 'gap-'+i})
        }

        var reverse_ui = null;
        if (['layout-40/60',  'layout-30/70'].includes(layout_type)){
            reverse_ui = el ('div',{classes: ['flex', 'gap-1']},
                el('checkbox',{value :  get('layout_reverse') , 
                    onChange (e){
                        var layout = query (".layout-children")
                        var checked = e.target.checked ;
                        if ( layout ){
                            layout.style.gridTemplateColumns = self.layout_css(get('layout_type'),checked )
                        }
                        set({layout_reverse : checked})
                    }
                }),
                el('div',{}, "Reverse")
            )
        }

        let custom_ui = null; 
        if ( layout_type == 'layout-custom' ){ 
            custom_ui = el('div',{ classes: ['flex', 'gap-2'] },
                    el('div',{classes:'vertical'},
                        el('label',{},"Column"),
                        el('string',{ value : get('layout_column'), placeholder : 'repeat(3, 1fr)', 
                        onInput (e){
                            var layout = query(".layout-children");
                            layout.style.gridTemplateColumns = e.target.value;
                            set({layout_column : e.target.value})
                        }
                     })
                    ),
                    el('div',{classes:'vertical'},
                        el('label',{},"Row"),
                        el('string',{ value : get('layout_row') , placeholder : 'minmax(100px, auto)', 
                            onInput (e){
                                var layout = query(".layout-children");
                                layout.style.gridTemplateRows = e.target.value;
                                set({layout_row : e.target.value})
                            }
                        })
                    )
                ) 
        }
        
        return el('div',{classes:['layout', 'p-3', ... cls()], attrs : { id : get('element_id') } }, 
            el('section',{
                classes : 'Layout', 
            },el('slot',{classes : ['layout-children', get('layout_gap'), 'grid'] ,
                attrs : { id : get('element_id') },
                style : {
                    gridTemplateColumns : layout_type == 'layout-custom' ? get("layout_column") :
                     self.layout_css(layout_type,layout_reverse) ,
                    gridTemplateRows : layout_type == 'layout-custom' ? get("layout_row") : null ,
                }
            })),
            el('inspector',{  },[
                el('div',{classes:['row']},
                
                    el('button', { class:['button'] ,
                        onClick(e){
                            append({
                                type : 'container',
                                children : [],
                                data : {}
                            })
                            util.trigger('blur',e.target )
                        }
                    },'Add Column'),
                ),
                
                el('label', {}, 'Layout Type'),
                el('dropdown',{   value : layout_type, 
                    values : this.get_layout_types() , 
                    onChange(e){ 

                        var layout = query(".layout-children");
                        let layout_type = e.detail.value
                        if ( layout_type != 'layout-custom' ){

                        }
                        set({layout_type })
                    }
                }),
                
                custom_ui, reverse_ui,
                el ('label',{}, 'Layout Gap'),
                el('dropdown',{   value : get('layout_gap'), 
                    values : gap_types , 
                    onChange(e){ 
                        var layout = query(".layout-children");
                        for ( var i =0; i < 15; i++){
                            layout.classList.remove("gap-"+i);
                        }
                        layout.classList.add( e.detail.value );
                        set({layout_gap : e.detail.value })
                    }
                }),
                el('div',{},
                    el('label', {}, "Semantic Tag"),
                    el('dropdown',{
                        values : this.get_tag_types(),
                        onChange(e){
                            set({ tag_type : e.detail.value })
                        }
                    },get('tag_type'))
                )
            ])
        )
    }

    render (core, {inner_html, id , block_id, classes, css, iattrs }){
        var tag = this.tag_type;
        var grid_col = this.layout_css(this.layout_type, this.layout_reverse);
        var grid_row = this.layout_row;
        var bid  = block_id || this.id 
        var selector = `.${bid} `

        css (`
            ${selector} {
                grid-template-columns: ${grid_col};
                grid-template-rows: ${grid_row};
            }        
            @media (max-width: 640px) {
                /* sm: 0 - 640px */
                ${selector }{
                    grid-template-columns: 1fr;
                }
            }
        `)
        var html = ` 
        <${tag} ${id()}  ${classes ("layout grid " + this.layout_gap)}  ${iattrs()}  >
            ${inner_html}
        </${tag}>`
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
    style() {
        return `
        .layout-children > .block-instance {
            border: 2px dashed #aeb6c6b0;
        }

        `
    }
}