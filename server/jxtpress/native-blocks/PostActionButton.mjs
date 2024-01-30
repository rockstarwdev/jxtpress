export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
            this.action      = chk (instance.data, "action", "buy_now" )  
            this.text        = chk (instance.data, "text", null )
            //todo is_grid means creating a display of images such that each is clickable 
        }
        
        cp(instance, this)
    } 
    get_action_types(){
        return [
            { title : "Buy Now", value:"buy_now"},
            { title : "Add to cart", value:"add_to_cart"},
            { title : "Subscribe", value:"subscribe"}, 
        ]
    }
    edit ({ el , get, set, query } ){     
        return el('serverside',{ 
                attrs: { id : get('element_id')},
            },
            el('inspector',{},
                 el('row',{
                    label : "Action",
                 },
                    el('dropdown', { 
                        value : get('action'), 
                        values : this.get_action_types(),
                        onChange ( e ) {
                            set({ action : e.detail.value })
                        }
                    })
                 ), 

                 el('row',{
                    label : "Text",
                 },
                    el('string', { 
                        value : get('text'),  
                        onChange ( e ) {
                            set({ text : e.target.value })
                        }
                    })
                 ), 
                 
            )
        );  
    }

    async render (core, { id, classes,  esc , post_id , is_preview, iattrs }){ 
        var html = '';  
        var def = "";
        var add_classes = ""
        if ( this.action == "buy_now") {
            def = "Buy Now"
            add_classes += "bg-yellow-500"
        }else if ( this.action == "add_to_cart"){
            def = "Add to cart"
            add_classes += "bg-orange-500" 
        }else {
            def = "Subscribe"
            add_classes += "bg-indigo-500 color-white" 
        }
        var display_text = this.text  ||def 
        html = `<button ${id()}  ${iattrs()}  ${classes('PostActionButton '+add_classes)} post-id="${post_id}" action-type="${this.action}"> ${display_text} </button>`
        return {
            html  
        }
    }
    style (){
        return ` 
            .block-instance.postactionbutton {
                display: inline-block
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