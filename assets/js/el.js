import chk from "./chk";

export default function (tag_name, options = {}, children = []) { 
    tag_name = tag_name.toLowerCase(); 
    if ( tag_name =='editable') { 
      options.editable = true; 
      tag_name = 'div';
    }
    if ( tag_name == 'string' ||  tag_name == 'text'){
        options.is_input = true; 
        options.input_type = tag_name;
        if ( tag_name == 'text'){
            tag_name ="textarea"
        }else {  tag_name = 'input' }
    }

    var element = document.createElement(tag_name)
    var innerText = chk(options, 'text') || chk(options,'innerText');
    var innerHTML = chk(options, 'html') || chk(options,'innerHTML' ) ;
    var value     = chk(options, 'value')
    var style     = chk(options, 'style', {});
    var attrs     = chk(options,'attrs', {}) ;
    var checked   = chk(options, 'checked')
    var type      = chk(options, 'type')
  
    // Style the element
    for(var key in style)  element.style[key] = style[key];
    for(var key in attrs)  element.setAttribute (key, attrs[key])
    if ( type ) element.type =type 
    if ( innerText  != undefined) element.innerText  = innerText;
    if ( innerHTML  != undefined) element.innerHTML  = innerHTML;
    if ( checked != undefined) element.checked = checked
    if ( options.id != undefined) element.id         = options.id ; 
    if ( value != undefined )     element.value      = value; 
    if ( type == 'checkbox'){
        element.checked = value; 
    }
    var classes = chk(options,'classes') || chk(options,'class') || [];
    if ( classes ) classes.forEach( cls =>  cls ? element.classList.add(cls ) : null )
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
  
        element.addEventListener(actual_evt_name, (e)=>{ 
            if ( typeof evt_handler == 'function') evt_handler(e); 
        })
    })//End of registering all events 
  
    if ( options.is_input ) {
        var root = document.createElement("div");
        root.classList.add("row")
        var label = document.createElement("div")
        label.classList.add('label')
        label.innerHTML = options.label;
        element.classList.add("w-full","border","border-gray-300","border-solid","focus:border-primary-500");
        root.appendChild(label)
        root.appendChild(element)
        element = root; 
    }
    children.forEach( child =>{
      if ( child) element.appendChild( child )
    })
    return element    
  }