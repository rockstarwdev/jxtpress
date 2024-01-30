export default class {

    constructor(instance, {cp, chk} ){
 
        if ( instance && instance.data ) {
            this.css = chk(instance.data, "css", "") 
        }
        cp(instance, cp)
    }
    edit ( { el, set, get, block_id , debounce }){
        return  el('div',{}, 
                    el('style',{
                            attrs : { id : 'style-'+block_id },
                            innerHTML : get('css')
                    }),
                    el('inspector',{ priority: -50 },[
                        
                        el('label',{innerHTML: "Block CSS"  }, []),
                        el('text',{   value : get("css") , classes:['block-css'], style :{minHeight:'96px'} ,
                            placeholder : "Custom CSS for this and other elements in the document",
                            on_input : (e)=>{ 
                                set({ css :  e.target.value})
                                var existing_style = document.querySelector("#style-"+block_id );
                                if ( existing_style) existing_style.remove();

                                var new_style = document.createElement("style");
                                new_style.id = "style-"+block_id;
                                new_style.innerHTML = e.target.value;
                                document.body.appendChild(new_style)
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