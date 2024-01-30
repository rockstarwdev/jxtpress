export default class  {
 
    constructor(instance, { cp, chk} ){ 
        //text , title 
        if ( instance) {
            this.item_style     = chk( instance.data,"item_style", "none");
            this.status        =  chk(instance.data, "status", "initial") 
            this.text           = chk(instance.data,"text", ""),
            this.custom_image   = chk(instance.data,"custom_image","")
            this.assigned       = chk(instance.data,"assigned","")
            this.assigned_value = parseFloat (chk(instance.data,"assigned_value", 50) )
            this.color_code     = chk(instance.data,"color_code","fff")
            this.start_date     = chk(instance.data,"start_date", "")
            this.due_date       = chk(instance.data,"due_date", "")
            this.completed_on   = chk(instance.data,"completed_on","")

            if (!Array.isArray( instance.children) )    instance.children = []
        }
        cp(instance,this);
    }
    get_name () { return "List Item" }
    
    is_completed (value ){
        return value == "completed" || value == "done" || value == "approved"
    }
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ( {  el , set,    get , append, util, props, block_id , query,cls,}) { 
 
        var is_checklist =  props.list_type == 'checklist' 
 
 
        var status_done = this.is_completed(get("status")) 
        var self = this; 
        let update_status = (status)=>{
            if ( this.is_completed(status)){ 
                set({ completed_on : self.get_today()  })
            }
            set({   status   })
        }
        var checkbox = props.is_todo ? 
            //Create floating div containing checkbox and color coded status
            el ('div', {style : {left :'5px', top: '6px'} ,classes:['absolute', 'flex','flex-col', ... cls()]},  

                el('checkbox',{ 
                    innerHTML : "", classes : [ "animated" ], 
                    
                    value : this.is_completed(get("status"))  ,
                    onChange(e){
                        var status = e.target.checked ? "done" : "in_progress" 
                       

                        update_status(status)
                    }
                }),
                el('div',{classes :['color-code-status', 'ii3', 'mt-5', 'ml-1'] ,
                    style : {backgroundColor : '#' + this.color_code }
                })
            
            ) : null ;

        let url_image = null; 
        
        if (get('custom_image') ){ url_image = `list-style-image: url(${ get('custom_image')});` }
        return el ( 
            'li' , {
                    attrs : { id : get('element_id') },  
                    classes : [ 
                        is_checklist ? 'checklist-item':'',  
                        is_checklist  && this.is_completed(get('status'))  ? 'done':''
                    ] ,
                    style : { paddingLeft: is_checklist ? '' : '0px' }
                }, 
            checkbox ,
            el('editable',{classes: ['text'] ,
                value : get('text'),
                onChange (e){
                    set({ text : e.detail.value })
                },
                style : {
                    borderRight : is_checklist ? `3px solid #${this.color_code}` : ''
                }
            }),
            !is_checklist ? null : el('div',{classes:['flex','justify-between', 'mt-4']}, 
                el( 'div',{ classes :["checklist-property" /*, get('assigned') || get('assigned_value') ? 'mt-4':''*/ ] },
                    el('span',{ classes:["assigned-to", "color-primary-600"] }, get("assigned") ),
                    el('span',{ classes:["assigned-value","ml-3", "tag"], innerHTML : get("assigned_value") , style:{opacity: 0.60} }, )
                
                ),
                el('div',{},
                    el('div',{ classes:['text-sm','mr-3'],
                    innerHTML : `<span class="ml-1">${status_done ?"Completed" :"Due" } </span> `+
                    `<span class="due-date-output text-fold color-primary-600">${get(status_done ? 'completed_on' : 'due_date' ) }</span>`})
                )
            ),
            el('slot',{ 
                on_change : (e)=>{      },
            }), 
            el('inspector', {},
                ! is_checklist ?
                el('input',{  
                    classes  : [],
                    placeholder :"Custom Image URL",
                    value : get("custom_image"),
                    onChange (e){
                        set({ custom_image :  e.target.value })
                    }
                }) : null ,
                ! is_checklist ? 
                el ('style', {
                    innerHTML : `
                    #${block_id} > li { 
                        ${ url_image }
                    }

                    `
                }) : null,
                !is_checklist ?  '' : 
                el ('div',{ classes : ['checklist-property'] },
                    el('div',{},

                        el('div',{ classes: ["flex","gap-2"] },
                            
                            el('div',{},
                                el('label',{}, "Assigned"), 
                                el('input',{
                                    placeholder : "Assigned to",
                                    value : get("assigned"),
                                    onChange(e){
                                        set({ assigned : e.target.value })

                                        
                                    },
                                    onInput(e){
                                        var el_assigned = query(".checklist-property > .assigned-to");
                                        if ( el_assigned) {
                                            el_assigned.innerHTML = e.target.value
                                        }
                                    }
                                }),
                            ),
                            el('div',{},
                                el('label',{}, "Priority"),
                                el('number',{
                                    placeholder : "Assigned value",
                                    value : get("assigned_value"),
                                    onChange(e){
                                        set({ assigned_value : parseFloat ( e.target.value) })
                                    },
                                    onInput (e){

                                        var el_value = query(".checklist-property > .assigned-value");
                                        if ( el_value) {
                                            el_value.innerHTML = e.target.value
                                        }
                                    }
                                }),
                            ),
                        ),
                        


                        el('div',{classes:['flex','gap-2']},
                            el('div',{classes:['w-1/2']},
                                el('label',{},"Status"),
                                el('dropdown', {
                                    values : this.get_statuses(),
                                    value : this.status , 
                                    onChange(e){
                                        var status = e.detail.value 
                                        
                                        update_status(status)
                                    }
                                }),
                            ),
                            el('div',{classes:['w-1/2']},
                                el('label',{},"Color Code"),
                                el('dropdown', {
                                    values : this.get_color_codes(),
                                    value : this.color_code , 
                                    onChange(e){
                                        set({ color_code : e.detail.value })
                                    }
                                }),
                            )
                        ),
                        

                        el('div',{classes:['flex','gap-2']}, 

                            el('div',{classes:['']},
                                el('label',{ classes: "text-sm"}, "Start"),
                                el('datetime',{
                                    onChange(e){
                                        set({start_date : e.detail.value })
                                        var start = query('.start-date-output');
                                        if ( start) start.innerText = e.detail.value
                                    }
                                }, get('start_date'))
                            
                            ),
                            el('div',{classes:['']},
                                el('label',{ classes: "text-sm"}, "Due"),
                                el('datetime',{
                                    onChange(e){
                                        set({due_date : e.detail.value })
                                        query('.due-date-output').innerText = e.detail.value
                                    }
                                }, get('due_date'))
                            
                            )
                        ),
                        status_done && get("completed_on") ?  el('div',{classes :["flex", "justify-between", "items-center"]},
                            el('div',{},
                                el('label',{style:{fontSize: '60%'}},"Completed On"),
                                el('div',{classes:['text-sm', "tag"] },get("completed_on"))
                            ),
                            el('button',{classes:["sm"],
                                    onClick(e){ 
                                        set({ status : "in_progress", completed_on : null })
                                    }
                                },
                                "Reset"
                            )
                        ) :  null

                    )
                )

            ) 
        )
    }
    render (core, {inner_html, props,s, classes, id, esc , iattrs }){ 
        var tag = "li";

        var style="";
        var content = ``
        if ( props.is_todo){
            var completed = this.is_completed(this.status);
            content = `
                <div style="border-right: 6px solid #${this.color_code}; border-radius: 3px;">
                    <div class="s-checkbox animated">
                        <input type="checkbox" disabled ${ completed ? 'checked': '' }>
                        <label class="checkbox"></label>
                        <label class="label ${ completed ? 'strike opacity-60': ''}">${esc(this.text)}</label>
                    </div>
                </div>
                
                <div class="more pl-6">
                    ${inner_html}
                </div>
            `
        }else {
            //Normal list
            var lsi = this.custom_image;
            if ( lsi ) lsi = `url(${lsi})`

            style +=`${s('list-style', this.list_type)}`+
                    `${s('list-style-image',lsi)}`

            content = `${esc(this.text)}${inner_html}`
        } 
        var html = `<${tag}  ${iattrs()}  ${classes('list-item ' + (props.is_todo ? 'mb-3 todo-item':''))} ${id()} style="${style}">
            ${content}
            </${tag}>`
        return { html } 
    } 
    drop ( instance ) { 
        console.log("CHECK If can add", instance.type)
        return instance.type == "lists" || instance.type == "container" || instance.type == "paragraph" 
    }
    style( ){
        return null
    }
    script ( ){
        
    }
    get_statuses(){
        return [
            {title : "Initial", value: "initial"},
            {title : "In Progress", value: "in_progress"},
            {title : "Pending Review", value: "pending_review"},
            {title : "On Hold", value: "hold"},
            {title : "Done", value: "done"},
            {title : "Completed", value: "completed"},
            {title : "Rejected", value: "rejected"}, 
        ]
    }
    get_color_codes(){
        return [
            { title : "White" , value : "fff", html(){
                    return `<span class="ii3" style="background-color:#fff"> </span> <span>White</span>`
                } 
            },
            { title : "White" , value : "000", html(){
                return `<span class="ii3" style="background-color:#000"> </span> <span>Black</span>`
                } 
            },

            { title : "Red" , value : "dc2626", html(){
                return `<span class="ii3" style="background-color:#dc2626"> </span> <span>Red</span>`
                } 
            },

            { title : "Orange" , value : "ea580c", html(){
                return `<span class="ii3" style="background-color:#ea580c"> </span> <span>Orange</span>`
                } 
            },
            { title : "Amber" , value : "f59e0b", html(){
                return `<span class="ii3" style="background-color:#f59e0b"> </span> <span>Amber</span>`
                } 
            },
            { title : "Lime" , value : "84cc16", html(){
                return `<span class="ii3" style="background-color: #84cc16"> </span> <span>Lime</span>`
                } 
            },
            { title : "Green" , value : "16a34a", html(){
                return `<span class="ii3" style="background-color:#16a34a"> </span> <span>Green</span>`
                } 
            },
            { title : "Teal" , value : "14b8a6", html(){
                return `<span class="ii3" style="background-color:#14b8a6"> </span> <span>Teal</span>`
                } 
            },
            { title : "Amber" , value : "06b6d4", html(){
                return `<span class="ii3" style="background-color:#06b6d4"> </span> <span>Cyan</span>`
                } 
            },
            { title : "Amber" , value : "3b82f6", html(){
                return `<span class="ii3" style="background-color:#3b82f6"> </span> <span>Blue</span>`
                } 
            },
            { title : "Amber" , value : "6366f1", html(){
                return `<span class="ii3" style="background-color:#6366f1"> </span> <span>Indigo</span>`
                } 
            },
            { title : "Amber" , value : "a855f7", html(){
                return `<span class="ii3" style="background-color:#a855f7"> </span> <span>Purple</span>`
                } 
            },
            { title : "Amber" , value : "e11d48", html(){
                return `<span class="ii3" style="background-color:#e11d48"> </span> <span>Rose</span>`
                } 
            }, 
        ]
    }
    get_today(){
        var now = new Date()
        var today = now.getUTCFullYear()+ '-' +
                    String(now.getUTCMonth()).padStart(2,'0')+'-'+
                    String(now.getUTCDate()).padStart(2,'0')+' '+

                    String(now.getUTCHours()).padStart(2,'0')+':'+
                    String(now.getUTCMinutes()).padStart(2,'0')+':'+
                    String(now.getUTCSeconds()).padStart(2,'0')

        return today
    }
}