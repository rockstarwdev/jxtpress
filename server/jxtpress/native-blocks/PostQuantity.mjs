export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
           
        }
        cp(instance, this)
    } 
    
    edit ({ el , get, set, query } ){     
        return el('serverside',{ 
                attrs: { id : get('element_id')},
            },
            el('inspector',{},
                 
            )
        );  
    }

    async render (core, { id, classes, iattrs,  esc , post_id , is_preview}){ 
        let add_classes = "spinner"
        var html = ` 
        <div ${id()} ${classes('PostQuantity '+add_classes)}  ${iattrs()}  post-id="${post_id}"   min="1" max="100" post-id="${post_id}">
            <input value="1" >
            <div class="controls"> 
                <button type="button" class="button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                    stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg> 
                </button>

                <button type="button" class="button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>
        </div>
        ` 
       
        return {
            html  
        }
    }
    style (){
        return ` 
            .block-instance.postquantity {
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