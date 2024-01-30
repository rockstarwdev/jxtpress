import chk from "./chk";
import util from "./util";


/**
 * 
 * @param {HTMLDivElement} div_media Media div element of which an input field and a button with ellipses will be created
 * @param {*} options Object { value : String seperated by commas or array of objects or just objects, placeholder, onChange }
 */
function make_media_element(div_media, options){
    if ( ! options) options = {}
    let value = chk(options,'value')
    var on_change = options.on_change || options.onChange || null; 
    //wrap the provided onChange event around a function so it auto triggers blur
    if ( typeof on_change == 'function'){ 
        var fn_chg = on_change;
        delete options.onChange; delete options.on_change;
        options.onChange = (te)=>{ 
            fn_chg(te);
            setTimeout(()=>{
                util.trigger('blur', te.target.parentElement);
            },220)
        }
    }
    // Decorate the Div element
    div_media.classList.add("media-ui","flex", "my-2", "border","border-gray-300", "rounded")

    //Create the input field for the files URL
    var e_input = document.createElement("input");  
    e_input.type="text";  
    e_input.classList.add("flex-1");
    e_input.placeholder = options.placeholder || (options.attr?.placeholder) || "Select file(s)"
    e_input.addEventListener('change',(e)=>{
        e.preventDefault()
        e.stopPropagation()
        var d = [{ url : e.target.value } ]
        util.trigger('change',div_media,{  d , value : d },)  
    })

    //Create the button that will open up the Media browser
    var e_btn   = document.createElement("button"); 
    e_btn.classList.add("button","flat","primary")
    e_btn.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" ` + 
    `viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">`+ 
    `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 `+ 
    `0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>`
    e_btn.style.padding='4px 3px 0px'
    e_btn.style.margin = 'var(--ui-padding)'
    //
    let create_file_items = (values)=>{

        if ( typeof values == 'string'){
            values = values.split(","); //could be "/some/file.png,/some/other-file.png,/yet/otherfile.png"
        }
        //Always force an array
        if ( !Array.isArray(values)) values = [values] 

        var urls = "", link = null; 
        for (var i=0; values && i < values.length; i++){
            var item = values[i] ;
            if ( typeof item == 'string'){
                link = item; 
                item = { type :'media', url : link }
                
            }else if ( item && typeof item == 'object'){
                link = null; 
                if ( item.url ) {
                    var has_id = item.url.includes("id=");
                    link =  has_id ? item.url : item.url + "?id="+ (item.id || "none")
                } 
            }else if ( item == null){
                link = ""
            } 
            
            urls += link   
            if ( i < values.length-1) urls +=", "
          } 
          
          //set the display text
          e_input.value = urls 
    }
    e_btn.addEventListener('click',async (e)=>{
        e.preventDefault();
        e.stopPropagation();

        var ret = await util.open_media({  files: value })//value should be an array of values
        if ( ret.action == 'ok'){
            var d = ret.d ||[]  //Array { id, created_by, group_id, title, url, type }
            
             
            create_file_items(d); 
            
            setTimeout(()=>{
              e_input.click()
              setTimeout(()=>   e_input.focus(),50)
              setTimeout(()=>{ 
                util.trigger('change',div_media,{  d , value : d },)  
              },100)
            },100) 
        }
    })
    div_media.appendChild(e_input)
    div_media.appendChild(e_btn)
    create_file_items(value); 
}
let tab_const = "\u00a0"
function insert_tab_to_editable(e){ 
    e.preventDefault();

    let editor = e.target;
    if ( !editor.classList.contains('editable')){
        console.error("can only be performed on editable.contenteditable")
        return null; 
    }
    
    let doc = editor.ownerDocument.defaultValue;
    let sel = document.getSelection();
    let rng = sel.getRangeAt(0);    

    console.log (sel, rng)
    let tab_node = document.createTextNode(`${tab_const}${tab_const}${tab_const}${tab_const}`);
    rng.insertNode(tab_node);

    rng.setStartAfter(tab_node)
    rng.setEndAfter(tab_node);
    sel.removeAllRanges()
    sel.addRange(rng);
    console.log ("\t\t",sel, rng )
}
function hnd_delete_text ( e) {
    let editor = e.target 
    let doc = editor.ownerDocument.defaultValue;
    let sel = document.getSelection();
    let rng = sel.getRangeAt(0);   

    console.log (`Sel={${sel.toString()}}`, `Rng={${rng.toString()}}`, sel.baseNode.data,  sel)
}




