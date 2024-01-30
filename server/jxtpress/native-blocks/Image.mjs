export default class {

    constructor(instance, {cp, chk}){
       
        if (instance){
            this.width = chk(instance.data, "width", "50%")
            this.alignment=chk(instance.data,"alignment","center")
            this.position = chk(instance.data,"alignment","top")
            this.url = chk(instance.data,"url", ["https://placehold.co/600x400/EEE/31343C"])
            this.is_lazy = chk(instance.data,"is_lazy",false)
            this.border_radius = chk(instance.data,"border_radius","0px");
        }

        cp(instance,this);
    }
    edit ( { el, set, get, query, cls }){
        var M=this;
        let on_width_change = (e)=>{
            if ( ! e.detail ) return; 
            var width = e.detail.value; 
            set({width })
            var img = query("img.img");
            if ( img ){
                img.style.width = width; 
            }
        }
        let on_height_change = (e)=>{
            if ( ! e.detail) return; 
            var height = e.detail.value; 
            set({height })
            var img = query("img.img");
            if ( img ){
                img.style.height = height; 
            }
        }
        let align_to_cls = (val)=>{
            return val == 'left' ? 'text-left' : val == 'center'?'text-center':'text-right'
        }
        return el('figure',{
            classes:['image', 'flex', this.position == 'top' ? 'flex-col-reverse': 'flex-col', ... cls()],
            attrs : { id : get('element_id') } 
        }, [
            el ( "img", { src : this.url , classes:['img', this.classes ], 
                    style: {width: M.width, height: M.height, borderRadius : get('border_radius')} 
                }),
            this.title ? el('figcaption',{innerText : M.title , classes :[align_to_cls(this.alignment)]}) : null,
            el('inspector',{priority :  10},[

                el('media',{ 
                    value : this.url , placeholder : "Image URL",
                    onChange (e){
                        var files = e.detail.d; 
                        if (files.length == 0 ){
                            set({url : "" })
                        }else {
                            set({ url : files[0].url })
                        } 
                    }
                }),
                el('div',{classes:['flex','gap-1']},[
                    el('div',{classes:['row','w-1/2']},[
                        el('label', {  }, "Width" ),
                        el('duplex',{ value : this.width , classes : ['img-width' ],
                            onChange: on_width_change, onInput : on_width_change
                        })
                    ]), 
                    el('div',{classes:['row','w-1/2']},[
                        el('label', { },"Height" ),
                        el('duplex',{ value : this.height , classes : ['img-height'], 
                        onChange: on_height_change, onInput: on_height_change })
                    ])
                ]),
                el('div',{ classes:['flex','gap-2'] },
                    el ('div', {},
                        el('label',{}, 'Border Radius'),
                        el('duplex',{ 
                            onChange(e){
                                if ( ! e.detail) return; 
                                set({ border_radius : e.detail.value })
                                var img = query("img.img");
                                if ( img ) {
                                    img.style.borderRadius = e.detail.value 
                                }
                            },
                        }, get('border_radius'))
                    ),
                    el('checkbox',{ 
                        label: "Lazy", classes : [ "" ],  
                        value : this.is_lazy,
                        onChange(e){
                            var is_lazy = e.target.checked    
                            set({ is_lazy })
                        }
                    }),
                ),
                el('div',{classes:['row']},[
                    el('label',{ },"Caption"),
                    el('input',{value : this.title, classes:['title'],
                        onInput(e){ 
                            var fig = query ("figcaption");
                            if ( fig ) fig.innerText = e.target.value 
                            set({ title : e.target.value })
                        }
                    })
                ]),
                el('div',{classes: ['flex', 'gap-2']},  
                    el('div',{classes:['row', "w-1/2"]},[
                        el('label',{},"Caption Position"),
                        el('dropdown',{value : this.position,
                            values : [
                                { title : "Top",value : "top"},
                                { title : "Bottom",value: "bottom" }, 
                            ],
                            classes:['position'],
                            onChange (e) { 
                                var fig = query ("figure");
                                var val = e.detail.value 
                                if ( fig ) {
                                    fig.classList.remove("flex-col","flex-col-reverse")
                                    fig.classList.add(val == 'top' ? 'flex-col-reverse' : 'flex-col')
                                }
                                set({position : val})
                            }
                        })
                    ]),
                    el('div',{classes:['row', 'w-1/2']},[
                        el('label',{},"Caption Alignment"),
                        el('dropdown',{value : this.alignment,
                            values : [
                                { title : "Left",value : "left"},
                                { title : "Center",value: "center" },
                                { title : "Right" , value : "right"}
                            ],
                            classes:['alignment'],
                            onChange (e) { 
                                var fig = query ("figcaption");
                                var val = e.detail.value 
                                if ( fig ) {
                                    fig.classList.remove("text-left","text-center","text-right")
                                    fig.classList.add(align_to_cls(val))
                                }
                                set({alignment : val})
                            }
                        })
                    ]),
                ),
                el('div',{classes:['row']},[
                    el('label',{ },"Alt Text"),
                    el('text',{value : this.description, classes:['title'],
                        onInput(e){ 
          
                            set({ description : e.target.value })
                        }
                    })
                ]),
                
                
            ])
        ])
    }

    render (core, {inner_html, id,classes ,s , iattrs }){
        var lazy_attr = "";
        if ( this.is_lazy ){
            lazy_attr = ` loading="lazy" `
        }
        var img = `<img ${id()} ${classes() } ${lazy_attr} src="${this.url.toString()}"  ${iattrs()} `+ 
            `style="${s('width',this.width)}${s('height',this.height)}${s('border-radius',this.border_radius)}" alt="${this.description ||""} `+ 
            `">   ${inner_html} `
        var dir = this.position == 'top' ? 'flex-col-reverse' : 'flex-col'
        var align = this.alignment == 'left' ? 'text-left' : this.alignment=='center' ? 'text-center' : 'text-right'
        var html= `<figure  class="flex ${dir} " > ${img} <figcaption class="${align}">${this.title||""}</figcaption></figure>`;
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