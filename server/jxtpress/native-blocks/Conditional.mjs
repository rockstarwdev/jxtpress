/**
 * Creates a block system that allows us conditionally show a block's content or hide the blocks content.
 * This blocks allows user to set multiple conditions that all must evaluate as true in order for the content(s) 
 * of the conditional block to be visible or not.  If the block is evaluated to hide the contents, user can
 * specify what to show as an alternative(if anything) instead of simply just showing nothing.
 */
export default class  {
    constructor(instance, {cp, chk}){ 
       
        if ( instance){

            this.conditions = chk(instance.data, "conditions",  [])
            this.on_hide_action = chk(instance.data,"on_hide_action", "hide") //one of [ hide,show_html, embed_post  ]
            this.on_hide_value  = chk(instance.data,"on_hide_value",null)   //the HTML or the post_id to show
            this.tagless        = chk(instance.data,"tagless",false)
            this.label          = chk(instance.data, "label", "")
            this.alt_html       = chk(instance.data, "alt_html","")//an alternative HTML to show when conditions fail
            this.color_code     = chk(instance.data, "color_code", "")
            //items will be of 
            // { cond_type, cond_operator, cond_operand}
        }
        cp(instance,this);
    }
    get_color_codes() {
        return [
            { title : "Yellow", value : "#ffff003b"},
            { title : "Blue", value : "#0000ff30"},
            { title : "Orange", value : "#ffa50038"},
            { title : "Cyan", value : "#00ffff14"},
            { title : "Gray", value : "#d3d3d345"},
            { title : "Pink", value : "#ffc0cb75"},
            { title : 'Green', value : '#3dce7175'}
        ]
    }
    get_on_hide_values(){
        return [ 
            { title : "Hide", value : "hide"},
            //{ title : "Embed Post", value : "embed_post"},
            { title : "Show HTML", value : "show_html"},
        ]
    }
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ( {  el , set,    get , query, util }) { 
        try { 
        let self = this; 
        let on_click_add = (e)=>{
            var bt = e.target;
            var val = get('conditions')|| []
            if ( !Array.isArray(val)) val = [] 

            val.push( this.create_new_item () )
            set({ conditions : val  })
            
            setTimeout(()=>{
                //Trigger
                util.trigger('blur',bt)
            }, 100)
        }
        let build_cond_ui = (cond, index)=>{
            if ( ! cond ) return null; 
            var cond_descriptor = this.get_condition_type_descriptor(cond.cond_type)
            var choices = this.get_condition_type_choices(cond.cond_type) ;
            //Create Default UI TEXT BOX
            var value_ui = null; 
            
            var cond_descriptor = self.get_condition_type_descriptor(cond.cond_type)
            var ui_dropdown = el('dropdown',{classes:['text-sm'],
                value : cond.cond_operand ? cond.cond_operand[0] || '' : '', 
                values : choices,
                onChange(e){

                    var conditions = get('conditions');
                    var val = e.detail.value ;
                    conditions[index].cond_operand = Array.isArray( val ) ?  val: [val] ;
                    set({ conditions })
                }
            })
            var ui_text =  el('text',{value : cond.cond_operand?.join(", ") || "",
                placeholder:"Seperate values with commas",
                attrs : { 'data-title' : cond_descriptor.description },
                onChange(e){

                    var conditions = get('conditions');
                    var text = e.target.value;
                    var arr = text.split(",");
                    for(var i=0; i < arr.length; i++){
                        arr[i] = arr[i].trim()
                    }
                    conditions[index].cond_operand = arr ;
                    set({ conditions })
                }
            });
            if ( cond.cond_type.endsWith('meta_value') || cond_descriptor.use_target_key ) {
                ui_text = [
                    el('string',{
                        value : cond.target_key,
                        attrs : { 'data-title' : 'Property Name'},
                        placeholder : 'Target key property',
                        onChange(e){
                            conditions[index].target_key = e.target.value  
                            set({ conditions })
                        }
                    }),
                    ui_text,
                ]
            }
            var is_lock_down = cond.cond_type == 'lockdown'
            var page_is_404 = cond.cond_type == '404_post'

            
            if ( choices) {
                value_ui = ui_dropdown
                if ( ['in','not_in'].includes( cond.cond_operator) ) {
                    value_ui = ui_text
                }
            }else{
                value_ui = ui_text
            }
            
            if (is_lock_down || page_is_404 ){
                value_ui = null 
            }
            return el('div',{classes:['condition-item', ],attrs : { id : get('element_id') } ,
                    style : { padding: '0.125em'}            
            }, el ('div',{classes:['flex','gap-2', 'px-2', 'cond-type-operator']},
                    el('div',{ classes:['button-wrap']},
                        
                        el('button',{   style : {alignSelf:'self-start'}, 
                            attrs:{ 'data-title' : "Double click to remove"},
                            onClick(e){
                                var ok_delete = e.target.classList.contains('delete');
                                if ( !ok_delete){ 
                                    e.target.classList.add('delete');
                                    setTimeout((bt)=>{
                                        e.target.classList.remove("delete")
                                    },750,e.target)
                                }else {  
                                    var conditions = get('conditions');
                                    conditions.splice(index,1);
                                    set({ conditions })
                                    setTimeout(()=>{
                                        util.trigger('blur',e.target);
                                    },75)
                                }
                            },
                            classes:['button','hover:bg-red-500','sm'], innerHTML: this.get_x_icon()
                        },),
                    ),
                    el('div',{classes:['row','cond-type'],},
                        el('div',{innerHTML: "Type", classes:['text-sm']},),
                        el('dropdown',{ classes:['text-sm'],value : cond.cond_type, values : this.get_condition_types() ,
                            attrs: { 'data-title': this.get_condition_type_tooltip(cond.cond_type) },
                            onChange(e){
                                try{ 
                                    var conditions = get('conditions');
                                    conditions[index].cond_type = e.detail.value ;

                                    var cond_type_list = self.get_condition_types();
                                    var found_descriptor = cond_type_list.find(it => it.value == conditions[index].cond_type);
                                    
                                    if ( found_descriptor ) { 
                                        //Always ensure that the operator is one of the choices of allowed operator
                                        var allowed = found_descriptor.allowed_operator 
                                        if ( Array.isArray(allowed) && !allowed.includes(  conditions[index].cond_type )){ 
                                            conditions[index].cond_operator  = allowed[0] ;
                                            console.warn("Updated Default Start operand to ", allowed[0],conditions)
                                        }
                                    }

                                    set({ conditions })
                                }catch(x){ console.error ("Conditional Block error", x )}
                            }
                        })
                    ),
                    is_lock_down || page_is_404 ? null: el('div',{classes:['row','cond-operator'],},
                        el('div',{innerHTML: "Operator", classes:['text-sm']},),
                        el('dropdown',{ classes:['text-sm'], value : cond.cond_operator, values : this.filter_operator(this.get_condition_operators(),cond.cond_type ),
                            onChange (e){
                                var conditions = get('conditions');
                                conditions[index].cond_operator = e.detail.value ;
                                
                                set({ conditions })
                            }
                        })
                    )
                ),//Condition Type & Operator

                el('div',{classes:['cond-values', 'flex','gap-2']}, 
                    el('div',{classes:['w-8']}),
                    el('div',{ classes:[ 'flex-1']}, 
                        value_ui
                    )//END of row
                )//condition values
            )
        }
        var ui_arr = [];
        var conditions = get('conditions') || [];
        for(var i=0; i< conditions.length; i++){
            ui_arr.push( build_cond_ui ( conditions[i],i ))
        }
        var has_conditions = conditions.length > 0;

        return el ( 
            'div'    ,{ classes : [ 'relative', 'p-3','codition-body'],
                style :{ 
                    boxShadow : has_conditions ?     "0px 0px 1px 0px rgba(0,0,0,0.25)": "",
                    borderRadius: '2px',
                    border: '1px solid var(--yellow-500)',
                 backgroundColor :  get('color_code')}
            },
            el ('div',{classes: ['absolute'], style: {right: '5px', top : '5px'}},

                el('span',{innerHTML: this.get_sparkle_icon() ,classes:['sparkle' ], 
                style:{ color: has_conditions ? 'var(--yellow-500)' : '' ,
                   
                 }})
            )  ,
            el('div',{classes: ['label-before','display-label', 'flex', 'justify-start', 'w-full', 'absolute', 'user-select-none'], 
                    style : {   left : '10px', top : '1px'  }
                },
                el('div',{classes: ['color-yellow-600', 'font-extrabold','text-sm']}, get('label'))
            ),
            el('slot',{
                style :{   borderRadius:'4px' },
            }),
            el('div',{classes: ['label-after','display-label','flex', 'justify-end', 'w-full', 'absolute', 'user-select-none'], 
                    style : {   right : '10px', bottom : '4px'  }
                },
                el('div',{classes: ['color-yellow-600','font-extrabold','text-sm']}, get('label'))
            ),
            el('inspector',{classes:['mb-4']},

                el('row',{ classes: ['flex', 'gap-2']},
                    el('checkbox',{classes:['sm'],
                        label : "Tagless",
                        attrs : { 'data-title': 'No HTML wrapper'}, 
                        onChange(e){
                            set({ tagless: e.target.value })
                        }
                    }, get('tagless') ),
                    el('string', { placeholder : 'Condition Label',  
                        onInput ( e) {
                            var value = e.target.value 
                            var dis_lbls = query(".edit-controls").querySelectorAll(".display-label")
                            dis_lbls.forEach( node => {
                                dis_lbls.innerText = value 
                            })  
                        },
                        onChange ( e) {
                            var value = e.target.value 
                            var dis_lbls = query(".edit-controls").querySelectorAll(".display-label")
                            dis_lbls.forEach( node =>{
                                dis_lbls.innerText = value 
                            }) 
                            set({label : value  })
                        }
                    },get('label')||"" )
                ),
                el('row', {label: "Color Code"},
                    el('dropdown', {
                        value : get('color_code'),
                        values : this.get_color_codes(),
                        html (it ) {
                            return `<span class="inline-block w-4 h-4" style="background-color: ${it.value}"></span> <span>${it.title}</span>`
                        },
                        onChange(e){
                            var target = query('.edit-controls');
                            let color_code = e.detail.value 
                            target.style.backgroundColor = color_code
                            set({ color_code })
                        }
                    })
                ),
                el('div', {classes:['row','flex', 'items-center']} ,
                    el('button',{ attrs:{type:'button'} , innerHTML: this.get_plus_icon() ,onClick :on_click_add}, ),
                    el('span',{classes:['ml-2'] }, "Condition(s)"),

                ),
                el('div',{classes: ['text-sm','pl-4']}, "Show when"),
                ... ui_arr,
                el('div',{ classes:['pl-4','on-hide-ui']},
                    el('label',{style:{opacity: 0.6}, classes:['text-sm']}, 'When false'),
                    el('dropdown', {value : get('on_hide_action'), values : this.get_on_hide_values () ,
                        onChange(e){
                            set({on_hide_action : e.detail.value })
                        } 
                    })
                ),
                this.on_hide_action == 'show_html' ? el('row',{
                    label : 'Alternative HTML',  },
                    el('text',{
                        style : {minHeight: '200px'},
                        value : get('alt_html'),
                        onChange(e){
                            set({ alt_html : e.target.value })
                        }
                    }, )
                ) : null
            ),//End of Inspector
        )
                }catch(xregard){ console.error(xregard )}
    }
    arr_to_arr_compare ( A, op, B, core ) {
        var error = null; 
        if ( ! Array.isArray(A)) error= -1;
        if ( ! Array.isArray(B)) error= -2;
        if ( !['in','not_in'].includes(op))error=-3;
        if ( error != null) {
            core.error("Conditional.arr_to_arr_compare error("+error+") - invalid operands or operator <"+ op+">")
            return false;
        }

        var at_least_one=false;
        for ( var i=0; i < A.length; i++){//for each of operand A values
            if ( B.includes( A[i])) {    //see if at least one of A's values are within B;
                at_least_one = true;
            }
            if ( at_least_one) break;   //if so break
        }
        return op == 'in' ? at_least_one : op == 'not_in' ? ! at_least_one : false;
    }
    async show_children( core, block_options){
        
        var should_show_content = true; 
        var cond , iter_result, use_default_operator_evaluation ; 
        var operand0 = null;// condition type we are testing for 
        var operand1 = null;// the values we are testing for
        var operator = null; 
        var queued_operands = {} 

        var is_lock_down = false; 
        var reason = []
        
        for ( var i=0; i < this.conditions.length; i++){ 
            cond    = this.conditions[i];
            use_default_operator_evaluation = true;
            if ( cond.cond_type == 'lockdown'){
                is_lock_down = true;
                break; 
            } 
            //console.log (i, `Condition(${cond.cond_type}) <${cond.cond_operator}> `, cond.cond_operand, `target(${cond.target_key})`)
 
            operand0 = await core.type_cast( await this.get_operand0_value(core, cond, block_options)  ); 
            operand1 = await core.type_cast( await this.get_operand1_value(core,cond, block_options) );
            if ( Array.isArray(operand0 )){
                for(var i0=0; i0<operand0.length; i0++) typeof operand0[i0] =='string' ?operand0[i0] = operand0[i0].trim().toLowerCase():null
            }
            if ( Array.isArray(operand1 )){
                for(var i1=0; i1<operand1.length; i1++)typeof operand1=='string' ? operand1[i1] = operand1[i1].trim().toLowerCase()  :null
            }
            if ( Array.isArray(operand0)) { 
                for( var index=0; index < operand0.length; index++){
                    operand0[index] = await core.type_cast(operand0[index])
                } 
            }

            if ( Array.isArray(operand1)) { 
                for( var index=0; index < operand1.length; index++){
                    operand1[index] = await core.type_cast(operand1[index])
                } 
            } 
            operator = cond.cond_operator;

            if ( cond.cond_type == 'post_tag'){
                use_default_operator_evaluation = false; 
                var tmp = operand0  //do a swap
                operand0 = operand1     //tags we are searhcing for
                operand1 = tmp          //post actual tags 
                 
                iter_result =  this.arr_to_arr_compare(operand0, operator, operand1, core )
            }
            if ( cond.cond_type == 'post_type'){
                use_default_operator_evaluation = false; 
                if ( operator == 'equal'){ 
                    iter_result = operand0 == operand1[0]
                }else if ( operator == 'not_equal'){ 
                    iter_result = operand0 != operand1[0]
                }else if ( operator == 'in'){ 
                    iter_result = operand1.includes ( operand0 )
                }else { 
                    iter_result = ! operand1.includes ( operand0 )
                }
                  
            }
            if ( (cond.cond_type == 'post_meta_exist' || cond.cond_type == 'post_meta_exists')||
                 (cond.cond_type == 'user_meta_exist' || cond.cond_type == 'user_meta_exists')){
                use_default_operator_evaluation = false; 
                iter_result = this.arr_to_arr_compare(operand0, operator, operand1, core )
            }

            if ( cond.cond_type == 'post_meta_value' || cond.cond_type == 'user_meta_value'){ 
                use_default_operator_evaluation = false 
                var meta_obj = operand1.find(it => it.name == cond.target_key); 

                if (!meta_obj){
                    iter_result =false; 
                }else {
                    var meta_obj_value = meta_obj.value;  
                    //operand0 - is what user typed into the operand box which is always an array 
                    //operand1/meta_obj_value - is what is from site database
                    if ( operator == 'in' || operator == 'not_in'){ 
                        if ( !Array.isArray(meta_obj_value) ) meta_obj_value =[meta_obj_value]
                        iter_result = this.arr_to_arr_compare(operand0, operator, meta_obj_value, core )
                    }else {

                        if ( Array.isArray(meta_obj_value) ) meta_obj_value = meta_obj_value[0] ||null;  
                        iter_result = operator == 'equal' ? operand0[0] == meta_obj_value : operand0[0] != meta_obj_value 
                    } 
                } 
            }
            if ( cond.cond_type == 'user_has_role'){
                use_default_operator_evaluation = null; 
                iter_result = this.arr_to_arr_compare( operand0, cond.cond_operator, operand1, core)
            }

            if ( use_default_operator_evaluation ) { 
                if (operator == 'in' || operator == 'not_in' ){
                    var use_arr_to_arrow=false; 
                    if ( Array.isArray(operand0) ) { 
                        if ( operand0.length <= 1)
                            operand0 = operand0[0];
                        else {
                            use_arr_to_arrow = true; 
                        }
                    }
                    if ( !Array.isArray(operand1)) operand1 = [operand1 ];
                    if ( use_arr_to_arrow ) {
                        iter_result = this.arr_to_arr_compare(operand0, operator, operand1, core )
                    }else { 
                        iter_result = operator == 'in' ?  ( operand1.includes(operand0) ) : ( ! operand1.includes(operand0) )
                    }
                }else if ( operator == 'equal' || operator == 'not_equal'){
                    if ( Array.isArray(operand0) ) operand0 = operand0[0];
                    if ( Array.isArray(operand1)) operand1 = operand1[0];
                    iter_result = operator =='equal' ? operand0 == operand1 : operand0 != operand1;
                }else if ( operator == 'greater' || operator== 'greater_equal'){
                    if ( Array.isArray(operand0) ) operand0 = operand0[0];
                    if ( Array.isArray(operand1)) operand1 = operand1[0];
                    iter_result = operator =='greater' ? operand0 > operand1 : operand0 >= operand1;
                }else if ( operator == 'lesser' || operator== 'lesser_equal'){
                    if ( Array.isArray(operand0) ) operand0 = operand0[0];
                    if ( Array.isArray(operand1)) operand1 = operand1[0];
                    iter_result = operator =='lesser' ? operand0 < operand1 : operand0 <= operand1;
                }else if ( operator == 'contains' || operator == 'not_contains'){ 
                    if ( Array.isArray(operand0) ) operand0 = operand0[0] + '';//force string
                    if (! Array.isArray(operand1)) operand1 = [ operand1 ];
                    
                    var match_least1 = false; 
                    for ( var mi =0; mi < operand1.length; mi++){ 
                        if ( operand0 != null && operand0.includes (operand1[mi] )){
                            match_least1 = true; break;
                        }
                    }
                    iter_result = operator =='contains' ? match_least1 : ! match_least1
                }
            }
            

            if ( cond.cond_type == '404_post') {
                console.log ("-------------------------Conditional has 404 condition check", block_options.is_404 )
                use_default_operator_evaluation = false; 
                iter_result = block_options.is_404 == true 
                console.log ("------xo:", iter_result)
            }
            
            should_show_content = should_show_content && iter_result; 
            if ( !should_show_content ) {
                reason.push(`Failed(${cond.cond_type}): ${operand0}<${cond.target_key}> ${operator} ${operand1}`)
                break; 
            }
        }            
        
        var final_allow_blocks = should_show_content;
        if ( is_lock_down || !should_show_content) {
            final_allow_blocks = false; //prevent showing
            if ( is_lock_down) reason.push ('Lock Down')
        }   
        block_options.__reasons = reason;
        return final_allow_blocks 
    }
    async render (core, block_options){ 
        
        let  { id, classes, s , inner_html, user_id, block_id ,block_type, post_id, iattrs  } = block_options
        var content = inner_html, html 
        
        var tag0 = `<section ${id()} ${classes('conditional-block')}   ${iattrs()} >`
        var tag1 = `</section>`
        if  ( this.tagless ) {
            tag0 = tag1 = '';
        }

        
        var final_allow_blocks  = await this.show_children(core, block_options ) 
        if ( final_allow_blocks  )   {
            html=`${tag0} <!-- cond(s) passed -->${content} ${tag1}`
        }else {
            html=`<!--Conditional::${block_id}: Failed -->`
            if ( Array.isArray(block_options.__reasons)){
                html += `<!-- Reasons \n`
                for(var i=0; i < block_options.__reasons.length; i++){
                    html += `[0]=${block_options.__reasons[i]}\n;`
                }
                html += ` -->`
            }
            if ( this.on_hide_action == 'show_html')
                html += this.alt_html || "" 
        }

        console.log ( this, block_id , post_id  )
        return { html , skip_children : true }
    } 
    /**
     * The the operand value for the conditon type we are testing and return it
     * @param {Object} core Core Class
     * @param {Object} cond { cond_type, cond_operator, cond_operand}
     * @param {Object} blk_options 
     * @returns {Mixed}
     */
    async get_operand0_value(core,cond , blk_options) {
        if ( ! cond ) return null; 
        if ( ! blk_options ) return null;
        switch(cond.cond_type){
            case 'user_login_status':
                return blk_options.user_id > 0 ? 'logged_in' : 'logged_out'
            case 'post_group':
                return blk_options.post.group_id ;
            case 'post_tag'://check that the variable arguments tokens are within the post's tags
                return blk_options.post.tags || blk_options.post.tag 
            case 'post_status':
                return blk_options.post.status 
            case 'post_type':
                return blk_options.post.type 
            case 'user_meta_exists':
            case 'user_meta_exist':
            case 'post_meta_exists':
            case 'post_meta_exist'://this is purposefully flipped
                return cond.cond_operand;
            case 'post_meta_value': 
            case 'user_meta_value':
                return cond.cond_operand 
            case 'user_status':
                if ( ! blk_options.user_id ) return "not_logged_in";
                var db= core.db;
                var ret = await db.query(`SELECT status FROM ${db.name}.users WHERE ${db.is('id',blk_options.user_id )}`)
                if ( ret.length == 0) return "user_not_found";
                return ret[0].status||"null_status";
            case 'time_of_day':
                return blk_options.now.today 
            case 'day_of_week':
                var day = ['sunday','monday', 'tuesday','wednesday','thursday','friday','saturarday'] [blk_options.now.day ]
                return day 
            case 'when_month':
                var month = ['january','february', 'march',
                            'april','may','june',
                            'july','august','september',
                            'october','november','december'] [blk_options.now.month ]
                return month 
            case 'cookie_is':
                return blk_options.cookies[ cond.target_key ]; 
            case 'user_has_role':
                return cond.cond_operand; 
            case 'http_referrer':
                return blk_options.headers['referer'] || blk_options.headers['referrer'] ||blk_options.headers['refferer']
            case 'has_http_query':
                return cond.cond_operand
            case 'http_query_value':
                return blk_options.query [ cond.target_key ] || '#'
            case 'when_on_os':
                var val = blk_options.headers['sec-ch-ua-platform']
                if ( val ){
                    val = val.replaceAll(/["']/gm,'').toLowerCase()
                }
                return val; 
            case 'is_member_of':
                var tb_groups = `${core.db.name}.groups`
                var tb_gmbrs = `${core.db.name}.group_members`
                var sub1= `SELECT group_id FROM ${tb_gmbrs} WHERE status='approved' AND user_id=${blk_options.user_id||-1 }`
                let group_ids = await core.db.query( `SELECT id FROM ${tb_groups} WHERE id IN (${sub1})` )
                return group_ids.map ( g => g.id );
            default:
                return null; 
        }

    }
    /**
     * The the operand value for the conditon test operand being compared with
     * @param {Object} core Core Class
     * @param {Object} cond { cond_type, cond_operator, cond_operand}
     * @param {Object} blk_options 
     * @returns {Mixed}
     */
    async get_operand1_value(core, cond , blk_options) {
        if ( ! cond             ) return []; 
        if ( ! blk_options      ) return [];
        var operands = cond.cond_operand;
        if ( ! operands ) return []; 
        var is_num = (x) => !isNaN(x) 
        switch(cond.cond_type){
            case 'user_login_status':
                return cond.cond_operand
            case 'post_group':
                //Loop each operand and ensure integers, and if string resolve to id
                for ( var i=operands.length-1; i >-1;i--){
                    if ( !is_num(operands[i])){
                        var groups = await core.get_group({ title : operands[i]})
                        if ( groups.length > 0) operands[i] = groups[0].id; //take the first one
                    }else operands[i] = parseInt( operands[i] )
                }
                return operands
            case 'post_tag':
                var tags = cond.cond_operand 
                return tags
            case 'post_status':
            case 'post_type':
                return cond.cond_operand
            case 'post_meta_exists':
            case 'post_meta_exist':
                return blk_options.post.metas.map ( it => it.name) 
            case 'post_meta_value':
                return blk_options.post.metas
            case 'user_meta_exists':
            case 'user_meta_exist':
                var metas = await core.users.get_metas({ user_id : blk_options.user_id });
                if ( ! metas ) return  [];
                return metas.map(it => it.name)
            case 'user_meta_value':
                return await core.users.get_metas({ user_id : blk_options.user_id });
            case 'user_status':
                return cond.cond_operand
            case 'time_of_day':
                //remember cond_operand should always be an array of values !!!!!!
                var time =cond.cond_operand[0].trim().split(/:/gm)
                var today_with_operand_time = new Date();
                today_with_operand_time.setUTCHours(time[0])
                today_with_operand_time.setUTCHours(time[1] || 0)
                return today_with_operand_time; 
            
            case 'day_of_week': 
                for ( var i=0; i < cond.cond_operand.len;i++){
                    cond.cond_operand[i] = cond.cond_operand[i].toLowerCase().trim()
                }  
                return cond.cond_operand
            case 'when_month': 
                for ( var i=0; i < cond.cond_operand.len;i++){
                    cond.cond_operand[i] = cond.cond_operand[i].toLowerCase().trim()
                }  
                return cond.cond_operand
            case 'cookie_is':
                return cond.cond_operand; 
            case 'user_has_role':
                var roles = await core.users.get_roles({ user_id : blk_options.user_id , flat : true });
                return roles
            
            case 'http_referrer':
                return cond.cond_operand
            case 'has_http_query':
                var Q=  blk_options.query;
                var keys = [];
                for(var key in Q) keys.push(key) 
                return keys 
            case 'http_query_value':
                return cond.cond_operand
            case 'when_on_os': return cond.cond_operand
            case 'is_member_of': 
                var tb_groups = `${core.db.name}.groups`
                var sub1= `SELECT id FROM ${tb_groups} WHERE ${core.db.like('id',cond.cond_operand)} OR ${core.db.like('title', cond.cond_operand)}`
                let group_ids = await core.db.query( sub1)
                return group_ids.map ( g => g.id );
            default:
                return []; 
        }
    }
    drop ( instance ) {  return true   }
    style( ){
        return null
    }
    script ( ){ }

    create_new_item(){ 
        var cond_type_list = this.get_condition_types();
        var cond_type = cond_type_list[0].value 
                 
        var arr_allowed= cond_type_list.find(it => it.value == cond_type ) .allowed_operator
        return {
            cond_type       ,
            cond_operator   : arr_allowed[0], 
            cond_operand    : null  ,
            target_key : null //used within post_meta_value or user_meta_value to target the meta name whose value we need to compair
        }
    }
    get_condition_types(){
        return [
            { title : "Lockdown", value : "lockdown", allowed_operator: ["in"] , tooltip: "Always hide", description: "Not required" },//Done
            { title : '404 Page', value : "404_post" , allowed_operator : ["equal"],tooltip : "When 404 post", description : "For 404 pages"},
            { title : "Post Group", value : "post_group", allowed_operator: ["in","not_in"] , tooltip: "Post group includes one of" },//Done
            { title : "Post Tag", value : "post_tag" , allowed_operator: ["in","not_in"] , tooltip: "Post tags has at least one of"}, // Done
            { title : "Post Status", value : "post_status" , allowed_operator: [ "in","not_in" ], tooltip: "Post Status is at least one of",//Done
                values :[
                    { title : "Draft", value: "draft"},
                    { title : "Pending", value: "pending"},
                    { title : "Approved", value: "approved"},
                    { title : "Published", value: "published"},
                    { title : "Trashed", value: "trash"}, 
                ]
            },
            { title : "Post Type", value : "post_type", allowed_operator: ["equal", "not_equal", "in","not_in"], tooltip: "This post type is or one of"},//Done
            { title : "Post Meta Exists", value : "post_meta_exist", allowed_operator: [ "in","not_in" ], tooltip: "Any of these names exist"},//Done
            { title : "Post Meta Value", value : "post_meta_value", allowed_operator: ["equal", "not_equal", "in","not_in"], tooltip: "A meta property is equal to"},
            

            { title : "User Meta Exists", value : "user_meta_exists" , allowed_operator: ["in","not_in"]},
            { title : "User Meta Value", value : "user_meta_value" , allowed_operator: ["in","not_in"]},
            { title : "User Status", value : "user_status" , allowed_operator: ["equal","not_equal","in","not_in"],
                choices : [
                    { title : "Inactive", value : "inactive" },
                    { title : "Active", value : "active" },
                    { title : "Pending", value : "pending" },
                    { title : "Suspended", value : "suspended" }
                ]
            }, 
            { title : "User Logged In", value : "user_login_status", allowed_operator: ["equal","not_equal"], 
                default_value : "logged_in",
                choices : [ //Choices user can pick from
                    {title : "Logged In"  , value : "logged_in"},
                    {title : "Logged Out" , value : "logged_out"},
                ] 
        
            },
            { title : "User Role", value : "user_has_role", allowed_operator: ['in','not_in'], tooltip : "User has role", description: "Group name or title"  },
            { title : "Is Member Of", value : "is_member_of", allowed_operator: ['in','not_in'], tooltip : "User member of", description: "Group ID(s) or name(s)" },
            
            { title : "Time of Day", value : "time_of_day", allowed_operator : ["greater", "greater_equal", "lesser","lesser_equal"], tooltip : "Vistors local time",description:"time -ie 11:00, 15:00,..."},
            { title : "Day of Week", value : "day_of_week", allowed_operator : ["equal","not_equal","in", "not_in"],tooltip : "Visitors day of week", description: "ie - monday,tuesday,..."},
            { title : "When Month", value : "when_month", allowed_operator : ["equal","not_equal","in", "not_in", ],tooltip : "Visitor's month" , description : "ie - February, June,..."},
            { title : "Cookie Value", value : "cookie_is", allowed_operator : ["equal","not_equal","greater", "lesser",  'greater_equal','lesser_equal'],tooltip : "Check cookie", use_target_key: true },
            { title : "HTTP Referrer ", value : "http_referrer", allowed_operator : ["contains","not_contains"],tooltip : "Page referrer is any of", description: "ie: google.com" },
            { title : "URL Query Exists", value : "has_http_query", allowed_operator : ["in","not_in"],tooltip : "Query key exists" , description: "List of query names"},
            { title : "URL Query Value", value : "http_query_value", allowed_operator : ["equal","not_equal","greater","greater_equal","lesser","lesser_equal","in","not_in"],
            tooltip : "Query value is", use_target_key: true , description: "URL value(s) "},
            { title : "When OS", value : "when_on_os", allowed_operator: ['in','not_in'], tooltip : "When on OS", description: "windows,linux,apple,..." },
            

        ]
    }
    get_condition_type_choices ( cond_type){
        var cond_descriptor = this.get_condition_types().filter (it => { 
            var match =  it.value ==  cond_type ; 
            return  match
        });
         
        if ( ! cond_descriptor ) return null;  
        if ( cond_descriptor.length == 0 ) return null; 
        return cond_descriptor[0].choices || null; 
    }

    get_condition_type_descriptor ( cond_type){
        var cond_descriptor = this.get_condition_types().find (it => { 
            var match =  it.value ==  cond_type ; 
            return  match
        });
          
        return cond_descriptor || {}
    }
    get_condition_type_tooltip ( cond_type){
        var cond_descriptor = this.get_condition_types().find (it => { 
            var match =  it.value ==  cond_type ; 
            return  match
        });
         
        if ( ! cond_descriptor) return null;   
        return cond_descriptor.tooltip 
    }
    get_condition_operators(){
        return [
            { title : "=", value : "equal"},
            { title : "!=", value : "not_equal"},
            { title : ">", value : "greater"},
            { title : ">=", value : "greater_equal"},
            { title : "<", value : "lesser"},
            { title : "<=", value : "lesser_equal"},
            { title : "In", value : "in"},
            { title : "Not In", value : "not_in"},
            { title : "Contain", value : "contains"},
            { title : "Not Contains", value : "not_contains"},
        ]
    }
    filter_operator(operators, cond_type){
 
        if (! operators) return []
        if ( operators.length==0){ 
             return operators;
        }
        var cond_descriptor = this.get_condition_types().filter (it => it.value == cond_type)
        if ( ! cond_descriptor) return [{title : "None", value : "none"}]
 
        if ( cond_descriptor.length == 0){ 
            return operators
        }

        var allowed_operator = cond_descriptor[0].allowed_operator ; 
        if ( ! allowed_operator ) return operators;//return everything
        if ( allowed_operator.length==0) return operators;

        return operators.filter( oper =>{
            var oper_value = oper.value ; 
            return allowed_operator.includes( oper_value )
        })
    }
    get_plus_icon(){
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      `
    }
    get_x_icon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      `
    }
    get_sparkle_icon(){
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
      `
    }
}