/**
 * Recursive function that replaces all instances of {item} or {item.key} with values found within data
 * @param {HTMLElement} element The HTML element that is or is part of the repeater being rendered that we then need to resolve any {item} or {item.key} string with legitimate values from data
 * @param {Object|String|Number} data the data that will be used to replace any {item} or { item.key} 
 * @param {Object} options data and functions passed in from repeater's context
 */
function resolve_repeated_item(element, data, options ){
    if ( ! element ) return; 
    if ( data == undefined || data == null) return; 
    /** Check is it has our express that can be parsed to aid understanding how to access data */
    let is_expr = (str)=>{
        if ( typeof str != 'string') return false;
        if ( ! str) return false; 
        str = str.trim();
        return str.startsWith("{") && str.endsWith("}") && str.includes("item");
    }
    let expr = (str)=>{
        var m =  /(item[\w.]*)/gi.exec (str) //get just 'item' or 'item.key'
        if ( ! m ) return; 
        str = m[0];//assign match
        var value = null;  
        if ( str.includes(".")){
            var key = str.split(".")[1];
            value = data[key];
        }else {
            value = data;
        }
        return value; 
    }
    var value = element.getAttribute('value');
    if ( ! value ) value = element.value; 
    var is_editable = false; 
    var is_attribute = false;
    if ( value == undefined) {  
        if ( element.classList.contains("editable")){
            value = element.innerHTML;
            is_editable = true; 
        }else {
            value = element.getAttribute("value")
            is_attribute = true; 
        }
    }
  
    
    
    
    //Resolve the value of the item
    if ( is_expr ( value)){ 
        value = expr(value)
        if ( is_editable){
            element.innerHTML = value; 
        }else { 
            element.setAttribute('value', value)
            element.value = value; 
        }
    }  

    //Apply event listener to the "Cloned" element
    var fn_arr = JSON.parse( element.getAttribute('fn')); 
    if ( Array.isArray( fn_arr) ) {
        fn_arr.forEach( it =>{
            if ( ! it.code) return;
        
            //replace the "onInput (e){", "on_click(e) {" with just "function(e) {"
            var code = it.code.replace(/([^`]+?\s*)\{/i,'(e, {item_index, set_item,get_item,add_item,remove_item, get_new})=> {')
            
          
            var fn = new Function(" return " + code ) ;// 
            fn = fn();
            if ( element.classList.contains("editable")) util.apply_editable_effects(element)

            let cb = (e)=>{   if ( fn ) fn(e, options); };
            if ( it.name =='input') cb = util.debounce(cb)

            element.addEventListener(it.name, cb)
        })
    }
    
    for ( var i =0; i < element.children.length; i++){
        try{  
            var child = element.children[i]
            resolve_repeated_item(child,data, options);
        }catch(e){
            console.error("recursive-resolve error", element,data, options, e)
        }
    }
}


/**
 * Utility function that simplifies the creation of HTML elements
 * @param {String} tag Type of element to create.
 *      Standard HTML types - div, p, h1, . . . etc
 *      editable - Rich Text box - links, color, 
 *      dropdown - Dropdown selection box
 *      slot - Element (with 'children-slot' css class) that allows placement of children elements.  Drag & drop function will beo 
 *             auto applied to the element.
 *      repeater - Control to allow for repeatable Placement of data within any control.  The "value" property must be an array and a 
 *                 "get_new" method must be defined that returns a new item for the repeater element.  Lasting, the repeater
 *                 element must have 1 immediate child, but that child can have unlimited children.  Within the repeater element immediate
 *                 or grand children you must use "get_item('{ property_name.target_variable}') or get_item('{speed.x}')" to access
 *                 various data of the repeater item.  Use "set_item({ property: value})" to update current repeater item when it changes or receives input.
 *      media - element that allows seamless interface of file browser
 *      inspector - Inspector allow you to build controls to the right-side pane outside the canvas.
 *      string, number, text - Translates to text input field, number input field, and textarea field respectively
 * @param {Object} options { attr, style, on_<event_name> }
 * @param  {...any} children Function calls to
 * @returns 
 */
export default function (tag, options = {}, ... children  ) { 
    try {
        var debug = options.debug 
        if ( ! tag) return null; else  tag = tag.toLowerCase(); 
        if ( tag =='editable' || tag == 'richtext') { 
          options.is_editable = true; 
          var default_tag = 'div'; 
          tag = options.use_tag || options.user_tag || default_tag;
        }else if (tag == 'duplex'){
            tag = 'div';
            options.is_duplex = true; 
        }else if (tag == 'color'){
            tag = 'button'
            options.is_color = true; 
        }else if ( tag == 'serverside' || tag == 'server-side'){
            tag = 'dd';
            options.is_serverside = true; 
        }else if ( tag == 'inspector'){
            options.is_inspector = true; 
            tag = 'div';
        }else if (tag =='checkbox'){
            tag = 'div'
            options.is_checkbox=true;
        }else  if ( tag =='input' || tag=='textarea'|| tag == 'string' ||  tag == 'text' || tag == 'number'){
            options.is_input    = true; 
            if ( options.is_number = tag == 'number') options.input_type  = tag;
            
            if ( tag != 'input' && tag != 'textarea')  tag = tag == 'text' ? "textarea" : "input" 
            
        }else if (tag == 'spinner'){
            options.is_spinner = true 
            tag = 'div'
        }else if (tag == 'label'){
            options.is_label = true 
            tag = 'div'
        } else if ( tag == 'dropdown'){
            options.is_dropdown = true; 
        }else if ( tag == 'slot' || tag == 'children'){
            options.is_slot = true;
            tag = options.tag || "div"
        }else if ( tag == 'repeator' || tag == 'repeater'){
            options.is_repeater = true; 
            tag = 'div';
        }else if ( tag == 'media' || tag == 'file'){
            options.is_media = true; 
            tag = 'div'
        }else if ( tag == 'date' || tag =='date-time' || tag =='datetime'){
            options.is_date = tag == 'date'
            options.is_datetime= tag =='date-time' || tag =='datetime'
            tag = 'div'
        }else if ( tag == 'lookup'){
            options.is_lookup = true; 
        }else if ( tag == 'switch'){
            options.is_switch = true; 
        }
        //If the only child is a string, then place that string as the innerHTML of the element being created
        var children_type = typeof children[0];
        if ( children.length == 1 && (children_type == 'string' || children_type == "boolean"||  children_type == "number"  )){
            options.innerHTML = children[0] || options.innerHTML;
            options.children_is_value = true; 
            children.splice(0,1);
        }
    
    
        var element   = null; 
        var attrs     = chk(options, 'attrs', {});
    
        if( options.is_label){
            element = document.createElement("div")
            element.classList.add("label");
            var text = options.innerHTML || options.text 
            if ( children.length==1 && typeof children[0] != 'object'){
                text = children[0]
            }
            element.innerHTML = text ;
        }else if ( options.is_lookup) {
            element = document.createElement('div')
            element.classList.add("lookup")
    
            var sels = document.createElement("div");
            sels.classList.add("selected")
            element.appendChild(sels)
    
            var io = document.createElement("input")
            io.type = "text"
            io.setAttribute("placeholder", "  " + (options.placeholder || "") )
            io.addEventListener('change',(e)=>e.stopPropagation() )
            element.appendChild(io);
            var context = options.context || "";
            if ( ! options.attrs) options.attrs = {}
            if ( options.attrs.context ) context = options.attrs.context  ; 
            element.setAttribute("context" , context  )
    
            var action = options.attrs.action || options.attrs.url ||options.attrs.endpoint || "";
            if ( action) element.setAttribute("action", action )
            
            var temp_val = options.value
            if ( children.length > 0){
                temp_val =  children[0];
                children.splice(0,1);
            }
             
            
            if ( typeof temp_val != 'function') element.setAttribute("value", JSON.stringify(temp_val))
            element.addEventListener('ready', function(){
                console.log ("Ready on lookup invoked")
                util.trigger('selected-value',element)
            })
        }else if(options.is_spinner ){
            element = document.createElement("div") 
            element.classList.add("spinner")
            var input = document.createElement("input")
            input.value = options.value || options.innerHTML 
            element.appendChild(input )


            var bt0 = document.createElement("button")
            bt0.classList.add("button")
            bt0.innerHTML= `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
            stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg> `
            var bt1 = document.createElement("button")
            bt1.classList.add("button")
            bt1.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>`


            var controls = document.createElement("div")
            element.appendChild(controls)
            controls.classList.add("controls")
            controls.appendChild(bt0)
            controls.appendChild(bt1)


        }else if ( options.is_switch ){
            element     = document.createElement("label");
            var io      =document.createElement("input")
            var span    = document.createElement("span");
            span.classList.add ("slider","round")

            
            element.appendChild( io );
            element.appendChild ( span );
        }else if (options.is_color){
            var val = options.value || options.innerHTML
    
            element = document.createElement("button")
            element.classList.add("button","color-picker")
            element.setAttribute("value",val)
            var span = document.createElement("span")
            span.style.backgroundColor = val 
            span.classList.add("color")
            element.appendChild(span) 
        }else if (options.is_duplex){
            element = document.createElement ("div")
            element.classList.add("duplex")


            var eln = document.createElement("input")
            var els = document.createElement("select"); 
            var arr = options.values || [
                {title :"--",value:"--"},{title :"px",value:"px"},
                {title:"em", value :"em"},{title:"%", value :"%"}]

            for ( var i=0; i < arr.length; i ++){ //create the options before calling get_parts
                var elo = document.createElement("option")
                elo.setAttribute("value",arr[i].value)
                elo.innerHTML =arr[i].title 
                els.appendChild(elo);
            }
            
            let get_parts = (value)=>{ 
                var rex = /(-?[\d+\.]+)([%a-zA-Z0-9\-]+)/;        //ie "32.45px" -> (32.45) , (px) 
                var parts = rex.exec( value) 
             
                if ( parts != null){
                    eln.value  = parseFloat(parts[1])
                    els.value = parts[2]  
                }  
            }
            element.addEventListener('set',(e)=>{
                get_parts(e.detail.value );  
            })
            
            get_parts( options.value || options.innerHTML )
            
            eln.type="number"
            element.appendChild(eln);
    
            element.appendChild(els)
    
        }else if ( options.is_dropdown){ //For Dropdown Element
            element = document.createElement("div")
            element.classList.add("select", "dropdown");
            if ( typeof options.value != 'function') element.setAttribute("value", JSON.stringify(options.value));
            if (Array.isArray(options.value)) element.classList.add("is-array");
          
            if ( options.attrs && options.attrs['data-title'])element.setAttribute('data-title',options.attrs['data-title'] )
            var el_selected = document.createElement("div");
            el_selected.classList.add("selected");
            var el_values = document.createElement("div");
            el_values.classList.add("values");
          
            var temp_val = options.value || options.innerHTML
            if ( (temp_val == null || temp_val == undefined) && typeof children[0] != 'object'){
                temp_val = children[0];
            }
            var valz = Array.isArray( temp_val) ? temp_val  : [ temp_val ];
    
            if ( ! options.values ) options.values = []
            for (var i = 0; i < valz.length; i++) {
                var it = valz[i];
                  
                var item = document.createElement("span");
                var it_val = it ? (it.id || it.value || it) : "";
                item.setAttribute("value", it_val);
                var inner = it ?  ( it.title || it.text || it.name || it ) : "";
          
                for (var j = 0; j < options.values.length; j++) {
                var ot = options.values[j];
                ot = ot.id || ot.value || ot;
                if (ot == it_val) {
                  ot = options.values[j];
                  inner = typeof ot.html == 'function' ? ot.html () : ot.title || ot.text || ot.name || it;
                  break;
                }
                }
                item.innerHTML = inner;
                el_selected.appendChild(item);
            }
            
            if (Array.isArray(options.values)) {
                for (var i = 0; i < options.values.length; i++) {
                    var it = options.values[i]; 
                    var item = document.createElement("div");
                    if ( ! it ) continue
                    item.setAttribute("value", it.id || it.value || it);
    
                    if ( typeof  it.html == 'function'){
                        item.innerHTML = it.html();
                    }else if ( typeof options.html == 'function'){
                        item.innerHTML = options.html(it);
                    }else { 
                        item.innerHTML = it.title || it.text || it.name || it;
                    }
                    el_values.appendChild(item);
                }
            }
            element.appendChild(el_selected);
            element.appendChild(el_values); 
        }else if (options.is_date || options.is_datetime){
    
            var value = children.length==1 && typeof children[0] != 'object' ? children[0] : (options.value || options.innerHTML )
            if ( value == null || value == "null" || value == undefined){
                value = options.value||options.innerHTML ||  ""
            }
            element = document.createElement("div");
            element.classList.add("date");
            element.setAttribute("value",value)
            if ( options.is_datetime) element.classList.add("time");
    
            var span = document.createElement("span")
            span.classList.add("value");
            span.setAttribute("value",value);
            span.innerHTML = value ; 
    
            var selwrap = document.createElement("div")
            selwrap.classList.add("selected");
            selwrap.appendChild(span)
    
    
    
            element.appendChild(selwrap);
        }else if (options.is_editable){
            
            element = document.createElement(tag);
            element.classList.add("editable");
            
            element.setAttribute("contenteditable",true);
            element.style.minHeight = "24px";
            element.tabIndex=-1;
            
            util.apply_editable_effects(element)
            let init_value  = options.innerHTML || options.value || options.text 
     
    
            if ( init_value) element.innerHTML = init_value
        }else if(options.is_media){
            element = document.createElement('div');
            
            if ( ! options.value && options.innerHTML){
                options.value = options.innerHTML
            }
            
            make_media_element(element, options)
        }else if(options.is_checkbox){
            element = document.createElement('div');
            element.classList.add("s-checkbox");
    
            var i_chk = document.createElement("input");
            i_chk.setAttribute("type","checkbox")
            i_chk.checked = options.value || options.innerHTML
            element.appendChild(i_chk);
    
            var lbl_chk = document.createElement("label");
            lbl_chk.classList.add("checkbox");
            element.appendChild(lbl_chk)
    
            var lbl_txt = document.createElement("label")
            lbl_txt.classList.add("label")
            lbl_txt.innerHTML = options.label || options.text || ''
            
            element.appendChild(lbl_txt); 
    
    
        }else { 
            var is_row = tag == 'row';
            var is_flex_row = tag == 'flex_row' || tag == 'flex-row'
            if ( is_row || is_flex_row ){
                tag = 'div';
            }
            element = document.createElement(tag)
            if ( is_row){ 
                element.style.paddingBottom = 0.55+'em'
                element.classList.add("row-item");
                var label = document.createElement("div")
                label.classList.add("label");
                label.innerHTML = options.label || options.text || "";
                if ( label.innerHTML)
                    element.appendChild( label ) ; 
            }
            if ( is_flex_row ){
                element.classList.add("flex","gap-2", "mb-2")
            }
            
            var innerText = chk(options, 'text'  ) || chk(options,'innerText');
            var innerHTML = chk(options, 'html'  ) || chk(options,'innerHTML' ) ;
            var value     = chk(options, 'value' )
            var checked   = chk(options, 'checked')
            attrs.type    = chk(attrs, 'type'  )
    
            if ( options.is_number) attrs.type = "number"
            if ( attrs.src === undefined){  
                attrs.src     = chk(options, 'src');
            }
            if ( ['img','input','textarea','checkbox','button','select'].includes (tag)  ){
                
                if ( options.children_is_value  ){
                    element.value = options.innerHTML
                }
            }
            
            if ( innerText  != undefined)   element.innerText  = innerText;
            if ( innerHTML  != undefined)   element.innerHTML  = innerHTML;
            if ( checked    != undefined)   element.checked    = checked
            if ( value      != undefined )  element.value      = value ; 
            if ( attrs.type == 'checkbox')  { 
                element.checked    = value ; 
            }
        }
    
        // Style the element
        var style     = chk(options, 'style', {});
        for(var key in style) element.style[key] = style[key];
        for(var key in attrs) if (attrs[key] != undefined) element.setAttribute (key, attrs[key])
        
        
        //After created
        if ( options.id != undefined)   element.id         = options.id ; 
        else {
            if ( options.attrs && options.attrs.id ) element.id = options.attrs.id ;
        }
        if ( options.is_repeater){
            element.classList.add("repeater", "relative");
        }
        if ( options.is_serverside){
            element.classList.add('serverside')
        }
        
        var classes     = chk(options,'classes') || chk(options,'class') || [];
        if (!Array.isArray(classes)) classes = [classes]
        if ( classes        ) classes.forEach( cls =>  {
            if ( ! cls) return; 
            cls = cls.split(/[\s,]/g)
            for ( var i =0; i < cls.length; i++){
                if (cls[i])element.classList.add(cls[i] )
            } 
        })
        if ( options.is_slot)  { 
    
            var props = options.props || {}
            element.classList.add("children-slot");
            if ( typeof props != 'function') element.setAttribute("props", JSON.stringify(props))

            let on_in = (e) =>{ 
                element.classList.add("on-slot")
            }
            let on_out = (e)=>{
                element.classList.remove("on-slot")
            } 
            element.addEventListener('mouseenter'    , on_in ) 
            element.addEventListener('mouseleave'   , on_out)
        }
    
        //For Inspector Objects
        if ( options.is_inspector ){
            element.classList.add('inspector-elements') 
        }
        var fn_str = []
        //Add Event Listeners
        Object.keys (options).forEach( event_prefixed_name=>{ //Apply events
            var actual_evt_name = null; 
            if ( event_prefixed_name.startsWith('on_') ){
              actual_evt_name = event_prefixed_name.substring(3) 
            }else if ( event_prefixed_name.startsWith('on' ) ){
              actual_evt_name = event_prefixed_name.substring(2)
            }else { 
              return; 
            }
            if ( typeof actual_evt_name != 'string') return null; 
            actual_evt_name = actual_evt_name.toLowerCase()
            let evt_handler =options[ event_prefixed_name ]; 
            if ( typeof evt_handler == 'function') { 
                if ( actual_evt_name == 'input') {
                    evt_handler = util.debounce(evt_handler)
                }
                 
                element.addEventListener(actual_evt_name,   evt_handler )
                fn_str.push({ name : actual_evt_name, code :evt_handler.toString() })
            }
        })//End of registering all events 
        if ( typeof fn_str != 'function') element.setAttribute("fn",JSON.stringify(fn_str))
    
        if ( options.is_input ) {
            var root = document.createElement("div");
            root.classList.add("row")
            var label = document.createElement("div")
            label.classList.add('label')
            label.innerHTML = options.label || "";
            element.classList.add("w-full","border","border-gray-300","border-solid","focus:border-primary-500");
            
            let placeholder = options.placeholder || null; 
            if ( placeholder ) element.setAttribute("placeholder", placeholder)
    
            element.addEventListener('blur',(e)=>{ 
                //util.trigger('blur',root);
                //console.log ("Should trigger blur??")
            })
            
            if ( options.label ) root.appendChild(label)
            root.appendChild(element)
            element = root; 
        }
        if (options.priority){//intended for use with inspector controls
            element.setAttribute("priority", !Number.isNaN(options.priority) ? options.priority : 'X???');
        }
    
        // backward compatability where we passed in an array of el
        // example el( type, attr, [el(...), el(...), ...] ) instead of
        //         el( type, attr, el(...), el(...), ... )
        if ( Array.isArray(children) && children.length==1 && Array.isArray(children[0])) children = children[0]
    
     
        let repeater_values = options.value || options.values || [];  
        if ( options.is_repeater && repeater_values.length == 0){
            element.classList.add("empty")
        }
    
        let get_new = options.get_new ;
        if ( ! get_new && options.is_repeater) {
            console.warn("repeater should have a get_new method defined - a default is being assigned",{ elem: element })
            get_new = (() => "new item");
        } 
    
        if ( options.is_repeater && children.length == 0) {
            throw new Error("Repeater for ")
        }
        children.forEach( (child,index) =>{ 
          if ( !child) return;
          if ( options.is_repeater){
                if (index != 0 ) return;//Only do this for the very first child
                let get_item = (index)=>{
                    if ( index < 0 || index > repeater_values.length-1 ){
                        console.error("get("+index+") is out of bounds") 
                        return null; 
                    }
                    return repeater_values[index];
                }
                /**
                 * 
                 * @param {Mixed} item_value Data to add to the mixed
                 * @param {*} item_index index to 
                 * @param {*} remove_index 
                 */
                let add_item = (item_value,  item_index, remove_index)=>{ 
                    //how do we want to add the item in
                    var how_to_remove = remove_index  == undefined ? "after"  : 
                            remove_index  <       item_index  ? "after"  : 
                            remove_index  >       item_index  ? "before" : "after";
                    //If removal required, adjust the removal index as required
                    let adjusted_remove_index = null; 
                    if ( remove_index != undefined ) {
                        adjusted_remove_index = remove_index + ( how_to_remove == "after" ? 0 : 1  )
                    } 
                    //Add it
                    if ( item_index != null){ 
                        repeater_values.splice(item_index, 0, item_value )
                        if ( debug) console.log ("{ Add ", item_value, " to ", item_index, "}")
                        
                    }else {
                        repeater_values.push( item_value)
                    }
                    
                    //Remove any - if needed
                    if ( adjusted_remove_index != null ) {  
                        remove_item( adjusted_remove_index);  
                    }
                    return repeater_values;
                } 
                let remove_item = ( item_index )=>{  repeater_values.splice(item_index,1); }
                element.setAttribute("repeater","")
                element.removeAttribute("fn")
    
                //used to keep track of repeater item being dragged
                let dragged_element = null; 
    
                var bt_group    = document.createElement("div");
                var bt_add      = document.createElement("button");
                bt_group.classList.add("action-group");
                bt_add.classList.add("inline-flex")
                bt_add.setAttribute("type", "button")
                bt_add.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" `+
                `stroke="currentColor" class="w-4 h-4"> <path stroke-linecap="round" stroke-linejoin="round" `+
                `d="M12 4.5v15m7.5-7.5h-15" /></svg>`
    
                bt_add.addEventListener('click',(e)=>{
                    e.stopPropagation()
                    add_item( get_new()  )
                    util.trigger('blur',e.target.closest(".repeater"))
                })
                bt_group.appendChild(bt_add); 
                element.appendChild(bt_group);
    
    
                for ( var i =0; i < repeater_values.length ; i++){
                    /** the new element representing a repeater row for each repeater instance */
                    var item_repeater = document.createElement("div");
                    item_repeater.classList.add("repeater-item","flex","relative");
                    item_repeater.setAttribute("repeater-item","");
    
    
                    var copy = child.cloneNode(true);
                    try{  
                        // Had to create wrap around function that returns "set_item" otherwise variable "i" always refers
                        // to the last child index instead of being "frozen" in place
                        let set_item = ((passing_index)=>{
                            return (value, item_index=passing_index )=>{
                                if ( index < 0 || index > repeater_values.length-1 ){
                                    console.error("set("+index+") is out of bounds") 
                                    return null; 
                                }
                                
                                var new_value = get_new ()
                                if ( typeof new_value == 'object'){//may sure old key:value are carried forward
                                    var keys =Object.keys(new_value);
                                    var cur_value = repeater_values[item_index] 
                                    for ( var k of keys ) { 
                                        value[k] = value[k] || cur_value[k] 
                                    }
                                }
                                repeater_values[item_index] = value 
                            }
                        })(i)
                        resolve_repeated_item   ( copy, repeater_values[i], { 
                            item_index : i, set_item, get_item, add_item, remove_item, get_new 
                        });
                    }catch(iex){
                        console.error("Exception", iex)
                    }
    
                    var actions= document.createElement('div');
                    actions.classList.add("item-actions","inline-flex","items-start");
                    var bt_handle=document.createElement("button");
                    bt_handle.classList.add("handle", "inline-flex");
                    bt_handle.innerHTML = `<svg class="" width="8px" height="8px" fill="currentColor">
                    <circle cx="6.5" cy="1.5" r="1.5"></circle><circle cx="6.5" cy="6.5" r="1.5"></circle>
                    <circle cx="1.5" cy="1.5" r="1.5"></circle><circle cx="1.5" cy="6.5" r="1.5"></circle> </svg>`
                    bt_handle.setAttribute("draggable",true)
                    bt_handle.addEventListener('dragstart',(e)=>{
                        dragged_element = e.target.closest(".repeater-item"); 
                    })
                    bt_handle.addEventListener('dragend', (e)=>{
                        var cv= e.target.closest(".data-canvas")
                        if ( cv) cv.querySelectorAll(".repeat-placement.hover").forEach(it=>{
                            it.style.display=''
                            it.classList.remove("hover")
                            it.classList.remove("error")
                        })
                        dragged_element = null;
                    })
    
                    var bt_remove=document.createElement("button");
                    bt_remove.style.paddingLeft="0"
                    bt_remove.classList.add("remove","inline-flex")
                    bt_remove.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />  </svg> `;
                    bt_remove.addEventListener('click',(e)=>{
                        e.stopPropagation()
                        var ir = e.target.closest(".repeater-item");
                        var repeater = e.target.closest(".repeater");
                        var item_index = -1;
                        for(var i=0; i < repeater.children.length; i++){
                            if ( repeater.children[i] == ir){
                                item_index = i - 1;
                            }
                        }
                        if ( item_index == -1) return; //not found
                        remove_item(item_index);
                        util.trigger('blur',repeater) 
                    })
                let is_drop_allowed = (e)=>{ 
                    if ( !element.contains( dragged_element)) {//if repreater 
                        e.target.classList.add("error") 
                        return false;
                    }
                    return true; 
                }
                let on_hover_di = (e)=>{
                    if ( ! is_drop_allowed(e) ) return; 
                    e.preventDefault();
                    var ri = e.target.closest(".repeater-item"); 
                    e.target.classList.add("hover") 
                }
                let on_di_leave =(e)=>{
                    e.target.classList.remove("hover")
                    e.target.classList.remove("error")
                }
                let on_drop = (e)=>{
                    if ( ! is_drop_allowed(e)){
                        return ;
                    }
                    e.preventDefault();
                    var repeater_root = e.target.closest(".repeater");
                    var dragged_item_index;
                    var drop_item_index;
                    var how = e.target.classList.contains("before") ? 'before' : 'after'; 
                    
                    var repeater_children = repeater_root.children;
                    for(var i=0; i < repeater_children.length; i++){
                        if ( repeater_children[i] == dragged_element){
                            dragged_item_index = i - 1;  
                        }
                        if ( repeater_children[i] == e.target.parentElement ){
                            drop_item_index= i - 1 ;
                        }
                    }
                    var val = repeater_values[dragged_item_index]
                    var insert_at = how == 'before' ? drop_item_index : drop_item_index+1;
                    add_item(val, insert_at , dragged_item_index)
                    util.trigger("blur",repeater_root);
    
                    
        
                }//end of drop()
    
                let di_before = document.createElement("div")
                di_before.classList.add("absolute","repeat-placement","before",'w-full')
                di_before.style.top = "-8px"
                di_before.addEventListener('dragover',on_hover_di) 
                di_before.addEventListener('dragleave',on_di_leave)
                di_before.addEventListener('drop',on_drop)
    
                let di_after= document.createElement("div")
                di_after.classList.add("absolute","repeat-placement","after",'w-full')
                di_after.style.bottom="-4px"
                di_after.addEventListener('dragover',on_hover_di) 
                di_after.addEventListener('dragleave',on_di_leave)
                di_after.addEventListener('drop',on_drop)
    
                let di_on_clean =(e)=>{
                        let item_rt = e.target
                        item_rt.querySelectorAll(".repeat-placement").forEach(it => { 
                            it.classList.remove("hover")
                            it.classList.remove("error")
                            it.style.display=''
                        }) 
    
    
                        var parent_root =item_rt.parentElement;
                        var repeater_children = parent_root.children; 
                        var is_first , is_last , is_inbetween ;
    
                        var child_count = repeater_children.length; 
                        for(var i=0; i < child_count; i++){
                            if ( repeater_children[i] == item_rt){
                                is_first     = i - 1 == 0;
                                is_last      = i - 1 == child_count-2;
                                is_inbetween = !is_first && !is_last; 
                                break;
                            }
                        } 
                        
                        if (child_count > 1 ){ 
                            if ( is_first ){ 
                            }
                            if ( is_last){
                                if(child_count > 2 && i != 0){// 3 or more
                                    console.log ("is_last ") 
                                }
                            }
                        }
                }
                item_repeater.addEventListener('dragenter', di_on_clean);
                item_repeater.addEventListener('dragleave', di_on_clean);
    
                    //Add the buttons to the actions bar
                    actions.appendChild(bt_handle)
                    actions.appendChild(bt_remove)
                    //Add the actions to the item wrap
                    item_repeater.appendChild(di_before)
                    item_repeater.appendChild(actions);
                    item_repeater.appendChild(copy); 
                    item_repeater.appendChild(di_after)
                    copy.classList.add("flex-1")
                    //add the wrap to the repeater
                    element.appendChild(item_repeater);
                }
          }else { //End of if is repeater
            element.appendChild( child );
          }
        })
    
        if ( element && !element.classList) {
            console.log ("Pending error", element)
        }
        return element    

    }catch(e){
        console.log ("Error during el ", options )
        throw e 
    }
  }