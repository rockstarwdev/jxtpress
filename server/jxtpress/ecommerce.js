import core from "./core"
import db from "./db"
import create_currencies from "./init_util/create_currencies"
import pages from "./pages"
import plugin from "./plugin"
import users from "./users"
import Stripe from "stripe"


class ECommerce {
    _stripe = null ;
    stripe_cache_get_stripe_last_time =null; 
    stripe_cache_get_products_last_time=null;
    async _init (options){

    }  
    async get_currency_symbol(currency){
        var def = "$!"
        if ( ! currency ) return def; 
        currency = currency.toLowerCase()
        /**
         * Provide opportunity for plugins to add to the default list of currency to symbol list
         */
        var list = await plugin.run_filter('currency_to_symbol_list', [
            { currency : 'usd' , symbol : '$'},
            { currency : 'uyu' , symbol : '$U'},
            { currency : 'uzs' , symbol : 'лв'},
            { currency : 'VEF' , symbol : 'Bs'},
            { currency : 'usd' , symbol : '$'},
            { currency : 'yer' , symbol : '﷼'},
            { currency : 'zwd' , symbol : 'Z$'},
            { currency : 'gbp' , symbol : '£'},
            { currency : 'uah' , symbol : '₴'},
            { currency : 'thb' , symbol : '฿'},
            { currency : 'zar' , symbol : 'R'},
            { currency : 'rub' , symbol : '₽'},
            { currency : 'ngn' , symbol : '₦'},
            { currency : 'yen' , symbol : '¥'},
            { currency : 'jmd' , symbol : 'J$'},
            { currency : 'egp' , symbol : '£'},
            { currency : 'mxn' , symbol : '$'},
            { currency : 'cad' , symbol : '$'},
            { currency : 'bgn' , symbol : 'лв'},
            { currency : 'bwp' , symbol : 'P'},
        ])

        var currency_convert = list.find( it => it.currency == currency);
        if ( ! currency_convert) return def; 
        return currency_convert.symbol
    }

    /**
     * Combine two array of meta properties and if duplicates exist, the @meta_data1 will be valued as the new value
     * @param {Array} meta_data0 First Array of meta objects
     * @param {Array} meta_data1 Second array of meta object
     * @returns {Array}
     */
    merge_metas (meta_data0, meta_data1){
        var out = [  ... (meta_data0 || [] ) ]
        var cur ;
        for (var i=0; Array.isArray(meta_data1) && i < meta_data1.length; i++){
            cur = out.find ( it => it.name == meta_data1[i].name )
            if ( cur ){
                cur.value = meta_data1.value 
            }
        }
        return out 
    }

