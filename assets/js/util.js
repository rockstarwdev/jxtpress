
import Media from "./media";
//import el from "./el"
import keepRelative from "./keep-relative";
import chk from "./chk";
import notify from "./notify";
import el2 from "./el2";
import { useMainStore } from "~/store";
 



let keep_relative  = keepRelative;


let  day_names = [{ name : "Sunday", short : "SUN"},
{name : "Monday", short: "MON"},{name : "Tuesday",short:"TUE", },
{name : "Wednesday",short:"WED"},{name: "Thursday",short:"THU"},
{name : "Friday", short: "FRI"}, { name : "Saturday", short: "SAT"}
]
let month_names = [
{name: "January",short:"JAN"},{name: "February",short:"FEB"},{name: "March",short:"MAR"},
{name: "April",short:"APR"},{name: "May",short:"MAY"},{name: "June",short:"JUN"},
{name: "July",short:"JUL"},{name: "August",short:"AUG"},{name: "September",short:"SEP"},
{name: "October",short:"OCT"},{name: "Novemember",short:"NOV"},{name: "December",short:"DEC"},
]




/**
 * Open a code editor 
 * @param {Object} options { title, value : code for editor }
 * @returns 
 */
let code_editor = ( options ={})=>{
  return new Promise( (resolve, reject)=>{

    let code_modal= document.querySelector("#code-modal");

    let ace_editor = null; 
    let editor_id = "jxt-ace-code-editor"
    let start_code_editor = ()=>{
      var el_editor_title = document.querySelector(".modal .code-title")
      var el_editor = document.querySelector("#"+editor_id);
      el_editor.classList.add('code-editor')

      ace_editor = ace.edit( editor_id, {
        mode: "ace/mode/javascript",
        selectionStyle: "text"
      } );
      
      if ( options.value != undefined && options.value != null ) {
        ace_editor.setValue( options.value )
      }

      if ( el_editor_title && options.title ) {
        el_editor_title.innerText = options.title 
      }else {
        el_editor_title.innerText = ""
      }
      //editor.setTheme("ace/theme/monokai"); 
      window.ace_editor = ace_editor 

    }


    if ( ! code_modal ) {
      code_modal = document.createElement('main')
      code_modal.id = 'code-modal'
      code_modal.classList.add ( 'modal','code-modal');
      code_modal.innerHTML = `
        <section class="wrapper" style="min-width: 95%">
          <header class="title code-title text-lg ml-10 font-extrabold color-primary-600 pl-5">
          </header>
          <div class="content">
            <div id="${editor_id}"></div>
          </div>
          <footer class="footer flex gap-2 justify-end">
            <button class="modal-cancel button cancel danger" type="button">Cancel</button>
            <button class="modal-ok button primary " type="button">OK</button>
          </footer>
        </section>
      ` 
      document.body.appendChild( code_modal ) 
      setTimeout( ()=> start_code_editor () , 200 )
    }else { 
      start_code_editor() 
    }
    util.open_modal({ id : code_modal }).then((res)=>{ 
      resolve({ value : ace_editor.getValue (), action: res.action  })
    })
  })
}


let since = (input_date, ref_date=null) => {
    if (! input_date) throw new Error("An input date is required for function 'since'")

    //For both "input_date" and ref_date, ensure they are Date objects, if not convert string to date object
    if ( ! input_date.toTimeString) input_date = new Date ( input_date )
    var reference_point = null; 
    if ( ref_date ) {
      if ( ! ref_date.toTimeString) ref_date = new Date( ref_date )
    } else  reference_point =  new Date()

    //Convert the date object to seconds
    const seconds = Math.floor(( reference_point - input_date) / 1000);

    let interval = Math.floor(seconds / 31536000);
 
    if (interval > 1) {
      return interval + ' years ago';
    }

    interval = Math.floor(seconds / 2592000); 
    if (interval > 1) { 
      return interval + ' months ago';
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + ' days ago';
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + ' hours ago';
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + ' minutes ago';
    }

    if(seconds < 10) return 'just now';

    return Math.floor(seconds) + ' seconds ago';
};

let unwrap_element = (element)=>{
  while (element.firstChild) {
    element.parentNode.insertBefore(element.firstChild, element)
  }
  element.parentNode.removeChild(element)
}
let wrap_element = ( rng, with_this_element )=>{
  rng.surroundContents(with_this_element)
}

 //util.get_font_list ( component_props.options.fonts )
 let get_font_list = (fonts_names) => { 
     var font_list = [
       { title : "Default", value : "" },
       { title : "Helvetica", value : "Helvetica,sans-serif" },
       { title : "Arial", value : "arial,sans-serif" },
       { title : "Arial Black", value : "Arial Black,sans-serif" },
       { title : "Verdana ", value : "Verdana,sans-serif" },
       { title : "Tahoma ", value : "Tahoma,sans-serif" },
       { title : "Trebuchet", value : "Trebuchet,sans-serif" },
       { title : "Impact", value : "Impact,sans-serif" },
       { title : "Gill Sans", value : "Gill Sans,sans-serif" },
       { title : "Times New Roman", value : "Times New Roman,sans-serif" },
       { title : "Georgia", value : "Georgia,sans-serif" },
       { title : "Palatino", value : "Palatino,sans-serif" },
       { title : "Baskerville", value : "Baskerville,sans-serif" },
       { title : "Andalé Mono", value : "Andalé Mono,monospace" },
       { title : "Courier", value : "Courier,monospace" },
       { title : "Lucida", value : "Lucida ,monospace" },
       { title : "Monaco", value : "Monaco,monospace" },
       { title : "Bradley Hand", value : "Bradley Hand,cursive" },
       { title : "Brush Script MT", value : "Brush Script MT,cursive" },
       { title : "Luminari", value : "Luminari,fantasy" },
       { title : "Comic Sans MS", value : "Comic Sans MS,cursive" },  
   ]
   if ( Array.isArray(fonts_names) ) {
     fonts_names.forEach(font_name =>{
           if ( typeof font_name != 'string') return; 
           font_list.push({ title : font_name, value : font_name })
       })
   }
   return font_list
 }


