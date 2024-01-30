export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
            this.use_subscript      = chk (instance.data, "use_subscript", false )
            /** the value to display to user */
            this.numeric_target       = chk (instance.data, "display_target", "amount" )
            this.price_font_size    = chk (instance.data,"price_font_size","")
            
        }
        
        cp(instance, this)
    }
    get_target_types () {
        return [
            { title : "Amount", value : "amount" },
            { title : "Base Price", value : "base_price" },
            { title : "Percentage Change", value : "percent_off" },
        ]
    }
    edit ({ el , get, set, query } ){     
        return el('serverside',{ 
                attrs: { id : get('element_id')},
            },
            el('inspector',{},
                el('label',{},'Template'),
                el('checkbox',{  
                    label : 'Use Subscript',
                    value : get('use_subscript'), 
                    onChange(e){
                        set({use_subscript : e.target.checked })
                    }
                }),
                el( "div",{classes:['flex','gap-2']}, 
                    el ( 'row', { label : "Display Target",
                    },
                        el('dropdown', { value : get("numeric_target"),
                            onChange(e){
                                set({ numeric_target  : e.detail.value })
                            },
                            values: this.get_target_types() 
                        })
                    ),
                    el('row',{label: 'Price Font Size',
                    },
                        el('duplex', { 
                            value : get('price_font_size'),
                            onChange(e){
                                set({ price_font_size : e.detail.value })
                            }
                        })
                    ),
                )
            )
        );  
    }

    async render (core, arg ){
        let { esc , id, classes ,  post_id , is_preview, iattrs  } = arg  
        var html = '';
        let prices = null; 

        if ( is_preview ) {
            prices = {
                eid : "price_xxxxx3323",
                base_price : 99.99,
                amount : 49.99,
                percent_change : -50, 
                metas : { 
                    model : 'standard',
                    count : 1,
                    freq : 'month',
                    type : 'one-time'
                }
            } 
        }else {
            
            prices = await core.ecommerce.get_pricing({ product_id : post_id })

            if ( ! prices || Array.isArray(prices) ) { 
                html = `<span class="no-price">No Pricing</span>`
                return {html };
            } 
        }
        var target_type = this.numeric_target; 

        var eid = prices.eid;               //
        var base_price = prices.base_price  // 
        var percent_change = prices.percent_change;
        var amount = prices.amount          // 
        var type = prices.metas?.type        // recurring / one-time
        var model = prices.metas?.model      // standard/package
        var count = prices.metas?.count      // frequencies count 
        var freq = prices.metas?.freq        // frequency-

        var currency = await core.get_option({name : 'stripe_currency', flat : true  })
        if ( !currency) currency = "USD";
        currency =currency.toLowerCase()

        let str_num = (x)=>{
            x = x.toString();
            if ( !x.includes('.')) x += ".00"
            return x; 
        }

        var post_symbol = ""
        var pre_symbol = await core.ecommerce.get_currency_symbol (currency);
        var num = amount;
        var a_cls = ""
        if ( target_type == 'amount'||target_type == 'current_price') {
            num= amount;
            num = str_num(num);
        }else if ( target_type == 'base_price' || target_type == 'base'){
            num = base_price
            num = str_num(num);
            a_cls = "strike color-gray-600"
        }else {//percent_off 
            pre_symbol = ""
            num = core.round( percent_change, 1)  
            if ( num < 0.0 ) a_cls += "color-red-500"
            if ( Math.abs(num) > 1.0) num = parseInt(num)
            post_symbol = "%"
        }
        
        if ( this.use_subscript) {
            num = num.split(".");
            num = `<span class="whole-number">${num[0]}</span><sup style="font-size:55%">${num[1]}</sup>`
        }
        var price = ` <span ${id()} ${classes( target_type + ' ' + a_cls)}  ${iattrs()} ` + 
        ` style="font-size: ${this.price_font_size}"><span>${pre_symbol}</span>${ num }<span>${post_symbol}</span></span>`
        
        if (is_preview ) price  = `<b>{</b>${price}<b>}</b>`
        html = `${ price}`
        if ( is_preview) {
            html = `${price }`
        }
        return {
            html  
        }
    }
    style (){
        return ` 
        .postprice {
            display: inline-block;
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