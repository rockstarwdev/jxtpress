export default class {

    constructor(instance, {cp, chk} ){
 
        if ( instance && instance.data ) {
            this.classes = instance.data.classes 
        }
        cp(instance, cp)
    }
    edit ( { el, set, get }){
        return  el('inspector',{ priority: -20 },[
            
                el('label',{innerHTML: "Block Class(es)" , priority: 20}, []),
                el('text',{   value : get("classes") , classes:['block-class'] ,
                    on_input : (e)=>{ 
                        set({ classes :  e.target.value})
                    },
                    attrs: { placeholder : "bg-primary-500 bordered shadow . . ."}
                }),
                
            ]) 
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