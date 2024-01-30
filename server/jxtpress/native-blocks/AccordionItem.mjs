export default class  {
 
    constructor(instance, {cp, chk}){ 
        if (instance){
            this.title = chk(instance.data, "title",  "")
            var init_state =  chk(instance.data, "init_state", true )
            this.init_state = init_state

            
        }
        cp(instance,this); 
    }
 
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ( {  el , set,    get , query, util }) { 
        var cls = get('classes');
        if ( !cls) cls = [];
        else cls = cls.split(/[\s,]/g)


        return el ( 'section' , { 
                style :{paddingBottom:'0.5em'},
                classes : ['accordion-item', ... cls, get('init_state') ? 'active' : ''  ] },  
                el('editable',{ 
                    on_change : (e)=>{  
                        set({ text : e.detail.value })
                    },
                    attrs : { id : get('element_id') },
                    placeholder : "Title",
                    value : get('text') , 
                    classes:['title'] 
                }),
                el( 'div',{ classes: ['content'] },
                    el('slot',{style:{ }}),
                ),
                
                el('inspector', {},
                    el('div',{classes: []},

                        el('checkbox',{
                            label : "Initial State - Active",
                            onChange(e){

                                set({init_state : e.target.checked })
                            }
                        },get('init_state')),
                        el('button',{
                            classes:['ml-3'], 
                            onClick(e){
                                var acc_title = query(".accordion-item > .title");
                                console.log ("You want to click", acc_title)
                                util.trigger('mclick',acc_title)
                                e.preventDefault()
                                e.stopPropagation();
                                
                            },
                            onblur(e){ 
                                e.stopPropagation()
                            }
                        },"Toggle"),
                    )
                ) 
        )
    }
    render (core, {inner_html , esc, id, classes , iattrs }){ 
        var html =  `<section t='accordion-item-block' ${iattrs()}`+ 
        ` title="${esc(this.title)}" ${classes('accordion-item ' + (this.init_state?'active':''))} ${id()}>` + 
        `   <div class="title"> ${this.text}   </div>` + 
        `   <div class="content">${inner_html}</div>` + 
        `</section>`

        return { html }
    } 
    drop ( instance ) {
        return true 
    }
    style( ){
        return null
    }
    script ( ){
        
    }
 
}