    /**
     * Take stripe prices and localize to our system
     * @param {Array} stripe_prices Array of Stripe Prices to localize  
     *          // Array of { id, object:'price', active:Bool, billing_scheme: 'per_unit', created, currency: 'usd'
     *                 custom_unit_amount : null, livemode:Bool, lookup_key:null, metadata:{}, nickname : "your text",
     *                 product: <String or Object if expanded>, recurring : { aggregate_usage: null,
     *                 interval: 'week', interval_count : 1, trial_period_days : null, usage_type : 'licensed'
     *                 }, tax_behavior : null, transform_quantity : null, tiers_mode : null, transform_quantity,
     *                 type:'recurring|one_time', unit_amount: 3300 } 
     * @param {Array} local_prices Array of existing local prices
     */
    async sync_price_to_local( stripe_prices, local_prices  ){
        var stripe_price 
        var local_price
        var prices_to_update =[]
        var vC, vF, vT,vUT,aux, status, amount,vType, vcMin, vcMax,vcPreset, vBillScheme, vModel
        var make_price_metas = null;  
        var metas_to_update = [] 
        var metas_to_create = []
        for(var i =0; i < stripe_prices.length ; i++) {
            stripe_price = stripe_prices [ i ]
            local_price = local_prices.find ( lprice => lprice.eid == stripe_price.id ) 

            //stripe_price.custom_unit_amount 
            vC =stripe_price.recurring?.interval_count ||null 
            vF = stripe_price.recurring?.interval || null 
            vT = stripe_price.recurring?.trial_period_days || null //measured in days
            vUT= stripe_price.recurring?.usage_type || null 
            vBillScheme = stripe_price.billing_scheme || null 
       
            vType =   stripe_price.type == 'one_time' ? 'one-time' :'recurring'
            vModel= stripe_price.custom_unit_amount ? 'custom' : stripe_price.transform_quantity ? 'package' : 'standard'
            vcMin=null;vcMax=null; vcPreset=null 
            if ( stripe_price.custom_unit_amount){
                vcMin = stripe_price.custom_unit_amount.minimum ? stripe_price.custom_unit_amount.minimum /100.00 : null 
                vcMax = stripe_price.custom_unit_amount.maximum ? stripe_price.custom_unit_amount.maximum /100.00 : null 
                vcPreset = stripe_price.custom_unit_amount.preset ? stripe_price.custom_unit_amount.preset /100.00 : null  
            }
            
            make_price_metas  = (post_id = undefined, eid = undefined)=> { 
                var ms = [] 
                ms.push({name : "model" ,       value: vModel       , post_id,  eid})
                ms.push({name : "type",         value: vType        , post_id,  eid})
                ms.push({name : "billing",      value: vBillScheme  , post_id,  eid})
                ms.push({name : "count",        value: vC           , post_id,  eid})
                ms.push({name : "freq",         value: vF           , post_id,  eid})
                ms.push({name : "trial",        value: vT           , post_id,  eid})
                ms.push({name : "use",          value: vUT          , post_id,  eid})
                ms.push({name : "cust_preset",  value: vcPreset     , post_id,  eid})
                ms.push({name : "cust_min",     value: vcMin        , post_id,  eid})
                ms.push({name : "cust_max",     value: vcMax        , post_id,  eid})
                return ms
            }

            //stripe_price.transform_quantity = { divide_by: 3, round: 'up' }
            aux = `model=${vModel};type=${vType};billing=${vBillScheme};count=${vC};freq=${vF};trial=${vT};use=${vUT};cust_preset=${vcPreset};cust_min=${vcMin};cust_max=${vcMax}`
            status =  stripe_price.active ? 'active' : 'archived'
            amount = stripe_price.unit_amount / 100.00 
            if ( ! local_price ) {//the stripe price does not yet exist locally
                local_price = {
                    status ,amount  , aux, 
                    eid         : stripe_price.id ,
                    linked_eid  : stripe_price.product ,
                    type        : "price",
                    title       : stripe_price.nickname, 
                }
                //create
                prices_to_update.push( local_price )
                metas_to_create.push( ... make_price_metas(undefined, stripe_price.id  ) )
            }else {
                local_price.status = status 
                local_price.title = stripe_price.nickname 
                local_price.amount = amount 
                local_price.linked_eid = stripe_price.product 
                local_price.aux = aux 
                //update 
                prices_to_update.push({ id : local_price.id , title : local_price.title, amount : local_price.amount ,
                 linked_eid : local_price.linked_eid ,aux  })

                 metas_to_update.push( ... make_price_metas(local_price.id ) )
            }
            local_price.metddas =  this.merge_metas(local_price.metas, core.to_metas( stripe_price.metadata )) 
        }
        await db.update('posts', prices_to_update )
        //For those metas without a post_id, find the post id and set it
        metas_to_create.forEach(meta =>{
            var lprice = prices_to_update.find ( it => it.eid == meta.eid )
            if (! lprice ) {
                core.log ("Strange . . . not finding the price to link to the meta", meta )
                return; 
            }
            meta.post_id = lprice.id; 
        })
        //then update all meta properties in one go 
        await pages.update_meta( [ ... metas_to_create , ... metas_to_update ] )
    }
    /**
     * 
     * @param {Object} metadata Stripe metadata (key value pairing) to be converted to array of { name , value }
     * @param {Object }  { eid : external id , local_id : local id }
     * @returns 
     */
    async stripe_metas_to_local( metadata, options = {} )  {
        var local_id = options.local_id
        var eid = options.eid 
        if ( ! metadata) return [] 
        var out = [], obj 
        for(var key in metadata){
            out.push(  { name : 'stripe_'+ key, value : metadata[key], post_id : local_id, eid  }  )
        }
        
        return out 
    }
    async sync_product_to_local(stripe_products, local_prods){
        var tbposts =`${db.name}.posts`
        var auto_sync = core.type_bool( await core.get_option({ name : "stripe_auto_sync" ,  flat: true}))
        //List of stripe products(obj) that are not yet found on our local system that needs to be added                
        let stripe_prods_obj_to_add_to_local =[];
        let find_local_prod = ( stripe_prod_obj )=>{ //utility finder
            return local_prods.find( local => local.eid == stripe_prod_obj.id ) || null 
        }
        let stripe_status_to_local_status = (stripe_prod_obj) =>{
            var status=  stripe_prod_obj.active ? "active" : "archived"
            return status 
        } 
        let stripe_prod, local_prod 
        let local_metas_to_update = []
        let local_metas_to_create = [] 
        //Loop stripe products and this time each if the stripe products is on our local system, if not
        //add to "add list"
        //See if we already have the product locally
        for( var i =0 ; i < stripe_products.length; i++){
            stripe_prod = stripe_products[i] 
            local_prod = find_local_prod ( stripe_prod );

            if ( ! local_prod ) {
                //Product does not already exist
                stripe_prods_obj_to_add_to_local.push ( stripe_prod )
                local_metas_to_create.push( ... await this.stripe_metas_to_local(stripe_prod.metadata, { eid : stripe_prod.id }) )
            }else { 
                //Update:  Keep in sync with Stripe
                if ( auto_sync ) { 
                    local_prod.type         = "product"
                    local_prod.title        = stripe_prod.name 
                    local_prod.description  = stripe_prod.description 
                    local_prod.status       = stripe_status_to_local_status(stripe_prod)
                    
                    local_metas_to_update.push( ... await this.stripe_metas_to_local(stripe_prod.metadata,
                         { eid : stripe_prod.id, local_id : local_prod.id }) )
                    local_prod.eid          = stripe_prod.eid
                    // async update
                    db.update('posts',{ 
                        id : local_prod.id ,  
                        title : stripe_prod.name ,  
                        description : stripe_prod.description ,
                        amount : local_prod.amount, 
                        status : local_prod.status 
                    })

                }
            } 
        }
        //Now we need to create any new local versions of stripe_prods_to_add_to_local that are not yet 
        // on our local system
        let new_local_prods = []
        for ( var i=0; i < stripe_prods_obj_to_add_to_local.length; i++){
            stripe_prod = stripe_prods_obj_to_add_to_local[i];

            local_prod   = {
                title : stripe_prod.name  ,
                description : stripe_prod.description, 
                eid : stripe_prod.id , 
                type: "product", status : stripe_status_to_local_status(stripe_prod)  ,
                amount : null 
            }
 
            new_local_prods.push( local_prod )
        } 
        if ( new_local_prods.length > 0) await db.update('posts',new_local_prods)

        if ( auto_sync) {
            //for new products, set its meta post_id to the newly retrieved id
            for ( var i = 0; i < new_local_prods.length;i++){
                local_prod = new_local_prods[i];
                for(var j=0; j < local_metas_to_create.length; i++){
                    if ( local_metas_to_create[i].eid == local_prod.eid ){
                        local_metas_to_create[i].post_id = local_prod.id; 
                    }
                }
            }
            local_metas_to_update.push( ... local_metas_to_create );
            pages.update_meta(local_metas_to_update);//update these
        }
        
    }
    
