/**
 * Block used for displaying items in the users's cart on site frontend.
 */
export default class {

    constructor(instance, { cp, chk} ){
        //instance.data IS "post" + instance block "data" merged together
        if ( instance ) {
          this.subtotal = chk(instance.data, 'subtotal', true )
          this.text = chk(instance.data,'text','')
        }
        cp(instance, this)
    }
    edit ( {el, set, get } ){
        return el('serverside',{

        }, 
        el('inspector', {},
            el('row', {label : 'Label', } ,
                el('string', {
                    value : get('text'),
                    onChange (e){
                        set({ text : e.target.value })
                    }
                })
            ),
            el('row', {label : 'Include Subtotal'},
                el('checkbox',{value : get('subtotal'), 
                    onChange(e){
                        set({ subtotal : e.target.checked })
                    }
                })
            )
        
        )); 
    }
    /**
     * 
     * @param {*} core 
     * @param {*} options { inner_html, inner_arr , post }  
     * @returns {String} HTML
     */
    async render (core,  { req, post_id, user_id, esc,id, classes, is_preview, block_type, iattrs  }){
        var html;
        var include_subtotal = this.subtotal 
        var label = '';
        if ( this.text){
            label = `<h3 class="cart-title mb-3 ${is_preview ?'inline-block' : ''}">${ this.text }</h3>`
        }
        var additional_classes =  ` ` 
        if ( is_preview ){
            var vtx =  `<b>{</b> Cart <b>}</b>` 
            var item_row = `
            <div class="flex gap-1 mb-1">
                <div class="column">
                    <div class="w-16 h-12 bg-gray-300 mb-2 rounded"></div>
                </div>
                <div class="column flex-1">
                    <div class="w-16 h-3 bg-gray-400 mb-2 rounded"></div>
                    <div class="w-3/4 h-3 bg-gray-200 mb-2 rounded"></div>
                    <div class="my-1"></div>
                    <div class="w-1/4 h-2 bg-gray-200 mb-2 rounded"></div>
                </div>
                <div class="column">
                    <div class="w-16 h-2 bg-gray-300 mb-2 rounded"></div>
                    <div class="w-10 h-1  bg-gray-200 mb-2 rounded"></div>
                    <div class="w-12 h-1 bg-gray-200 mb-2 rounded"></div>
                </div>
            </div>` ;
            var rows = ''
            for ( var i =0; i < 3; i++) rows += item_row 
            html =  `<div class="" style="min-height: 8em">` +
                `${label}  ${ vtx }${rows}`  +
            `</div>`

            if ( include_subtotal) {
                html += `
                
                <div class="flex justify-end gap-2 border border-solid border-gray-300 pt-3">
                    <div>Subtotal</div>
                    <div class="column">
                        <div class="w-16 h-2 bg-gray-300 mb-2 rounded"></div>
                        <div class="w-10 h-1  bg-gray-200 mb-2 rounded"></div>
                        <div class="w-12 h-1 bg-gray-200 mb-2 rounded"></div>
                    </div>
                </div> 
                `
            }
            return { html }
        }
        
        var cart_cookies;//array jwt strings
        if ( ! user_id )   cart_cookies = core.get_cookie(req.event, 'cart', [] );
     
        
        // Array of { title, type, status, linked__id,  value : Array { } }
        var cart =   await core.ecommerce.get_cart_items({ user_id, cart_cookies })
        console.log ("SAMMA ", post_id, cart , (await core.pages.get_post({ id : post_id }))?.title, block_type )
        return { 
            html : ` <div>${JSON.stringify(cart)}</div>`
        }

        var item_html ='', cart_html = '', cart_item, cart_value 
        var price = null , product 

        var item_count = cart.length;
        if ( item_count == 0 ) {
            console.log ( "===================CART IS EMPTY===========================",user_id, cart )
        }else console.log ("----------OK Cart length ", item_count)
        var text_for = ""
        var varations_html ; 
        if ( item_count = 0 ) {
            return {
                html : `<div ${id()} ${classes("PostCart "+additional_classes) }> Empty Cart</div>`
            }
        }
        for ( var i=0; i < item_count; i++){
            console.log ("Cart Iteration<"+i+"> / "+ item_count)
            /*
            cart_item   = cart[i];                    //title, type, status, linked__id,  value
            cart_value  = cart_item.value[0] || null;// post_id, eid, quantity, cost, variations, type, action
            if ( ! cart_item ) { console.log ("skip00");continue }; 
            text_for = `${cart_value.post_id } x ${cart_value.quantity}`
            price = await core.ecommerce.get_pricing({ product_eid : cart_value.eid })
            if ( ! price ) {
                cart_html  += `<div class="color-red-500">Unable to locate pricing for ${text_for } </div>`
                console.log ("skip01");continue
            }
            product = await core.pages.get_post({ id : cart_value.post_id })
            if ( ! product ) {
                cart_html + `<div class="color-red-500">Unable to locate product for ${text_for } </div>`
                console.log ("skip02");continue
            }
            varations_html = '';
            text_for =`${product.title }`
            if( cart_value && typeof cart_value.variations == 'object'){
                varations_html = `\n     <ul class="variations my-2 list-style-none">\n`;
                var val ; 
                for ( var key in cart_value.variations ){
                    val = cart_value.variations[key]
                    varations_html += `       <li><em>${key}</em> : ${ val }</li>\n` 
                }
                varations_html += `     </ul>\n`
            }
            item_html = 
                `<div class="cart-item media" data-product-id="${cart_value.post_id}">\n`+
                `    <div class="image">\n`+
                `    </div>\n`+
                `    <div class="content">\n` +
                `        <h3 class="title">${text_for}</h3>\n` +
                `        <div class="brand-name mb-1">${await core.pages.get_meta_or_query({post: product, name : 'brand'})}</div>\n`+
                ` \n` +
                `        <div class="quantity-info">`+ 
                `        </div>\n`+
                `        ${varations_html}`+
                `    </div>`+
                `\n</div>\n\n`
            cart_html += item_html  */
            cart_html += "HI ; "
        }
        
        
        additional_classes += ' livexx '
        cart_html += item_html + " XXooXXOO " + cart.length + " vs O " + item_count
        html = `<div ${id()} ${classes("PostCart "+additional_classes) } ${iattrs()} >${cart_html }</div>`;
        console.log ("(**********)",html,"\n",cart )
        return { html }
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