let create_text_action_bar = ({ rect, sel, rng, text, pressed_element })=>{
  var clz = "text-action-bar"
  var action_bar = document.querySelector(`.${clz}`);
  var view_list , view_advance;
  let consume = (e) => {  e.preventDefault(); e.stopPropagation() ;  }

  let signal_change = (node)=>{
    var root_editable = node.parentElement.closest(".editable");
    if ( root_editable ) {
      util.trigger("change", root_editable,{value : root_editable.innerHTML })
      root_editable.focus()
    }
  }
  let selected_node = null;
  let open_advanced_view = null; 
  if ( !action_bar) {
    action_bar = document.createElement("main");
    action_bar.classList.add(clz, "p-2","shadow","z-500",
                  "bg-white","user-select-none","rounded")
    action_bar.style.minWidth = "250px"
    action_bar.style.minHeight= "42px"
    action_bar.style.position = "fixed"
    document.body.appendChild(action_bar )
    action_bar.addEventListener("pick-node", (e)=>{//
      var node = e.detail.node //node that was double clicked
      selected_node = node; 
      open_advanced_view  ( node ) 
    })

    let show_advanced = (state)=>{
      if ( state ) { 
        view_list.style.display = 'none'
        view_advance.style.display="flex"
      }else {
        view_list.style.display = 'flex'
        view_advance.style.display="none"
      }

      if ( selected_node ){ 
        var c_style = window.getComputedStyle(selected_node)
        var font_name =  c_style.fontFamily
        if ( font_name ) { 
          font_name = font_name.split(/,/gm);
          for(var i=0; i < font_name.length; i++)font_name[i] = font_name[i].trim();
          font_name = font_name.join(",") 
          i_fonts.value =font_name
        }
        var font_size = c_style.fontSize;
        trigger("set", i_fontsize, { value : font_size})
      }

    }

    view_list = document.createElement("div");
    view_list.classList.add("view-list","flex","gap-1","flex-wrap");
    action_bar.appendChild(view_list)


    open_advanced_view = (node)=>{
            if ( ! node ) return ; 
            show_advanced (true )
            rng.selectNode(  node ) 
            var back_arrow = document.createElement("button");back_arrow.classList.add("button", "sm", "mt-5");
            back_arrow.style.alignSelf="start"
            back_arrow.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            ` 
            back_arrow.addEventListener('click',()=> show_advanced(false));
            var content = document.createElement("div");content.classList.add("content","p-1", "flex-1");
            var row_url = document.createElement("div");row_url.classList.add("flex","gap-2", "mb-2")
            var ie_url = document.createElement("input");ie_url.placeholder="Link URL";
            ie_url.classList.add("border","border-gray-300", "focus:border-primary-500", "w-full")
            ie_url.dataset.title="URL"
            var ie_target_chk = el2('checkbox',{ classes:['sm'],   label: "New Tab",
                      value : node.getAttribute('target') == '_blank'})
            var ie_rel = document.createElement("select");ie_rel.classList.add("no-follow","border","border-gray-300", "focus:border-primary-500")
            ie_rel.dataset.title ="Rel Value"
            ie_rel.innerHTML=`
              <option value=""> ---- </option>
              <option value="nofollow">No Follow</option>
              <option value="noreferrer">No Referrer</option>
              <option value="tag">Tag</option>
              <option value="bookmark">Bookmark</option>
            `
            ie_rel.value = node.getAttribute("rel") || "";
            ie_rel.placeholder = "nofollow,noopener,noreferrer,..."

            var chk_target_label = ie_target_chk.querySelector("label.checkbox")
            var chk_target_blank = ie_target_chk.querySelector("input[type=checkbox]")
            //var ie_target
            ie_url.value = node.getAttribute("href") 
            row_url.appendChild(ie_url);

            var row_classes = document.createElement("div");row_classes.classList.add("flex","gap-2","mb-2")
            var ie_classes = document.createElement("textarea");ie_classes.classList.add("border","border-gray-300", "focus:border-primary-500", "w-full")
            ie_classes.dataset.title="Classes"
            ie_classes.style.minHeight='60px'
            ie_classes.value = node.className
            ie_classes.placeholder ="Classes"
            row_classes.appendChild( ie_classes )


            var row_checkmarks = document.createElement("div");row_checkmarks.classList.add("flex","gap-2","mb-2")
            row_url.appendChild(ie_target_chk);
            row_checkmarks.appendChild(ie_target_chk);
            row_checkmarks.appendChild(ie_rel)

          

            var row_ok = document.createElement("div");row_ok.classList.add("flex", "gap-2","justify-end");
            var bt_ok = document.createElement("button");bt_ok.classList.add("button","success", "sm")
            bt_ok.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          `
            var node_type = node.tagName.toLowerCase() 
            row_ok.appendChild(bt_ok)
            //OK Okay 
            bt_ok.addEventListener("click", ()=>{
              var classes = ie_classes.value
              var target = chk_target_blank.checked ? "_blank" : ""
              var rel = ie_rel.value 
              var url = ie_url.value 
              var data =  { classes, target, rel , url }

              if ( node_type == 'a') {
                node.setAttribute("href", data.url )
                node.setAttribute("target",data.target)
                node.setAttribute("rel", data.rel)
              }
              node.className = classes;
              open_advanced_view(false);
              
              signal_change(node )
              rng.selectNode( node )
              show_advanced( false )
            })//End of click event

            chk_target_label.addEventListener('click',(e)=>{
              consume(e);
              chk_target_blank.checked = !chk_target_blank.checked 
            })
            
            if ( node_type == 'a'){ 
              content.appendChild(row_url);
              content.appendChild(row_checkmarks);
            }
            content.appendChild(row_classes);
            content.appendChild(row_ok);

            view_advance.innerHTML = ``
            view_advance.appendChild(back_arrow)
            view_advance.appendChild(content)
    }


    // Create Links
    var i_anchor = document.createElement("button");
    i_anchor.classList.add("button", "user-select-none", "sm" );
    i_anchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
    stroke-width="2.5" stroke="currentColor" class="w-4 h-4  ">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>`
    i_anchor.addEventListener("click", (e)=>{ // Manage the link setting
      consume(e) 
      if ( rng.startContainer.tagName =='A'  ){
        unwrap_element( rng.startContainer ) 
        return 
      }
      var new_link = document.createElement("a");
      new_link.href = "/" 
      new_link.target = "" 
      wrap_element(rng, new_link)
      signal_change(new_link)
    })


    var i_strike = document.createElement("button")
    i_strike.classList.add("button","user-select-none","sm")
    i_strike.innerHTML =`<svg style="transform: scale(0.85)" width="20" height="20" focusable="false"><g fill-rule="evenodd"><path d="M15.6 8.5c-.5-.7-1-1.1-1.3-1.3-.6-.4-1.3-.6-2-.6-2.7 0-2.8 1.7-2.8 2.1 0 1.6 1.8 2 3.2 2.3 4.4.9 4.6 2.8 4.6 3.9 0 1.4-.7 4.1-5 4.1A6.2 6.2 0 0 1 7 16.4l1.5-1.1c.4.6 1.6 2 3.7 2 1.6 0 2.5-.4 3-1.2.4-.8.3-2-.8-2.6-.7-.4-1.6-.7-2.9-1-1-.2-3.9-.8-3.9-3.6C7.6 6 10.3 5 12.4 5c2.9 0 4.2 1.6 4.7 2.4l-1.5 1.1Z"></path><path d="M5 11h14a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" fill-rule="nonzero"></path></g></svg>`
    i_strike.addEventListener("click",(e)=>{
      consume(e);
      var new_strike = document.createElement("s");
      wrap_element(rng, new_strike)
      signal_change(new_strike)
    })

    var i_bold = document.createElement("button");
    i_bold.classList.add("button", "user-select-none","sm");
    i_bold.innerHTML = `<svg style="transform:scale(0.85)" width="20" height="20"  focusable="false"><path d="M7.8 19c-.3 0-.5 0-.6-.2l-.2-.5V5.7c0-.2 0-.4.2-.5l.6-.2h5c1.5 0 2.7.3 3.5 1 .7.6 1.1 1.4 1.1 2.5a3 3 0 0 1-.6 1.9c-.4.6-1 1-1.6 1.2.4.1.9.3 1.3.6s.8.7 1 1.2c.4.4.5 1 .5 1.6 0 1.3-.4 2.3-1.3 3-.8.7-2.1 1-3.8 1H7.8Zm5-8.3c.6 0 1.2-.1 1.6-.5.4-.3.6-.7.6-1.3 0-1.1-.8-1.7-2.3-1.7H9.3v3.5h3.4Zm.5 6c.7 0 1.3-.1 1.7-.4.4-.4.6-.9.6-1.5s-.2-1-.7-1.4c-.4-.3-1-.4-2-.4H9.4v3.8h4Z" fill-rule="evenodd"></path></svg>`
    i_bold.addEventListener("click", (e)=>{
      consume(e);
      var bold = document.createElement("strong");
      wrap_element(rng, bold)
      signal_change(bold)
    })

    var i_italic = document.createElement("button");
    i_italic.classList.add("button", "user-select-none","sm");
    i_italic.innerHTML = `<svg style="transform:scale(0.85)" width="20" height="20" focusable="false"><path d="m16.7 4.7-.1.9h-.3c-.6 0-1 0-1.4.3-.3.3-.4.6-.5 1.1l-2.1 9.8v.6c0 .5.4.8 1.4.8h.2l-.2.8H8l.2-.8h.2c1.1 0 1.8-.5 2-1.5l2-9.8.1-.5c0-.6-.4-.8-1.4-.8h-.3l.2-.9h5.8Z" fill-rule="evenodd"></path></svg>`
    i_italic.addEventListener("click", (e)=>{
      consume(e);  
      var italic = document.createElement("i");
      wrap_element(rng, italic)
      signal_change(italic)
    })


    var i_span = document.createElement("button");
    i_span.classList.add("button", "user-select-none","sm");
    i_span.innerHTML = `span`
    i_span.addEventListener("click", (e)=>{
      consume(e);  
      var span = document.createElement("span");
      wrap_element(rng, span)
      signal_change(span)
    })

    var i_remove = document.createElement("button");
    i_remove.classList.add("button", "user-select-none","sm", "color-red-500");
    i_remove.dataset.title ="Unwrap element"
    i_remove.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
  `
    i_remove.addEventListener("click", (e)=>{
      consume(e);   
      if ( pressed_element )  unwrap_element(pressed_element )
    })

    let store = useMainStore()
    let fonts = get_font_list(store.custom_font_names )
    var i_fonts = document.createElement("select");
    i_fonts.classList.add("sm","hover:bg-gray-200")
    i_fonts.style.width="6.75em"


    fonts.forEach( F =>{
      var o = document.createElement("option");
      o.setAttribute("value", F.value )
      o.style.fontFamily = F.value 
      o.innerHTML = F.title 
      i_fonts.appendChild  ( o )
    })

    i_fonts.addEventListener('change',(e)=>{
      var fnt_value = e.target.value; 
      var the_node = null; 
      if ( rng.startContainer ==  rng.endContainer && rng.startContainer.classList?.contains("font")){
        selected_node = rng.startContainer 
      } 

      //selected_node
      if ( selected_node && selected_node.classList ) {
        selected_node.classList.add("font")
        the_node = selected_node;
      }else {
        var the_node = document.createElement("span");
        the_node.classList.add("font");
        wrap_element(rng, the_node) 
        selected_node = the_node
      }
      the_node.style.fontFamily = fnt_value 
      signal_change(the_node)
    })

    let i_fontsize = el2("duplex", {
      onClick(e){  },
      onChange(e){
        if ( ! e.detail ) return; 
        if ( e.detail.str == '--' || !e.detail.num) return 

        var val = e.detail.value; 
        var the_node = null; 
        if ( rng.startContainer ==  rng.endContainer && rng.startContainer.classList?.contains("font")){
          selected_node = rng.startContainer 
          console.log ("using range.start")
        }  
          
        //selected_node
        if ( selected_node && selected_node.classList ) {
          selected_node.classList.add("font-size")
          the_node = selected_node;
          console.log (" * is element")
        }else {
          var the_node = document.createElement("span");
          the_node.classList.add("font-size");
          wrap_element(rng, the_node) 
          selected_node = the_node
          console.log (" * not element")
        }
        the_node.style.fontSize = val 
        signal_change(the_node)
        setTimeout(()=>{
           
          var sels = window.getSelection() 
          sels.removeAllRanges ();
          sels.addRange( rng )
        },100)
      }
    })
    view_list.appendChild(i_anchor  )
    view_list.appendChild(i_strike  )
    view_list.appendChild(i_bold    )
    view_list.appendChild(i_italic  )
    view_list.appendChild(i_span    )
    view_list.appendChild(i_fonts   ) 
    view_list.appendChild(i_fontsize   ) 
    view_list.appendChild(i_remove  )
    
    //create andvance view
    view_advance = document.createElement("div");
    view_advance.classList.add("advance-view","flex","gap-2","flex-wrap");
    action_bar.appendChild(view_advance)
    action_bar.addEventListener('click',(e)=>consume(e))
  }else {
    view_list     = action_bar.querySelector(".view-list")
    view_advance  = action_bar.querySelector(".advance-view")
  }
  //Create the controls and their functionalities
  window._rng = rng 

  //Used to propertly postion  context window
  var momentary_delay = ()=>{
      var bar_rect = action_bar.getBoundingClientRect();

      var px = (val) => val + "px"
      var centered_offset = bar_rect.width * 0.5  
      var vertical_offset = 10;
      action_bar.style.left = px ( rect.left - centered_offset)
      action_bar.style.top = px( rect.top + rect.height + vertical_offset )

  }
  setTimeout( momentary_delay , 75)

  return action_bar
}
let initalize_select = (select)=>{ 
  if (!select) return; 
  if (!select.classList.contains('select')) return; 
  if (select.classList.contains('s-select')) return; 
  var values = select.querySelector(".values");
  var selected = select.querySelector(".selected");
  if ( ! values || !selected) return; 

  var rect = selected.getBoundingClientRect() 

  var d = JSON.parse(select.getAttribute("value")) ; 
  if (!Array.isArray(d)) d = [ d ];

  d.forEach(val=>{// Loop each value and make sure their is a selected item to reprsent it
      var selector = `[value="${val}"]`
      var opt     = values.querySelector(selector)
      if ( ! opt ) return ; 

      var el_val  = selected.querySelector(`[value="${val}"]`);
      if ( !el_val) {
          el_val = document.createElement('span');
          el_val.setAttribute('value', val);
          var display = opt.getAttribute("label") || opt.getAttribute("display");
          el_val.innerHTML = (display) ? display : opt.innerHTML;
          selected.appendChild(el_val)
      }
  })
  //remove items that are in the values container
  for ( var i =0; i < selected.children.length; i++){
      let child = selected.children[i];
      let value = child.getAttribute('value') 
      if ( value==null) child.remove(); 
  }
  //customize values
  for(var i=0; i < values.children.length; i++){
      values.children[i].classList.add('ripple' , 'is-dark')
  }
}