    /**
     * Get a handle to the stripe programming interface
     * @returns {Object} Stripe API Interface
     */
    async get_stripe(){  
        let use_cache = core.use_cache({ obj: this, key_name: "stripe_cache_get_stripe_last_time",  elapse : 2 })
        if ( ! use_cache ) { 
            var secret_key = await core.get_option({ name : "stripe_secret_key_secret", flat : true } )
            if ( ! secret_key ) core.throw("eCommerce - stripe secret key is null or uninitialized")

            this._stripe = Stripe( secret_key );
        } 
        return this._stripe
    }
    
    /**
     * Get all products that exist on the store. Based on site options, auto import and syncs with external API.
     * @param {Object} options parameters when searching for products
     * @returns {Array} Products
     */
    async get_products(options ){
        if (! options) options = {}
        var tbposts =`${db.name}.posts`
        var limit = await core.get_option({ name : "page_limit", flat: true}) || 25;
        /* auto import(true) means to continuously import all products from stripe into your local database
           whereas false means to have a one way create and edit of products and send updates to stripe
          */
        var auto_import = core.type_bool( await core.get_option({ name : "stripe_auto_import_products" ,  flat: true}))
        
        let stripe = await this.get_stripe();


        let local_prod; 
        try{ 
            
            let use_cache_get_products = core.use_cache({ obj: this,
                 key_name: "stripe_cache_get_products_last_time",  elapse : 2 })

            if ( auto_import /* && use_cache_get_products */) { 
                // Since auto-import means we need to always pull down stripe list of products and prices,

                // Get all products from stripe
                let stripe_products             = []; //holds list of stripe products, if they exist 
                var stripe_prod_ids_to_find     = []  
                let stripe_prod
                for await ( stripe_prod of  stripe.products.list({   limit   }) ) {// {object: 'list', data : [...], has_more :Boolean, url}
                    //Array of { id : 'prod_...', object: 'product', active: Bool, attributes :[], caption: null,
                    //  created|updated : x1000, deactivation_on :[], default_price : null or 'price_...',
                    //  description, features : [], images: [ string url], livemode : Bool,
                    //  metadata : {Object}, name, package_dimensions, skippable:Bool, tax_code :null, type:'good', url
                    //}  
                        stripe_products .push(stripe_prod )
                        stripe_prod.price_lists = [] 
                        stripe_prod_ids_to_find.push(  `"${stripe_prod.id}"` )
                    
                }
                
                var stripe_price;  
                var stripe_prices = []
                var stripe_price_ids_to_find = []
                for await (stripe_price of  stripe.prices.list({ limit  /*, expand : ['data.product']*/ }) ){
                    
                    stripe_prices.push( stripe_price)
                    stripe_prod = stripe_products.find ( prod => prod.id == stripe_price.product )
                    if ( stripe_prod ){
                        stripe_prod.price_lists.push( stripe_price )
                    } 
                    stripe_price_ids_to_find.push( `"${stripe_price.id}"` ); 
                }
                // use post external IDs to grab local prices that match what stripe gave us
                var sql = `SELECT * FROM ${tbposts} WHERE type='price' AND eid in (${stripe_price_ids_to_find.join(",")})`
                var local_prices = await db.query(sql);
                await this.sync_price_to_local( stripe_prices, local_prices )


                //use post external IDs to make grab our local products that match what stripe gave us
                sql = `SELECT * FROM ${tbposts} WHERE type='product' AND eid in (${stripe_prod_ids_to_find.join(",")})`
                var local_prods = await db.query(sql);
                await this.sync_product_to_local( stripe_products, local_prods)
            }
        }catch(err){
            this.hnd_stripe_error("get_products",err); 
        }

        let local_products = await pages.get_posts({ ... options, type : 'product' });
        
        //loop the local products to see IF THE STILL exist on stripe

        return local_products
    }
    /**
     * Check the local database for the existance of product id or product eid.  If not found, return nothing.
     * Otherwise, fetch all prices 
     * @param {Object } options { product_id|eid : local or external product id }
     * @return {Object } An object {id,eid,amount,status, percent_change : relative to base price,
     *  metas: {billing, count, freq, cust_max,cust_min, cust_preset, model, trial,type, use }, 
     * price_list : Array of all other prices } representing the default price
     */
    async get_pricing( options ) {
        var tbpost = `${db.name}.posts`
        var where =  [ ], sql = ``, ret 
        let product_eid = options.product_eid 
        let product_id = options.product_id 
        let base_price = null 

        // based on wether product id or product_eid was provided, get all the product info
        if ( options.product_id ) { 
            where.push(`id IN (SELECT id FROM ${tbpost} WHERE ${db.is('id',options.product_id )}) `)
            sql = `SELECT eid, amount FROM ${tbpost} WHERE ${where.join(' AND ')}`
            ret = await db.query(sql)
            product_eid = ret[0].eid; 
            base_price = core.type_number(  ret[0].amount )
        }else if ( options.product_eid) {
            ret = await db.query(`SELECT id, amount FROM ${tbpost} WHERE ${db.like('eid', options.product_eid)}`)
            product_id = ret[0].id ;
            base_price = core.type_number( ret[0].amount  )
        } 
        //we need product_eid in order to quickly get all prices that are linked to the product eid
        if ( ! product_eid ) return null  
        var cols = `id, status, title, amount, eid, linked_eid`
        var prices = await db.query(`SELECT ${cols} FROM ${tbpost} WHERE ${db.like('linked_eid', product_eid)}`)
        if ( prices.length == 0 ) return null  
  
        
        //Get the price that is set as default price , but if none was set default price
        // will be set the the first price we come to
        var default_price_eid = await pages.get_meta({ post_id : product_id,  name : "default_price", flat:true })
        var the_default_price = null; 
        let active_status = ['active','published']
        if ( base_price == 0 ) base_price =1.0
        var one_over_base_price = 1.0 / base_price;
        
        //loop each price and  get its basic infos
        await core.for_each( prices, async (p, i)=>{
            if ( p.amount) p.amount = core.type_number(p.amount)
            //Convert an Array of { name, value} to key value pairs
            p.metas = core.to_object(  await  pages.get_metas({ post_id : p.id }) )
            p.is_default = p.eid == default_price_eid 
            p.percent_change = core.round (  ( base_price -  p.amount ) * (one_over_base_price) )
            if ( p.is_default && active_status.includes[p.status]) the_default_price = p;
        }) 
        //if a default price was not set, set the latest one to be "default"
        if ( ! the_default_price ) { 
            //the most current active price
            for(var i =prices.length -1 ; i > -1; i--){
                if ( active_status.includes(prices[i].status ) ) { 
                    the_default_price = prices[i];
                    break; 
                }
            }  
        }
  
        if ( ! the_default_price ) {
            core.error(`No default price for product ${product_eid}//${product_id}`,{product_eid, product_id})
            return null
        }
        /**
         * The pricing list for product is being returned.  Data includes {
         * product_id, product_eid, base_price, price_list, 
         * id : price id , status : price status, title, amount , eid, linked_eid
         * }
         */
        var output = await plugin.run_filter('get_pricing', {
            product_id, product_eid, 
            base_price , 
            ... the_default_price, 
            price_list : prices 
        }) 
        return output  
    }

