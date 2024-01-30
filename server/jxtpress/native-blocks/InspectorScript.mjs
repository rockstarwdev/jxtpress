export default class {

    constructor(instance, {cp, chk} ){ 
        if ( instance && instance.data ) {
            this.script = chk(instance.data, "script", "") 
        }
        cp(instance, cp)
    }
    edit ( { el, set, get, block_id , debounce }){
        return  el('div',{}, 
                    
                    el('inspector',{ priority: -50 },[
                        
                        el('label',{innerHTML: "Block Script"  }, []),
                        el('text',{   value : get("script") , classes:['block-script'], style :{minHeight:'96px'} ,
                            placeholder : "Javascript . . .",
                            on_input : (e)=>{ 
                                set({ script :  e.target.value}) 
                            }
                        }),
                        
                    ]) 
                )
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