/**
     * Fire a new event
     * @param {String} event_name Generate a new event named per argument
     * @param {HTMLElement} el the Element this event is triggered on
     * @param {*} event_body Additional data to pass to the event
     * @param {*} bubbles 
     */
function trigger(event_name, el, event_body, bubbles, nullable_window = window , x, y){
  if ( ! el ) return;
  if ( !el.dispatchEvent) return;
  if ( ! event_name) return; 
  if ( bubbles === null || bubbles === undefined ) bubbles = true; 
  event_body = event_body || {};
  var event = null;
  switch(event_name){
      case "mousemove":
      case "mouseover":
      case "mouseenter":
      case "mouseleave":
      case "mousedown":
      case "mouseup":
      case "dragstart":
      case "drop":
      case "dragover":
      case "dragenter":
      case "dragleave":
      case "dragend":
      case "drag":
      case "show-tooltip":

      var event = new MouseEvent(event_name, {
            view: nullable_window,
            bubbles ,  cancelable: true,
            detail : event_body,
            clientX: x || 0, clientY : y||0
        });

 
          break;
      default:     
          event = new CustomEvent(  event_name, { "detail": event_body , bubbles }  );
  }
  
  el.dispatchEvent( event );// Dispatch/Trigger/Fire the event
  return event; 
}
function selection_properties(sel){
  var prop = { length: 0, parent }
  if (! sel) return prop;
  if ( Array.isArray(sel)){
    prop.length = sel[0].endOffset - sel[0].startOffset
    prop.parent = sel[0].endContainer.parentElement
    return prop
  }else {
    prop.length = sel.extentOffset - sel.anchorOffset
    prop.parent = sel.baseNode.parentElement
    return prop
  }
}
function selection_save() {
  if (window.getSelection) {
      var sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
          var ranges = [];
          for (var i = 0, len = sel.rangeCount; i < len; ++i) {
              ranges.push(sel.getRangeAt(i));
          }
          return ranges;
      }
  } else if (document.selection && document.selection.createRange) {
      return document.selection.createRange();
  }
  return null;
}

function selection_restore(savedSel) {
  if (savedSel) {
      if (window.getSelection) {
          var sel = window.getSelection();
          sel.removeAllRanges();
          for (var i = 0, len = savedSel.length; i < len; ++i) {
              sel.addRange(savedSel[i]);
          }
      } else if (document.selection && savedSel.select) {
          savedSel.select();
      }
  }
}
/**
 * Auto Create an HTML Modal element using content (String, HTML, etc) which will be placed in the auto created 
 * wrapper for the HTML element
 * @param {Object} options { title, content : String|Array of Elements, ok : String, cancel:String }
 * @returns 
 */
let gen_modal = (options)=>{
  if ( !options.content) return null; 

  let wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');

  if ( options.style){
    for(var key in options.style){
      wrapper.style[key] = options.style[key]
    }
  }
  if ( typeof options.content == 'string'){ 
    wrapper.innerHTML = 
    `
      <div class="title">${options.title ||""}</div>
      <div class="content">${options.content}</div>
      <div class="footer flex gap-2 justify-end">
        ${options.cancel ? '<button class="button danger red flat modal-cancel">' + (options.cancel ||'Cancel') +'</button>' : ''}
        ${options.ok ? '<button class="button primary primary flat modal-ok">'+(options.ok || "Ok")+'</button>' : ''}
      </div>
    `
  }else {
    if ( ! Array.isArray(options.content.classList) ) { 
      if ( ! options.content.classList ) return null; 
      wrapper.appendChild ( options.content )
    }else {
      for ( var i =0 ; i < options.content.length; i++ ){ 
        if ( options.content[i].classList )
          wrapper.appendChild ( options.content[i] )
      }
    }
  }
  
  let modal = document.createElement('div');
  modal.classList.add('modal');
  modal.appendChild(wrapper)
  document.body.appendChild(modal)
  return modal
}
const random_str = function(length = 6) {
  return Math.random().toString(36).substring(2, length+2);
}; 