    async hnd_stripe_error( during_function=null, err){
        core.error(`eCommerce(${during_function}) - stripe error`, err.type, "=>", err.message,err )
        switch (err.type) {
            case 'StripeCardError':  // A declined card error
                err.message; // => e.g. "Your card's expiration year is invalid."
                break;
            case 'StripeRateLimitError':  // Too many requests made to the API too quickly
                break;
            case 'StripeInvalidRequestError':  // Invalid parameters were supplied to Stripe's API
                break;
            case 'StripeAPIError':   // An error occurred internally with Stripe's API
                break;
            case 'StripeConnectionError': // Some kind of error occurred during the HTTPS communication
                break;
            case 'StripeAuthenticationError': // You probably used an incorrect API key
                break;
            default:  // Handle any other types of unexpected errors
                break;
        }
    }
    /**
     * Get known currency types 
     * @returns {Array} Get known currency types
     */
    async get_currencies(){ 
        /**
         * Process opportunity to modify currency list. Data is an array of { title, value}
         * prepresenting supported currencies.
         */
        var currencies = await plugin.run_filter('get_currencies', create_currencies() )
        return currencies
    }
    async update (post) {
        if ( ! post ) return null; 
        var type = post.type ; 
        switch(type) {
            case 'product': return await this._update_product(post);
            case 'price': return await this._update_price(post); 
            default:
                core.error(`Invalid ecommerce update for type ${type}`)
                return null 
        }
    }
    /**
     * Given a post with list of meta properties, find all meta properties that are 
     * intended(prefixed with "stripe_") to be shared with stripe.  Each meta property is then striped
     * of the prefix and returned as a flat key object pairing to be shared with stripe
     * @param {Object} post the post object whose meta that are stripe specific need to be identified
     * @returns 
     */
    async local_metas_to_stripe_metadata (post){ 
        let metadata = undefined 
        if (Array.isArray(post.metas)) {
            metadata = {}
            var name = "";
            for(var i =0;  i< post.metas.length; i++){
                name = post.metas[i].name;
                if ( ! name ) continue; 
                if ( name.startsWith("stripe_")) {
                    metadata[name.substring(7)] = core.type_string ( post.metas[i].value )
                }
            } 
        }
        return metadata
    }
    /**
     * Update products locally and with External Stripe API
     * @param {Object} post local version of our product
     */
    async _update_product(post){
        let stripe = await this.get_stripe()
 
        let tax_code = await pages.get_meta_or_query( { post, name : 'tax_code' }); 
        let statement_descriptor = await pages.get_meta_or_query({ post, name : 'statement_descriptor'} ); 
        if ( statement_descriptor ) {
            if (statement_descriptor.length <= 2) statement_descriptor = null 
        }
        let shippable = await core.type_bool(  await pages.get_meta_or_query({ post, name : 'shippable' } ) )
        let images = await pages.get_meta_or_query({ post,name : "images_arritem"} ) || []

        let metadata = await this.local_metas_to_stripe_metadata(post)

        let stripe_prod = {
            name : post.title ,
            description : post.description, 
            active : ['active','published'].includes (post.status ) ? true : false ,
            features : [], //upto 15 feature - these are displayed in pricing tables.
            images ,// up to 8 URLs of images 
            // package_dimensions: { },//height, length, weight, width - in inches
            shippable ,//indicate if the product is physical or virtual
            statement_descriptor : statement_descriptor , //if type is "service" - specify any text to be display on credit card statement,
            tax_code , //see - https://stripe.com/docs/tax/tax-codes - ie txcd_10103000 (SaaS)
            url : post.url ,
            metadata,
            default_price : await pages.get_meta_or_query({post , name : "default_price"})
        }
        var res; 
        if ( ! post.eid ) {
            try { 
                res = await stripe.products.create( stripe_prod );
                post.eid = res.id ; 
                db.update('posts', { id : post.id , eid : post.eid  })
            }catch(e) { this.hnd_stripe_error('update_product:create',e)}
        }else {
            try  {  
                res = await stripe.products.update( post.eid, stripe_prod  ); 
            }catch(e) { this.hnd_stripe_error('update_product:update',e)}
        }
    }
    /**
     * Get All properties
     * @param {Object} post local version of the price object
     */
    async _update_price(post){ 
        let stripe = await this.get_stripe()
        let currency    = (await core.get_option({ name : 'stripe_currency' , flat : true }) || "usd").toLowerCase()
        let model       = await pages.get_meta_or_query({ post, name : "model "} ) //standard, custom, package 
        let type        = await pages.get_meta_or_query({ post, name : 'type'})     //recurring, one-time
        let billing     = await pages.get_meta_or_query({ post, name : 'billing'})||"per_unit"  //per_unit, tiered
        let count       = await pages.get_meta_or_query({ post, name : 'count'})
        let freq        = await pages.get_meta_or_query({ post, name : 'freq'})     // day, week, month or year
        let trial       = await pages.get_meta_or_query({ post, name : 'trial'})    
        let use_        = await pages.get_meta_or_query({ post, name : 'use'})      //license
        let cust_preset = await pages.get_meta_or_query({ post, name : 'cust_preset'})
        let cust_min    = await pages.get_meta_or_query({ post, name : 'cust_min'})
        let cust_max    = await pages.get_meta_or_query({ post, name : 'cust_max'})

        let lookup_key = undefined
        let unit_amount = post.amount * 100 // convert to whole number only
        let custom_unit_amount = undefined;
        if ( model == 'custom') {
            unit_amount = undefined
            custom_unit_amount = {
                enabled : true ,
                minimum : cust_min,
                preset : cust_preset,
                maximum : cust_max,
            }
        }

        let recurring = undefined;
        if ( type == 'recurring'){
            recurring = {
                interval        : freq  ,
                interval_count  : count , 
                aggregate_usage : null, // sum, max, last_ever, last_during_period
                usage_type      : use_ ,
                trial_period_days : trial
            }
        }

        //meta data is a key value pair
        let metadata = await this.local_metas_to_stripe_metadata(post)
        let stripe_price = { 
            currency ,
            active : ['active','published'].includes(post.status ),
            nickname : post.title , 
            metadata,
            product : post.linked_eid, 
            recurring,
            unit_amount ,
            billing_scheme : billing,
            custom_unit_amount,
            lookup_key
        };
        let stripe_res_obj 
        if ( !post.eid ) {
            try {
                stripe_res_obj = await  stripe.prices.create( stripe_price  );
                // Now that we have the price we need to  save the eid to the post
                post.eid = stripe_res_obj.id;
                await db.update('posts', { id : post.id , eid : post.eid })

            }catch(e) { this.hnd_stripe_error('update_price:create', e)}
           
        }else {
            try{ 
                //delete properties are deleted such to avoid strip from throwing an error
                delete stripe_price.billing_scheme
                delete stripe_price.unit_amount 
                delete stripe_price.product 
                delete stripe_price.currency 
                delete stripe_price.recurring
                stripe_res_obj = await stripe.prices.update( post.eid , stripe_price  ); 
            }catch(e) { this.hnd_stripe_error('update_price:update', e)}
        }
        
    }

