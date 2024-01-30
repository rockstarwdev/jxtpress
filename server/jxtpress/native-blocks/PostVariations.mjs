/**
 * Used for exposing the product variation options to the user in order for them to 
 * select the right options required before adding item to chart
 */
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
        let add_classes = " "
        var html = `
            <div class="PostVariations">
                <h4 class="title inline-block"><b>{</b> Post Variations <b>}</b></h4>
                <ul class="list-none variation-ui ">
                    <li class="list-none item button active"> option 1</li>
                    <li class="list-none item button "> option 3</li>
                    <li class="list-none item button "> option 2</li>
                </ul>
            </div>
        ` 
        if ( is_preview) return {html}
        html = `<div ${id()} ${classes('PostVariations ' + add_classes)} post-id="${post_id}"  ${iattrs()} >`
        var line = '';
        var metas = await core.pages.get_variations ( {post_id }), m  

        let gen_ui = ( m ) =>{
            if ( ! m ) return ""
            var is_choices = Array.isArray(m.value)
            var out = `<ul class="list-none m-0 p-0 variation-ui ${is_choices? 'choices':''}" data-m-name="${m.id}">`
            if ( ! is_choices ) {
                out += `<li class="list-none item"><input type="text" class="border border-solid border-gray-300" placeholder="${m.value }"></li>`
            }else {
                var item; 
                for(var j=0; j < m.value.length; j++){
                    item = m.value[j] 
                    out += `<li class="list-none item button user-select-none ${j==0? 'active':''}" value="${ item }">`+
                        `<span>${ item }</span>` +
                    `</li>`
                }
            }
            out += `</ul> <div class="inline-flex message color-red-500 ml-5"></div>`;
            return out 
        }
        for(var i =0; i < metas.length; i ++){
            m = metas[i];
            line = `<h4 class="title inline-block">${m.title }</h4>`
            line += gen_ui( m ) 
            html += `\t<div class="variation ${!Array.isArray(m.value) ? 'single' :''}" data-m-id="${m.id}" data-m-name="${m.name}">${line }</div>\n`
        }
        html += `</div><!-- post variations -->`
        return {
            html  
        }
    }
    style (){
        return ` 
          
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