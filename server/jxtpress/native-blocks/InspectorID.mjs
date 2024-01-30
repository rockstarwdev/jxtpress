export default class {

    constructor(instance, {cp, chk} ){
 
        if ( instance && instance.data ) {
            this.element_id = instance.data.element_id 
        }
        cp(instance, cp)
    }
    edit ( { el, set, get, block_id , debounce }){
        return  el('inspector',{ priority: 50 },[
            
                el('label',{ },  "Element ID" ),
                el('string',{   value : get("element_id") , classes:['block-element-id'],
                    on_input : (e)=>{ 
                        set({ element_id :  e.target.value})
                         
                    }
                }),
                /*el('lookup',{ context : 'posts', onChange(e){
                    console.log ("lookup changed", e.detail.value )
                } }, [29]) */
            ]) 
    }
    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) {
        return false; 
    }
}