let util = {
  get_color_list (){
    return [
      { title : 'White',        value : '#FFFFFF69'},
      { title : 'Red',          value : '#f80404a1'},
      { title : 'Orange',       value : '#f85704a1'},
      { title : 'Orange-Yellow',value : '#f8b204a1'},
      { title : 'Yellow',       value : '#f8f304a1'},
      { title : 'Yellow-Green', value : '#bbf804a1'},
      { title : 'Green',        value : '#18f804a1'},
      { title : 'Cyan',         value : '#04f8c5a1'},
      { title : 'Light Blue',   value : '#04b0f8a1'},
      { title : 'Purple',       value : '#7911d2a1'},
      { title : 'Magenta',      value : '#c011d2a1'},
      { title : 'Pink',         value : '#dd0f9da1'}, 
      { title : 'Black',        value : '#00000069'}
    ]
  },
  cast_num(val, initial=0){
    if ( val == null) return null 
    if ( !isNaN(val)) return Number.parseFloat(val)
    else return initial
  },
  random_str, notify, since,
  lz (val){
    if (val == null || val==undefined||  isNaN(val) ) return '00';
    return String(val).padStart(2,'0')
  },
  el : el2 , selection_save,selection_restore,selection_properties, 
   ready(fn) {
        var doc=document; var rt="readyState"; 
        if ( ["complete","interactive"].includes(doc[rt])) { 
            setTimeout(fn, 1);
        } else {
            doc['addEventListener']("DOMContentLoaded", fn);
        }
    },
    initialize_all_select(){
        var select_ui = document.querySelectorAll(".select");
        select_ui.forEach( initalize_select)
    },
     chk,keep_relative,
    log (... arg){
      console.log(">>", ... arg )
    },
    error (... arg){
      console.error("x>", ... arg )
    },
    /**
     * Examines two objects to determine the different between the two.
     * @param {Object} original 
     * @param {Object} current 
     */
    diff ( original, current){
      if ( ! original) return null;
      if ( ! current ) return null; 
      var base = original;
      var curr = current; 
      
      //Get the base keys, and add in keys in current that are not in base
      var keys = Object.keys(base);
      Object.keys(curr).forEach( k =>{
        if ( !keys.includes(k)) keys.push(k);
      })

      // The plase to store output
      let out = {};
      //Now loop the keys and compare base to curr
      for(var i =0, k =""; i < keys.length; i++){
         k = keys[i];
         if ( base[k] != curr[k]){
            if ( curr[k] == undefined) continue;
            var use_curr = true; 
            if ( typeof curr[k] == 'object' && typeof base[k] == 'object') {
               // is one an array and the other is an object
               if ( (Array.isArray(curr[k]) && ! Array.isArray(base[k])) ||
                    (Array.isArray(base[k]) && ! Array.isArray(curr[k])) ) {
                      out[k] = curr[k]; 
                      //use_curr = true;
               }else {
                  if (!Array.isArray(curr[k]) && !Array.isArray(base[k])){ 
                    //both are not array 
                  }else {
                    // both are most likey an array
                  }
               }
            } 
            if ( use_curr )  out[k] = curr[k];
         }else {
            //they are the same
            if ( k.toLowerCase() =='id'){
              out[k] = curr[k];
            }
         }
      }
      return out; 
    },
    round (num, places=2){
      return parseFloat( parseFloat(num).toFixed(places))
    },
    /*
    * A high order function ( takes functions as parameters and returns function) that
    * returns a function which will never be invoked until after the specified delay
    * as been reached.  
    * 
    * Debounce is ideal if the returned function will be invoked multiple times.  
    * 
    * To use the function.  Simply invoke the returned function
    */
    debounce( fn, timeout=400){
      let t; 
      return ( ... args)=>{ 
        clearTimeout(t); 
        t = setTimeout(async ()=>{ 
         await  fn.apply(this,args)
        },timeout )
      }
    },
    
    delegate (event_name, css_selector, callback_fn)  {
        if (!event_name || !css_selector || typeof callback_fn != 'function') return;
        let handler = (e) => {
            var e_target = e.target;
            e.target_actual = e_target;     //track element named as "css_selector"
            if (!e_target.matches(css_selector)) {
              var closest_match = e_target.closest(css_selector);
              if (!closest_match) return;   //exit handler function, if null
              if (!closest_match.contains(e_target)) return; //exit handler function, if target not within css_selector
              e.target_actual = closest_match;    //track the element named as "css_selector"
            }
            callback_fn(e);
        }
        // reference variables 
        let el_proxy = window.document.body;
        if (!Array.isArray(event_name)) event_name = [event_name];//force it to be an array

        let event_list      =   event_name;
        event_list.forEach(e_name => { 
          if ( e_name == 'mouseenter') e_name = 'mouseover';//make specific for .select element
          el_proxy.addEventListener(e_name, handler)
        });
        return () => {
            event_list.forEach(e_name => doc.removeEventListener(e_name, handler));
        }
    },
    use_ripple(){
        delegate('mousedown', '.has-ripple',(e)=>{
            var el              = e.target_actual;
            var parent          = el.parentElement;
 
            const x             =  e.offsetX
            const y             =  e.offsetY 
            const w             = el.offsetWidth;
            
            const ripple = document.createElement('span');
            ripple.style.pointerEvents = 'none'
            ripple.style.userSelect = 'none'
            
            ripple.className    = 'ripple';
            ripple.style.left   = x + 'px';
            ripple.style.top    = y + 'px';
            ripple.style.setProperty('--scale', w);
            e.target_actual.appendChild(ripple);
            setTimeout(() =>   ripple.parentNode.removeChild(ripple), 500);
        })
    },
    use_navigation(){
        delegate('click', 'a', (e)=>{
            
            var event = new CustomEvent("navigation",{"detail": "Example of an event" });
            document.querySelectorAll(".s-drawer").forEach( (node)=>{
                node.dispatchEvent(event);
            });
            
        });
    }, 
    get_year_months ( year ) {
      var this_month = (new Date()).getMonth()+1

      var month_names = [
        {name: "January",short:"JAN"},{name: "February",short:"FEB"},{name: "March",short:"MAR"},
        {name: "April",short:"APR"},{name: "May",short:"MAY"},{name: "June",short:"JUN"},
        {name: "July",short:"JUL"},{name: "August",short:"AUG"},{name: "September",short:"SEP"},
        {name: "October",short:"OCT"},{name: "Novemember",short:"NOV"},{name: "December",short:"DEC"},
      ]
      return month_names.map ( (it,index) =>{
        it.month      = index + 1 ; 
        it.is_today   = it.month == this_month,
        it.year       = year 
        it.last_date  = (new Date(year, it.month, 0)).getDate()
        return it
      })
    },
    /**
     * Determine if event A overlaps event B      
     * @param {Date | EpochTimeStamp} a_start Event A start time
     * @param {Date | EpochTimeStamp} a_end Event A end time
     * @param {Date | EpochTimeStamp} b_start Event B start time
     * @param {Date | EpochTimeStamp} b_end Event B end time
     * @returns {Boolean} Indicate if any part of event A overlaps any part of event B
     */
    does_overlay  (a_start, a_end, b_start, b_end ) {
      if ( b_end < a_start) return false // event B starts before event A
      if ( b_start > a_end ) return false // event B starts after event A 

      return true            
    },
    format_mm_dd_yyyy_hh_mm (d){
      if (!d) throw new Error("Invalid date or date string supplied")
      if ( ! d.getHours) {
         d = new Date(d) 
      } 
      var mm = this.lz(d.getMonth()+1 )
      var dd = this.lz(d.getDate  ()  ) 
      var yy = this.lz(d.getFullYear())
      var HH = this.lz(d.getHours()   )
      var MM = this.lz(d.getMinutes() )
      var out =  `${mm}/${dd}/${yy} ${HH}:${MM}`
      return out 
    },

    format_mm_dd_yyyy (d){
      if (!d) throw new Error("Invalid date or date string supplied")
      if ( ! d.getHours) {
         d = new Date(d) 
      } 
      var mm = this.lz(d.getMonth()+1 )
      var dd = this.lz(d.getDate  ()  ) 
      var yy = this.lz(d.getFullYear()) 
      var out =  `${mm}/${dd}/${yy}`
      return out 
    },
    
    /**
     * Get an array representing the calendar date view that spans the last sunday of the preceeding
     * month relative to the supplied year and month and the first saturday adjacent to the supplied
     * month and year
     * @param {Number} year the year
     * @param {Number} month the month
     * @returns {Array} 
     */
    get_month_window ( year, month){
      if (month < 1) month = 1;
        if ( month > 12) month = 12;
        
        let target_month = new Date(year, month - 1, 1);

        let pm_month = month - 1 ;//pm=prior month
        let pm_year = year;       //pm=prior month
        if ( pm_month <= 0) { 
          pm_month = 12;
          pm_year--;
        }
        
        let prior_month = new Date(pm_year, pm_month ,1);//NOTE: do NOT do "pm_month - 1"
        prior_month.setDate(0)
        
        //console.log ( prior_month.getDate(), prior_month.getDay())
        //Loop until the prior-day is the last sunday of the molnth
        while(prior_month.getDay() != 0){
          prior_month.setDate( prior_month.getDate()-1)
        }
        prior_month.setHours(0,0,0)
        let nm_month = month + 1;//nm = next month
        let nm_year = year      ;//nm = next year
        if ( nm_month > 12){
          nm_month = 1;
          nm_year  ++ ;
        }
        
        let next_month = new Date(nm_year, nm_month-1, 1)
        while(next_month.getDay() != 6) {
          next_month.setDate(next_month.getDate()+1)
        }
        next_month.setHours(23,59,59)
        return  [ prior_month,  next_month ]    
      },
      get_week_window (year,month,date){
        var d = null; 
        if ( year && month && date  ){
          if ( month < 1 ) month = 1 
          if ( month > 12) month =  12;   
          d = new Date ( year, month-1,date);
        }else {
          if ( year.getHours ) d = year ; else d = new Date(year)
        }
        
        var it_back = new Date(d.getTime())
        it_back.setHours(0,0,0)
        var it_forw = new Date(d.getTime())
        while  ( it_back.getDay() != 0){
          it_back.setDate(it_back.getDate()-1)
        }

        while (it_forw.getDay() != 6){
          it_forw.setDate(it_forw.getDate()+1)
        }
        it_forw.setHours(23,59,59)
        return [ it_back, it_forw ]
      },
      get_week_dates(year, month, date){
        var span = this.get_week_window(year,month, date);
        var out = [] 
        var it = span[0];

        var val 
        let it_date, it_month,it_year
        let e_date  =span[1].getDate(), 
            e_month = span[1].getMonth(), 
            e_year  = span[1].getFullYear()
        let b_continue = true 
        do {
          it_date = it.getDate(); 
          it_month= it.getMonth();
          it_year= it.getFullYear()
          val = {
            date      : it_date, 
            day_index : it.getDay(),
            day_name  : day_names[it.getDay()],
            year      : it_year,
            month     : it_month+1,
            month_name: month_names[it_month],
            in_month  : true ,  
            local_date: `${this.lz(it_month+1)}/${this.lz(it_date)}/${this.lz(it_year)}`
          }
          out.push( val) ;
          it.setDate( it_date+1 )

          b_continue = it_month!= e_month || 
                  it_date != e_date || 
                  it_year != e_year 
                  
        }  while ( b_continue )
        return out 
      },
      /**
       * Add a certain amount of minutes to a date object
       * @param {Date} date JS Date object
       * @param {Number} minutes Number of minutes (positive or negative) to add to date
       * @returns {Date}
       */
      add_minutes(date, minutes){
        if ( ! date ) throw new Error("A Date object is expected")
        if ( ! date.getTime) throw new Error ("Date instance required")
        return new Date(date.getTime() + minutes*60000);
      },
      /**
       * Get the amount of minutes between two dates
       * @param {Date} start Starting point
       * @param {Date} end Ending point
       * @returns 
       */
      get_minute_diff(start,end){
        if ( ! start || ! end ) return 0 
        if ( !start.getTime || ! end.getTime ) throw new Error("Expected start and end time to be date objects")

        var diff_ms = end.getTime() - start.getTime(); // This will give difference in milliseconds
        var diff_min = Math.round(diff_ms * ms_to_min);
        return diff_min
    },
    /**
     * 
     * @param {Number} year the year
     * @param {Number} month the month
     * @returns {Array} Array of month days
     */
    get_month_dates (year, month) {
        if (month < 1) month = 1;
        if ( month > 12) month = 12;
        let date_cur_month = new Date(year, month-1, 1);//any date within the current month (less 1)
        var today = new Date()
        var today_month =today.getMonth()+1;
        var today_year  =today.getFullYear();
        var today_date  =today.getDate();
  
        let cur_month= date_cur_month.getMonth() + 1;
        let date_cur_month_end = new Date(date_cur_month.getFullYear(), cur_month, 0);
        let date_cur_month_first=new Date(date_cur_month.getFullYear(), cur_month, 0);
        let cur_month_end_date = (date_cur_month_end).getDate();
  
        var month_range = [], it;
        
        var pure_month = date_cur_month.getMonth();
        var pure_year = date_cur_month.getFullYear();
        for(var i =1; i < cur_month_end_date+1; i++){ //Loop each day of the month
          it = new Date(pure_year, pure_month, i)
          var day = {
              date : i, 
              day_index : it.getDay(),
              day_name : day_names[it.getDay()],
              year : it.getFullYear(),
              month : it.getMonth()+1,
              month_name : month_names[it.getMonth()],
              in_month : true , 
               
          };


          day.str_date = String(day.year) +  '-'+
                          String(day.month).padStart(2,'0') + '-'+
                          String(day.date).padStart(2,'0')
          day.local_date = String(day.month).padStart(2,'0') +"/"+
                        String(day.date).padStart(2,'0')+"/"+String(day.year) 
          day.obj = new Date(day.str_date)

          day.is_today = today_date == day.date && today_month == day.month && today_year == day.year 
  
          if ( i==1 && day.day_index != 0){//The first of the month is not sunday, capture prior dates 
            let prior_pure_year = pure_year;
            let prior_pure_month = pure_month - 1;
            if ( prior_pure_month < 0) { prior_pure_month = 11; prior_pure_year -- };
            let last_month = new Date(prior_pure_year, prior_pure_month+1, 0);
            let j = last_month.getDate(); 
            var max_attempts = 10;
            var attempt_count =0; 
            do {
              attempt_count++;
              if ( attempt_count > max_attempts) break; 
              var prior_it = new Date(prior_pure_year, prior_pure_month, j)
              var prior_day = {
                date : j, 
                day_index : prior_it.getDay(),
                day_name : day_names[prior_it.getDay()],
                year : prior_it.getFullYear(),
                month : prior_it.getMonth()+1,
                month_name : month_names[prior_it.getMonth()], 
              } 
              

              prior_day.str_date = String(prior_day.year) + '-'+
                                  String(prior_day.month).padStart(2,'0') + '-'+
                                  String(prior_day.date).padStart(2,'0')
              prior_day.obj = new Date(prior_day.str_date )
              prior_day.local_date = String(prior_day.month).padStart(2,'0') +"/"+
                                String(prior_day.date).padStart(2,'0')+"/"+String(prior_day.year) 

              prior_day.is_today =  today_date  == prior_day.date && 
                                    today_month == prior_day.month && 
                                    today_year  == prior_day.year 
          
              month_range.splice( 0, 0, prior_day )
              j--;
            } while(prior_it.getDay() != 0);
          }
          month_range.push(day )
          if ( i == cur_month_end_date){
            let next_pure_year = pure_year;
            let next_pure_month = pure_month + 1;
            if ( next_pure_month > 11) { next_pure_month = 0; next_pure_year ++ }; 
            let j = 1; 
            var max_attempts = 10;
            var attempt_count =0; 
            
            do {
              attempt_count++;
              if ( attempt_count > max_attempts) break; 
              var next_it = new Date(next_pure_year, next_pure_month, j)
              var next_day = {
                date : j, 
                day_index : next_it.getDay(),
                day_name : day_names[next_it.getDay()],
                year : next_it.getFullYear(),
                month : next_it.getMonth()+1,
                month_name : month_names[next_it.getMonth()],
                in_month : false, obj : it 
              }

              next_day.str_date = String(next_day.year) + '-' +
                                  String(next_day.month).padStart(2,'0') + '-'+
                                  String(next_day.date).padStart(2,'0')
              next_day.local_date = String(next_day.month).padStart(2,'0') +"/"+
                                  String(next_day.date).padStart(2,'0')+"/"+String(next_day.year) 

              next_day.obj = new Date( next_day.str_date)
              next_day.is_today = today_date  == next_day.date && 
                                  today_month == next_day.month && 
                                  today_year  == next_day.year 
  
              month_range.push(next_day )
              j++;
            } while(next_it.getDay() != 6);
          }
        } 
        return month_range
      },
      get_today(){
        const date = new Date();
        let d= String(date.getDate()).padStart(2, '0');
        let m = String(date.getMonth()+1).padStart(2,"0");
        let y = date.getFullYear();
        
        let hh = String(date.getHours()).padStart(2, '0')
        let mm = String(date.getMinutes()).padStart(2, '0')

        // we will display the date as DD-MM-YYYY 
        
        let today = `${y}-${m}-${d} ${hh}:${mm}`;
        return today
      },
      /** Given a string date, return a uniform object containing the individual parts of the date */
      get_date_parts(str_date){ 
        if ( typeof str_date != 'string') return null; 
        str_date = str_date.trim()
        var m = null; 
        let int = parseInt 
         //  yyyy-mm-dd hh:mm:ss
        var done =false; 
        var yyyy_mm_dd_hh_mm_ss = /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):?(\d{1,2})?/gm;
        m = yyyy_mm_dd_hh_mm_ss.exec(str_date);
        var parts = { 
            month:null, 
            year: null, 
            date : null, 
            hour : null, 
            minutes: null, 
            seconds : null, 
            fmt : null 
        };
        if (!done && m && m.length > 0){ 
           parts.year = int(m[1]);  parts.month = int(m[2]); parts. date = int(m[3]);
           parts.hour = int(m[4]);  parts.minutes = int(m[5]); parts. seconds = int(m[6]);
           parts.fmt = "Y-m-d H:i:s"
           done = true;   
        }


         //  yyyy-mm-dd 
        var yyyy_mm_dd_hh_mm_ss = /(\d{4})-(\d{1,2})-(\d{1,2})/gm;
        m = yyyy_mm_dd_hh_mm_ss.exec(str_date); 
        if ( !done && m && m.length > 0){
           parts.year = int(m[1]);  parts.month = int(m[2]); parts. date = int(m[3]);
           parts.hour = int(m[4]);  parts.minutes = int(m[5]); parts. seconds = int(m[6]);
           parts.fmt = "Y-m-d"
           done = true;   
        }
      

         //  yyyy-mm
         var yyyy_mm = /(\d{4})-(\d{1,2})/gm;
         m = yyyy_mm.exec(str_date); 
         if ( !done && m && m.length > 0){
            parts.year = int(m[1]);  parts.month = int(m[2]); parts. date = int(m[3]);
            parts.hour = int(m[4]);  parts.minutes = int(m[5]); parts. seconds = int(m[6]);
            parts.fmt = "Y-m"
            done = true;   
         }
       

         //  mm-yyyy
         var mm_yyyy = /^(\d{1,2})-(\d{4})$/gm;
         m = mm_yyyy.exec(str_date); 
         if ( !done && m && m.length > 0){
            parts.year = int(m[2]);  parts.month = int(m[1]); parts. date = int(m[3]);
            parts.hour = int(m[4]);  parts.minutes = int(m[5]); parts. seconds = int(m[6]);
            parts.fmt = "m-Y"
            done = true;   
         }
       

        //  mm/dd/yyyy hh:mm:ss
        var mm_dd_yyyy_hh_mm_ss = /(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{1,2}):?(\d{1,2})?/gm;
        m = mm_dd_yyyy_hh_mm_ss.exec(str_date)
        if (!done &&  m && m.length > 0 ) {
           parts.year = int(m[3]);  parts.month = int(m[1]); parts. date = int(m[2]);
           parts.hour = int(m[4]);  parts.minutes = int(m[5]); parts. seconds = int(m[6]);
           parts.fmt = "m-d-Y H:i:s"
           done = true;   
        }
        
        //  mm/dd/yyyy hh:mm:ss
         mm_dd_yyyy_hh_mm_ss = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):?(\d{1,2})?/gm;
        m = mm_dd_yyyy_hh_mm_ss.exec(str_date)
        if (!done &&  m && m.length > 0 ) {
           parts.year = int(m[3]);  parts.month = int(m[1]); parts. date = int(m[2]);
           parts.hour = int(m[4]);  parts.minutes = int(m[5]); parts. seconds = int(m[6]);
           parts.fmt = "m/d/Y H:i:s"
           done = true;   
        }
        
         //  mm-dd-yyyy
         var mm_dd_yyyy = /(\d{1,2})-(\d{1,2})-(\d{4})/gm;
         m = mm_dd_yyyy.exec(str_date); 
         
         if ( !done && m && m.length > 0){
            parts.year = int(m[3]);  parts.month = int(m[1]);   parts. date = int(m[2]);
            parts.hour = int(m[5]);  parts.minutes = int(m[6]); parts. seconds = int(m[7]);
            parts.fmt = "m-d-Y"
            done = true;   
         }

         // mm/dd/yyyy
        var mm_dd_yyyy = /(\d{1,2})\/(\d{1,2})\/(\d{4})/gm;
        m = mm_dd_yyyy.exec(str_date)
        if (!done &&  m && m.length > 0 ) {
         
           parts.year = int(m[3]);  parts.month = int(m[1]); parts. date = int(m[2]);
           parts.hour = int(m[4]);  parts.minutes = int(m[5]); parts. seconds = int(m[6]);
           parts.fmt = "m/d/Y"
           done = true;   
        }
       
        if ( parts.month && parts.date && parts.year) {
          parts.str_date = String(parts.year).padStart(2,'0') + '-'
                           String(parts.month).padStart(2,'0') + '-' 
                           String(parts.date).padStart(2,'0');
        }
        if ( isNaN(parts.hour))parts.hour = null;
        if ( isNaN(parts.minutes))parts.minutes = null;
        if ( isNaN(parts.seconds))parts.seconds = null;
        if ( isNaN(parts.date))parts.date = null;
        if ( isNaN(parts.year))parts.year = null;
        if ( isNaN(parts.month))parts.month = null; 

        return parts;
      },
      format_date(fmt, parts){
        let mon_str = ["Jan", "Feb","Mar","Apr","May","Jun",
                       "Jul","Aug","Sep","Oct","Nov","Dec"]
        let mon_STR = ["January", "Febuary","March","April","May","June",
                       "July","August","September","October","November","December"]
        if (parts.year !=null) fmt = fmt.replace(/Y/gm,parts.year);
        if (parts.year !=null) fmt = fmt.replace(/y/gm,(parts.year+"").substring(2,4));
        if (parts.month !=null) fmt = fmt.replace(/M/gm, mon_str[ parts.month -1]);
        if (parts.month !=null) fmt = fmt.replace(/F/gm, mon_STR[ parts.month -1]);
        if (parts.month !=null) fmt = fmt.replace(/m/gm,   parts.month < 10 ? '0'+parts.month : parts.month  );
        if (parts.date !=null) fmt = fmt.replace(/d/gm,   parts.date < 10 ? '0'+parts.date : parts.date  );
        if (parts.date !=null) fmt = fmt.replace(/j/gm,   parts.date   );
        if (parts.hour !=null) fmt = fmt.replace(/g/gm,   parts.hour   );
        if (parts.hour !=null) fmt = fmt.replace(/H/gm,   parts.hour < 10 ? '0'+parts.hour:parts.hour   );
        if (parts.minutes !=null) fmt = fmt.replace(/i/gm,   parts.minutes < 10 ? '0'+parts.minutes:parts.minutes   ); 
        if (parts.seconds !=null) fmt = fmt.replace(/s/gm,   parts.seconds < 10 ? '0'+parts.seconds:parts.seconds   );
        
        fmt = fmt.replace(/[YyMFmDdljgGHhis]/gm,'').trim();

        // Y = full numeric representation x
        // y = 2 digit year representation x
        // M = short textual represetation of month (Jan - Dec) x
        // F = Full textual represetation of month ( January - December) x
        // m = numeric represetation of a month ( 01 - 12 ) x
        // D = Textual represetation of day (Sun - Sat)             0 
        // d = Day of the month with leading zero ( 01 - 31 ) x
        // l = Full day textual representation                    no
        // j = Day of the month without leading zero ( 1 - 31 ) 
        // g = hours (1 - 12)
        // G = 24 hour ( 0 - 23 )
        // h = hours with leading zero ( 01 - 23 )
        // i = minutes with leading zero (00 - 59 )
        // s = seconds with leading zero ( 00 - 59)
        return fmt;
      },
      get_decade_span(year){
          var rule=10, sum = 0  
          var a = Math.floor( year / rule) * rule + sum
          var b = a + 10
          return [ a, b ] 
      },
 
    /**
     * Perform conversion of offset timezone (options.date) to UTC standard.   
     * @param {String|Number|Object} option { date: the to convert , offset : date's timezone source } 
     * @returns 
     */
    to_utc( options ){
      let { date : date_to_convert , offset } = options 
      if ( ! date_to_convert ) throw new Error("Unable to perform conversion - date to convert is null or missing" )
      if ( !  offset) throw new Error("Unable to complete conversion - offset is missing or null")
      var type = typeof date_to_convert 
      var d = ['string','number'].includes(type) ? new Date(date_to_convert) : date_to_convert 
 
      var cur_offset = d.getTimezoneOffset()
      if ( cur_offset == offset ) return d //return the current object; there is no need to convert

      //Deal with dates in milliseconds for most accuracy
      var utc = d.getTime() + ( cur_offset * 60000);
      var d_with_offset = new Date(utc + (3600000*offset));
      
      return d_with_offset 
      },
      utc_to_local( options ){
        var { date } = options  
        return this.to_utc({ date , offset : useCookie('stz').value || 1  })
      },
      /** Unify events */
      unify (e){
        let x, y;
        if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
            var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
            var touch = evt.touches[0] || evt.changedTouches[0];
            x = touch.pageX;
            y = touch.pageY;
        } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
            x = e.clientX;
            y = e.clientY;
        }
        return { x, y }
    },
    click_outside(root, on_click_outside_fn, exceptions){
      let listen = async (e)=>{
          var target = e.actual_target || e.target;



          if ( target != root && !root.contains(target)){ 
              var allow = true; 

              if ( Array.isArray (exceptions)) {//see if we need to cancel`
                for ( var i =0; i < exceptions.length; i++){
                  if ( typeof exceptions[i] == 'function'){
                    var result= await exceptions[i](target,e);
                    if ( result == false){  allow = false; break; }
                    
                  }else {
                    if ( exceptions[i] == target || ( exceptions[i]&&exceptions[i].contains (target)) ){
                      allow = false; 
                      break; 
                    }
                  }
                  
                }
              }

              if ( allow ){ 
                e.stopPropagation()  
                //Do your thing
                if ( typeof on_click_outside_fn == 'function') { 
                  var res = await on_click_outside_fn(e, false );
                  if ( res === false ) {  
                    return ; 
                  }
                }
                //clean up
                clean_up()
                trigger('blur',root, { manual_source : "on-click-outside"})
                trigger('click-outside', root, {})
              }else {
                console.log ("\t\t\tCOS canceled v1")
              }
          }//clicked outside of root
      }
       
      let clean_up = ()=>{   
        window.removeEventListener('click',listen);
      }
      setTimeout(()=> window.addEventListener('click',listen) ,1)
      return clean_up
    },
    trigger ,

    expand_pagination(options ){ 
        let begin = [], end = []
        let cur = []
        var opt =  options || {pages: 1, p : 1}

        if ( opt.pages == opt.p && opt.p ==1) return [ ]
        if ( opt.pages == 1) return []

        var num_pages_before_after_current_page =2 ;
        var num_pages_begin_end = 2;
        var pre = []
        var post = []
        for ( var i =0,I=0; i < num_pages_before_after_current_page+1; i++ ){
            I = i+1; 
            if (opt.p - I  > 0 ) {
                pre.push({ p : opt.p - I, section: 'pre-current'})
            }
            if (opt.p + I < opt.pages+1){
                post.push({ p : opt.p + I , section : 'post-current'})
            }
        }
        cur = [ ... pre.reverse(), { p : opt.p, current :true } , ... post ]

        var max = (num_pages_begin_end)
        for (var i=0,I=0; i < num_pages_begin_end; i++){
            I=i+1
            if ( ! cur.find (it=> it.p == I))  begin.push ({ p :i+1 , section : 'beginning' })
            if ( ! cur.find (it=> it.p == opt.pages - max + i)){ 
              if ( opt.pages - max + i > 0)
              end.push({ p : opt.pages - max + i, section: 'ending'})
            }
        }
        var out = [];
        if ( begin.length > 0 ){
            out.push ( ... begin, { p : '...', empty:true } )
        }
        out.push( ... cur )
        if ( end.length > 0){
            out.push ( {p: '...', empty: true }, ... end )
        }
        return out 
    },
    /**
     * Insert HTML String into the current cursor position in any active text selection 
     * @param {String} html 
     */
    paste_html_at_cursor (html) {
      var sel, range;
      
      sel = window.getSelection();
      if (! sel.rangeCount)return ; //rangeCount is alway 1 and getRangeAt should always be 0
      
      //Get the current range, and remove anything it it
      //FYI methods: deleteContents(),extractContents() -return DocumentFragment,
      //             selectNode, insertNode
      range = sel.getRangeAt(0);
      range.deleteContents(); 
   
      var el        = document.createElement("div");
      el.innerHTML  = html;
          
      var frag      = document.createDocumentFragment(), node, last_child;
      while ((node = el.firstChild) ) {
          console.log ("NODe ", node )
          last_child = frag.appendChild(node);
      }
     
      range.insertNode(frag);
              
      // Preserve the selection
      if (last_child) {
        range = range.cloneRange();
        range.setStartAfter(last_child);
        range.collapse( );
        sel.removeAllRanges();
        sel.addRange(range);
      }
    },
    //Study ranages
    apply_editable_effects(element){
          let annouce_change =  ()=>{ 
              util.trigger('change',element, { value : element.innerHTML})
          }

          element.addEventListener('input',(e)=>{ 
              e.target.value = e.target.innerHTML
          })
          element.addEventListener('change',(e)=>{ 
              e.target.value = e.target.innerHTML
          })
          element.addEventListener('keyup',(e)=>{
              annouce_change()
          })
          element.addEventListener("selectstart",(e)=>{ 
              let selection = document.getSelection(); 
              let { anchorNode, anchorOffset, focusNode, focusOffset} = selection;
          
              // anchorNode and focusNode are text nodes usually
              let a =`${anchorNode?.data}, offset ${anchorOffset}`;
              let b = `${focusNode?.data}, offset ${focusOffset}`;
          })
          element.addEventListener("selectend",e=>{
              console.log("Selection ended")
          })

          let edit_context_bar = null; 
          let cancel_context_bar = (e)=>{
            if ( edit_context_bar) edit_context_bar.remove()
          }
        let element_pressed_on = null; 
          element.addEventListener("mouseup",(e)=>{
              let editor = e.target;
              //let doc = editor.ownerDocument.defaultValue;
              let sel = document.getSelection();
              let rng = sel.getRangeAt(0);   
              let rng_txt = rng.toString()
              if ( rng_txt.length == 0) { 
                return cancel_context_bar(); 
              }
              var rect = rng.getBoundingClientRect()

              edit_context_bar = create_text_action_bar({ 
                  pressed_element : element_pressed_on, 
                  rect, cancel : cancel_context_bar, sel, rng, text: rng_txt 
              });
              
          })
          element.addEventListener('click-outside', cancel_context_bar)
          element.addEventListener('keydown',(e)=>{
              let enter_key = 13, tab_key=9,del_key=8
              let code     = e.code; // ie: "KeyA"
              let key      = e.key; //ie: "A"
              var key_code = e.keyCode;// 32=space,8=backpace,46=del,27=esc,192=`, 16=shift,17=CTRL
              //e.keyCode=65 && ( e.ctrlKey (Boolean) ||shiftKey(Boolean) )

              if ( key_code == enter_key && !e.shiftKey){ 
                  var repeater = e.target.closest(".repeater");
                  var block_item = e.target.closest(".block-instance");
                  if ( repeater && block_item){
                      if ( block_item.contains( repeater )){
                          console.log ("Prevented spawining ")
                          return false; 
                      }
                  }
                  e.preventDefault();//prevent enter key
                  var blk_target = element.closest(".block-instance")
                  var id = blk_target.id; 

                  setTimeout(()=>{
                      var target_block = document.querySelector("#"+id)
                      console.log ("trigger new paragraph", target_block)
                      util.trigger('new_paragraph', target_block ,{})
                  },100) 
              }
              
              if ( key_code == tab_key){
                  insert_tab_to_editable(e)
              }
              if ( key_code == del_key){
                //  hnd_delete_text(e)
              }
          })
          
          element.addEventListener('click',(e)=>{
            element_pressed_on= null; 
              //If clicked within canvas editor, remove contentediable from all others
              var dcanvas = e.target.closest(".data-canvas");
              if ( dcanvas ){
                dcanvas.querySelectorAll("[contenteditable]").forEach(ce=>{
                  ce.removeAttribute("contenteditable")
                })
              }
              element_pressed_on = e.target;
              //re-apply content ediable to self
              element.setAttribute("contenteditable",true)
 
              util.click_outside(element, (e)=> {
 
                  element.setAttribute("contenteditable",false)
              }, [ edit_context_bar])//internally triggers a blur event
        })
        element.addEventListener('dblclick',(e)=>{

          //Determine what was clicked on
          var target = e.target;
          if ( target != element ){
              if ( ! edit_context_bar ){ 
                edit_context_bar = create_text_action_bar()
              }
              util.trigger("pick-node", edit_context_bar, { node: target }) 
          }
        })
  },//End of apply editable

    /**
     * Open (using existing modal that is on the page) or create (when option.id is not provided and content is provided instead) a
     * modal that is to be presented to the user
     * @param {Object} options { id : HTMLELement or CSS selector, before_ok : Function,
     *    content : HTMLElement or string content, get_data() , before_open }
     * @returns 
     */
    async open_modal(options){
      if ( ! options ) return false; 
      //Get handle to the Root Modal
      let el_target = options.id, auto_generated =false; 
      if ( ! el_target && options.content ) {
        
        el_target = gen_modal(options);
        
        auto_generated = true; 
      }
      if ( ! el_target) return false ;
      if ( ! el_target.classList){
        el_target = null;  
        try {el_target =document.querySelector("#"+options.id); }catch(e){}
        if (!el_target) el_target = document.querySelector(options.id);
        if (!el_target) el_target = options.id;
        if ( !el_target) return false; 
      }
      //If the Modal is currently active, exit otherwise make it active
      if ( el_target.classList.contains("active")) return false;
      el_target.classList.add("active")
      let $this=this;
      
      return new Promise((resolve,reject)=>{ 
        $this.trigger('open',el_target)
        if ( typeof options.before_open =='function'){
          options.before_open( el_target)
        }
        let wrapper = el_target.children[0];
        if ( ! wrapper ) {
          console.log ({ el : el_target, children : el_target.children })
        }
        var bt_ok = wrapper.querySelector(".modal-ok");
        var bt_cancel = wrapper.querySelector(".modal-cancel");
        
        let click_modal_bt = async (e)=>{ 
          var action = e.currentTarget == bt_ok ? 'ok' : 'cancel';
          var d = null; 

          
          if ( options.before_complete =='function' ) await options.before_complete( el_target) 
          
          if (  action =='ok' && typeof options.before_ok =='function'){
            if ( false == await options.before_ok( el_target) ){
              return false;
            }
          }
          if ( typeof options.get_data=='function') d= await options.get_data();
          close_out({ action , cancel : action =='cancel', d  })
          return true; 
        }
        let search_for_dynmic_modal_buttons = ()=>{
          var node_list = wrapper.querySelectorAll(".content .modal-ok, .content .modal-cancel")
          node_list.forEach(node=>{
            
              var x_click_wrapper = (x)=>{
                var out = click_modal_bt(x);
                if ( out ){ 
                  
                  node.removeEventListener('click', x_click_wrapper)
                }
              }
              node.addEventListener('click', x_click_wrapper)
          })
          return node_list.length

        }
        setTimeout(()=>{
          if ( search_for_dynmic_modal_buttons () == 0) {
            //search on more time
            setTimeout( search_for_dynmic_modal_buttons , 200 )
          }
        }, 500)
        if ( bt_ok) bt_ok.addEventListener('click', click_modal_bt)
        if ( bt_cancel) bt_cancel.addEventListener('click', click_modal_bt)

        let close_out = (result)=>{
          el_target.classList.add('closing')
          if(bt_ok)     bt_ok.removeEventListener('click', click_modal_bt);
          if(bt_cancel) bt_cancel.removeEventListener('click', click_modal_bt);
          
          resolve(result)
          $this.trigger('close',el_target, { detail : result })
          setTimeout(()=>{
            el_target.classList.remove('closing')
            el_target.classList.remove('active')
            if ( auto_generated ) el_target.remove() 
          }, 300)
        }


        let close_it = (e)=>{ 
          if (e.target != el_target  ){
            //e.stopPropagation() 
            //e.preventDefault()
            return;
          }
 
          close_out({ action: 'cancel', cancel:true })
          e.stopPropagation()
 
          el_target.removeEventListener("click",close_it)
        }
        el_target.addEventListener("click",close_it)
        /*$this.click_outside(wrapper, (e)=>{
          
        } )*/
      })
      
    },
    /**
     *
     * @param {Object} options { selected: Array Object{ id , url}, string URL with id query parameter, or Integer (ids) file(s) to select on open,   folder : String path to folder to view on open,
     *    cancel : Text for cancel, ok : Text for Ok, classes: Array of string classes, }
     * @returns 
     */
    async open_media (options){
      var media = new Media();

      return await this.open_modal({ 
          content     :  await media.open(options), 
          get_data : options.get_data,
          before_open : (modal)=>{
            modal.classList.add("fullscreen")
            var wrapper = modal.querySelector(".wrapper");
            if ( wrapper) wrapper.classList.add('flex', "flex-col", ...  options.classes || [])

            var close = el2('div',{classes:['footer','flex','justify-end','gap-4']},[
              el2('button',{classes:['button','red','flat', 'modal-cancel'],innerText: options.cancel||options.close ||"Cancel"}),
              el2('button',{classes:['button','green','solid', 'modal-ok', 'px-7'],innerText: options.ok|| options.confirm|| "OK"})
            ])
            wrapper.appendChild(close);
          },
          
      }) 
    },

  get_font_list ,
  aux_to_obj (aux) {
    if ( ! aux ) return {} 
    
    var rows = aux.split(/;/gm) 
    var parts = null; 
    var out = {}
    var key , value 
    for( var i=0; i < rows.length; i++){
        if (!rows[i])     continue
        parts = rows[i].split(/=/gm);
        if ( parts.length < 2) continue; 
        key = parts[0].trim() 
        value = parts[1].trim() || null 
        if ( value == 'null') value = null 
        if ( ! isNaN( value )) value = Number.parseFloat(value )
        out [ key  ] =  value 
    }
    return out 
  },
  obj_to_aux (obj){
    if ( ! obj ) return null; 
    var order = Object.keys(obj).sort()  
    var out = "";
    var key,value 
    for ( var i=0; i < order.length; i++){
      key = order[i]
      value = obj[key] || null 
      out += `${key}=${value}`
      if ( i < order.length-1) out += ";"
    }
    return out 
  },
  copy ( obj ) {
    if ( typeof obj == 'function') return null 
    try { 
    return JSON.parse(JSON.stringify( obj ))
    }catch(e){
      console.log(e, 'during', obj , 'copy')
    }
  },
  code_editor,


  /**
   * 
   * @param {String} rgb Convert a string RGB color to its individual parts "rgba(111,222,10,44)"
   * @returns {Object} Return an object with {r,g,b,a}
   */
  rgb_to_parts (rgb) {
 
    var parts = rgb.split("(");
    if ( ! parts || (parts && ! parts[1]) ) return { r : 0, g : 0, b: 0, a : 0 }
    var a = parts[1].split(")")[0];
    var parts = a.split(/[, ]/)
    //do lean up
    for ( var i=parts.length-1; i > -1; i--){
      if ( parts[i]=='') parts.splice(i,1)
    }
    var out = {}
    var keys = [ "r","g","b","a"]
 
    parts.forEach( (item,index)=>{
 
      out[ keys[index] ] = parseFloat (item)//use part float to allow parsing of alpha which is [0.0- 1.0]
    })
 
    return out 
  },

  /**
   * Converts a String hex color code to an RGB color object.
   * @param {string} hex - The hex color code to convert.
   * @returns {object} An object with the red, green, and blue components of the RGB color.
   */
  hex_to_rgb_parts(hex) {
    if ( hex.toLowerCase() == 'transparent') hex = `#00000000`
    // Remove the # character from the beginning of the hex code
    hex = hex.replace(/#/g, "");
    
    // Convert the red, green, and blue components from hex to decimal
    // you can substring instead of slice as well
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) || null 
    
    // Return the RGB value as an object with properties r, g, and b
    return {r, g, b, a};
  },

    /**
   * Given a string hexidecimal or rgb|a color, return the final color equivalent as an object with keeps {r,g,b,a}
   * @param {String} color "#AA00FF" or "rgb|a(14,233,175,33)"
   * @returns {Object} {r,g,b,a}
   */
    decompose_color_to_rgb(color){
      if ( ! color ) return null; 
      color = color.trim()
      if ( color.startsWith("#")) return this.hex_to_rgb_parts(color )
      else return this.rgb_to_parts(color)
    }
  
    
}

export default util 