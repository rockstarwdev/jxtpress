export default class  {
 
    constructor(instance, { cp, chk} ){ 
        //text , title 
        if ( instance) {
            this.list_type = chk( instance.data, "list_type", "ul");
            this.item_style = chk(instance.data,"item_style","initial")
            this.custom_image = chk(instance.data, "custom_image", "")
            this.sort_by = chk ( instance.data, "sort_by", "none")
            this.padding = chk(instance.data,"padding","1em")
        }
        cp(instance,this);
    }
    get_name () {
        return "Lists"
    }
 
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ( {  el , set,    get , append, util , block_id , query,cls  }) { 

        var list_type = get("list_type")
        let is_list   = list_type!= 'checklist'
        let is_custom = get("item_style")== 'custom' 

        var self = this; 
        var style = {}
        
        if ( is_list){
            style.paddingLeft = get('padding')

            if ( is_custom ) {
                style.listStyleImage =`url(${ get('custom_image') })`
            }else {
                style.listStyle=get('item_style', get("list_type"))
            }
        }
        
        
        return el ( 'ul' , { classes : [... cls() ],  style  ,  attrs : { id : get('element_id') } }, 
                el('button',{ classes:['mb-2', 'ripple'],
                    innerHTML : `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                    stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                    <span class="color-gray-500">Item</span>
                    `,
                    onClick(e){ 
                        append ({ type : 'listitem' , data :{ }})
                        util.trigger('blur', e.target )
                    }
                }), 
                el('style',{
                    innerHTML : !is_list ? "": 
                    `
                        #${block_id} > ul { 
                        }
                    `
                }),
                el('slot',{ 
                    props : this.pass_props(), 
                    on_change : (e)=>{  
                        set({ text : e.detail.value })
                    },
                    attrs : { id : get('element_id') },  
                }),
                 
                el('inspector', {},
                    el("label",{},"List Type"),
                    el('dropdown', {
                        values : this.get_list_types(),
                        value : this.list_type,
                        onChange (e){
                            set({ list_type : e.detail.value })
                        }
                    }),

                    !is_list ? null: el('div',{},
                        el('label',{},'Padding'),
                        el('duplex',{
                            onChange(e){
                                if ( ! e.detail) return; 
                                var padding = e.detail.value 
                                set({padding})
                                var ul = query(".edit-controls");
                                if ( ul ) {
                                    ul.style.paddingLeft = padding
                                }
                            }
                        },get('padding'))
                    ),
                    !is_list ? null : el('div',{},
                        el("label",{},"List Style") , 
                        el ('dropdown',{ classes :[ 'mt-2'],
                            values : this.get_item_styles(),
                            value : get("item_style"),
                            onChange(e){
                                set({item_style : e.detail.value })
                            }
                        })  
                    ),
                   
                    is_custom && is_list? el('label',{}, "Custom Icon"):null,
                    is_custom && is_list ? 
                    el ('string',{ classes :[  ], 
                        value : get("custom_image"),
                        placeholder:"URL to image",
                        onChange(e){
                            set({custom_image : e.target.value })
                        }
                    }) : el('div',{}),

                    !is_list ? el('div',{},

                        el('div',{classes:['flex','gap-2']},//
                            el('div',{classes:['w-1/2']} ,
                                el('label',{}, "Sort By"),
                                el('dropdown',{
                                    values : this.get_sort_types(),
                                    onChange(e){
                                        console.log ("Hey =  ", e.detail.value )
                                        set({ 
                                            sort_by : e.detail.value 
                                        })
                                    }
                                }, get("sort_by"))
                            ),
                            el('div',{classes:['w-1/2']} ,
                                el('div',{innerHTML : "&nbsp;"}),
                                el('button',{ classes:['text-sm'],
                                    onClick(e){
                                        var sort_type = get("sort_by")
                                        var fn_sort = self.get_sort_fn( sort_type );  


                                        set({ fn_sort  })
                                        setTimeout(()=>{
                                                util.trigger("change", e.target, { value : null } )
                                                util.trigger("blur", e.target, { value : null } )
                                        },50)
                                        
                                    }
                                },"Sort Now")
                            )
                        )
                    ) : null  
                ) 
        )
    }
    render (core, {inner_html, classes, id,s,esc, iattrs }){ 
        var tag = this.list_type;
        if ( tag == 'checklist') tag = 'ul'
        var style=""
        var is_todo = this.pass_props().is_todo
 
        if ( is_todo ) {

        }else {
            if ( this.item_style == 'custom'){
                var val = esc(this.custom_image);
                if ( val ) { 
                    val = `url(${val})`
                    style+= `${s('list-style',val)}`
                }

            }else { 
                style+= `${s('list-style',this.item_style)}`
            }
            style += `${s('padding-left', this.padding)}`
        }
        var html = `<${tag}  ${iattrs()} 
             ${classes('list-block ' + (is_todo ? 'is-checklist': 'is-list'))} ${id()}  style="${style}">

            ${inner_html}</${tag}>`
        return { html }
    } 
    drop ( instance ) { 
        return instance.type == "listitem" 
    }
    style( ){
        return null
    }
    script ( ){
        
    }
    pass_props(){
        return {  
            list_type : this.list_type, 
            is_todo : this.list_type == 'checklist' 
        }
    }
    get_list_types(){
        return [
            {title : "Unordered List", value : "ul"},
            {title : "Ordered List", value : "ol"},
            {title : "Check List", value : "checklist"}
        ]
    }
    /**
     * 
     * @param {String} type type of sorting to complete
     */
    get_sort_fn(type){
        
        switch(type){
            case 'none': return null;
            case 'by_status': 
                return (a,b)=>{
                    a = a.data?.status; 
                    b = b.data?.status 
                    return (a < b) ? -1 : (a > b) ? 1 : 0 
                };
            case 'by_assign':
                return (a,b)=>{ 
                    a = a.data?.assigned; 
                    b = b.data?.assigned 
                    return (a < b) ? -1 : (a > b) ? 1 : 0 
                };
            case 'by_priority':
                return (a,b)=>{ 
                    a = parseFloat(  a.data?.assigned_value )
                    b =  parseFloat (b.data?.assigned_value ) 
                    var dif = a  - b 
                    return  dif
                }
            case 'by_color':
                return (a,b)=>{
                    a = a.data?.color_code; 
                    b = b.data?.color_code 
                    return (a < b) ? -1 : (a > b) ? 1 : 0  
                }
            case 'by_completion':
                return (a,b)=>{ 
                    return new Date(b.data?.completed_on ||null) - new Date(a.data?.completed_on ||null);
                }
            case 'by_due':
                return ( a,b)=>{
                    return new Date(b.data?.due_date ||null) - new Date(a.data?.due_date ||null);
                }
            case 'by_start':
                return (a,b)=>{
                    return new Date(b.data?.start_date ||null) - new Date(a.data?.start_date ||null);
                }
        }
    }
    get_sort_types (){
        return [
            { title : "None", value : "none" },
            { title : "By Status", value : "by_status" },
            { title : "By Assigned", value : "by_assigned" },
            { title : "By Priority", value : "by_priority" },
            { title : "By Color", value : "by_color" },
            { title : "By Completion", value : "by_completion" },
            { title : "By Due", value : "by_due" },
            { title : "By Start", value : "by_start" },
        ]
    }
    get_item_styles(){
        return [
            {title : "None", value : "none"},
            { title : "Arabic Indic", value: "arabic-indic"},
            { title : "Armenian", value: "armenian"},
            { title : "Auto", value: "auto"},
            { title : "Bengali", value: "bengali"},
            { title : "Cambodian", value: "cambodian"},
            { title : "Circle", value: "circle"},
            { title : "Square", value: "square"},
            { title : "Decimal", value: "decimal"},
            { title : "Bullet", value : "bullet"},
            { title : "Decimal Leading Zero", value: "decimal-leading-zero"},
            { title : "Devanagari", value: "devanagari"},
            { title : "Disc", value: "disc"}, 
            { title : "Initial", value: "initial"},
            { title : "Inside", value: "inside"},
            { title : "Outside", value: "outside"},
            { title : "Lower Alpha", value : "lower-alpha"},
            { title : "Lower Latin", value: "lower-greek"},
            { title : "Lower Roman", value: "lower-latin"},
            { title : "Lower Roman", value: "lower-roman"},
            { title : "Arabic Indic", value: "lower-indic"},
            { title : "Upper Armenian", value : "upper-armenian"},
            { title : "Alpha Roman", value : "alpha roman" }, 
            { title : "Upper Roman", value: "upper-latin"},
            { title : "Upper Greek", value: "upper-greek"},
            { title : "Upper Roman", value: "uper-roman"}, 
            { title : "Custom", value : "custom" }
        ]
    }
}