    /**
     * 
     * @param {Object} options {
     * user_id , 
     * cart_cookies : optional - array of jwt representating cart items IF the user is not logged in
     * }
     */
    async get_cart_items (options){
        if ( ! options ) return [] 
        var all_cart_items = null 
        
        //When the user id is not available, create a JWT representing new item added
        if ( ! options.user_id ) { 
            
            all_cart_items = [  ]
            var item = null 
            if( Array.isArray(options.cart_cookies) ) {
                for(var i =0; i < options.cart_cookies.length; i++){
                    //un-sign the JWT to get back the objects
                    // back to { post_id :Product, quantity,cost,variations, type, action }
                    // TODO: write function to returns the default price for a product
                    // TODO: get current price and inventory level then update quanity/cost
                    item =  core.jwt_verify(options.cart_cookies[i])
                    //use this opportunity to update the cost && check quanity capacity
                    //
                    all_cart_items.push( item  )
                }
            } 
        }else {
            all_cart_items = await pages.get_posts({ type : '_cartitem', created_by: options.user_id })
        }
        return all_cart_items
    }
    /**
     * 
     * We need to add items to cart (action=add_to_cart), subscribe(action=subscribe), or buy_now 
     * @param {Object}  options { 
     *      user_id, post_id, action : subscribe|buy_now|add_to_cart, 
     *      quantity, variations: optional,
     *      cart_cookies : optional - array of jwt representating cart items IF the user is not logged in
     *  }
     * @returns {Object} { 
     *  new_item_jwt : only set if user_id was not created , 
     *  items : Array of items added to cart {title,created_by, type,status, linked_id, value:[] }
     * }
     */
    async cart_action (options){
        if ( ! options ) return null; 
        if ( ! options.action) return null; 
        if ( ! ['buy_now','subscribe','add_to_cart'].includes(options.action)) return null 

        // Get the local product - fully { metas, tags, value }
        var post;
        if ( ! options.post_id ) core.throw("post_id is required");
        post = await pages.get_post({ id : options.post_id  })
        if ( ! post ) core.throw (`post_id(${options.post_id}) does not exist`);
        //Add in the products externail id 
        options.eid = post.eid;
    
        var default_price = await pages.get_meta_or_query({post , name : 'default_price'})
        if ( ! default_price ) core.throw (`post(${options.post_id}) does not have default price`)
        var inventory = await pages.get_meta_or_query({ post , name : 'inventory' })
        var is_subscription = await pages.get_meta_or_query({ post , name :'subscription'})
        var is_shippable = await pages.get_meta_or_query({ post , name :'shippable'})

        var new_inventory = inventory - options.quantity
        if ( new_inventory < 0) 
            core.throw(`post(${post.id}) will be out of stock if added`, {post_id:post.id,err: 'out_of_stock'});

        //metas: type,billing, count,cust_max,cust_min, cust_preset, freq, model:standard|package,trial,use
        var price = await pages.get_post({eid : default_price })

        if ( ! price ) core.throw(`post(${post.id}) unable to locate price ${default_price}`, {post_id:post.id, err: 'default_price_not_found'})
        var new_cart_item = { 
            title : 'cart item/user ' + (options.user_id ? options.user_id : 'null'),
            created_by : options?.user_id,
            type : '_cartitem',
            status : 'active',
            linked_id : post.id, 
            value : [{  
                post_id : post.id ,
                eid : post.eid , 
                quantity : options.quantity,
                cost : price.amount ,
                variations : options.variations ,
                user_id : options.user_id ,
                type : 'cartitem',
                action  : options.action 
            }]
        }

        var out = {};
        var all_cart_items = await this.get_cart_items(options) 

        //When the user id is not available, create a JWT representing new item added
        if ( ! options.user_id ) { 
            out.new_item_jwt = core.jwt_create( new_cart_item ); 
            //Add this new token to the cart cookies for local storgae
            if( ! options.cart_cookies ) options.cart_cookies = []
            options.cart_cookies.push( out.new_item_jwt )
             
        }else {
            //store to database 
            //new_cart_item = await pages.update_post(new_cart_item)
        }
        all_cart_items.push( new_cart_item)
        if ( ! options.user_id ) {
            //make sure to return back to frontend the cookies cart items
           out.cart_cookies = options.cart_cookies 
        }

        out.items = all_cart_items   
        return out 
    }
}
let ecommerce = new ECommerce()
export default ecommerce 