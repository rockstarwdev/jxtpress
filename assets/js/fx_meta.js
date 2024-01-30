import el2 from "./el2";
import util from "./util";


export default function(){

    let special_names = ['_text','_string','_number',  '_datetime','_date','_bool','_arrobj','_arritem', '_color', '_lookup']
    let svg_bar = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
  </svg>
  `
    let svg_x = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
  `
    let svg_add = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
  `
    var dnd_state = {
        dragging : false,
        drag_index : -1,
        data : null 
    }
    let add_dnd_fx = (elem, obj, index)=>{
        elem.setAttribute('draggable',true)
        elem.addEventListener('dragstart',(e)=>{
        
            var row = e.target.closest(".row")
            e.dataTransfer.setDragImage(row, 0, 0);
            dnd_state.dragging = true; 
            dnd_state.drag_index = index
            dnd_state.data = obj 
            setTimeout(()=>{
            var value_field_el = e.target.closest(".value-field")
            value_field_el.classList.add("dnd-active")

            }, 120)
            //util.trigger("dragstart", row ) 
        })
        elem.addEventListener('dragend',(e)=>{
            dnd_state.dragging = false; 
            dnd_state.drag_index = -1
            dnd_state.data = null 

            
            document.querySelectorAll(".dnd-active").forEach(zone => zone.classList.remove("dnd-active"))
        })
    }  
    
    let create_placement = (root, index)=>{
        var p = document.createElement("div")
        p.classList.add("dnd-placement", "row") 

        p.addEventListener('dragover',(e)=>{
            e.preventDefault()
            p.classList.add("active")
        })
        p.addEventListener('dragleave',(e)=>{
            p.classList.remove("active")
        })
        p.addEventListener("drop",(e)=>{
            e.preventDefault();
            var valz = drop_item (root,  index)
            do_emit(root, valz) 
            util.trigger('refresh', root, { value : valz })
        })
        return p 
    } 
    let drop_item = (root, current_index)=>{ 
        var valz = get_fieldvalue(root);
        var existing_index = -1;
        if ( dnd_state.drag_index < valz.length){
            var ti = dnd_state.drag_index;
            if ( valz[ti] === dnd_state.data || 
                (valz[ti].name == dnd_state.data.name && 
                 valz[ti].value == dnd_state.data.value)
                ){
                    existing_index = ti;  
            }
        } 
        valz.splice(current_index, 0, dnd_state.data)
        if ( existing_index != -1){ 
            if ( existing_index > current_index) {
                existing_index++
                valz.splice(existing_index,1)
            }else {
                valz.splice(existing_index,1)
            }
        }
        document.querySelectorAll(".dnd-active").forEach(zone => zone.classList.remove("dnd-active"))
        return valz 
    }

    /** Create flow field for arritem or arrobj */
    let create__arr_row =(obj, index, type, root )=>{
        var row = document.createElement("div");row.classList.add('row','flex', 'gap-2', 'data',"relative","type-"+type )
         
        var x_el = document.createElement("button");
        x_el.classList.add("danger", 'color-red-500');
        x_el.innerHTML = svg_x 
        x_el.addEventListener('click', (e)=>{
            consume(e);
            var valz = get_fieldvalue(root);
            valz.splice(index, 1);
            util.trigger('refresh', root, {value : valz})
        })

        var name_el=null, value_el=null; 
        name_el = document.createElement("input");
        name_el.classList.add("name")
        name_el.type ="text";
        name_el.placeholder="property name"
        name_el.classList.add("w-1/2","w-full","border","border-gray-300","border-solid","focus:border-primary-500");
        if ( type == 'arrobj' ){
            name_el.value =  obj.name 
        }else{  
            name_el.value = typeof obj == 'string' ? obj : obj.name    
        }

        if ( type == 'arrobj'){ 
            value_el = document.createElement("input");
            value_el.classList.add("value")
            value_el.type ="text";
            value_el.placeholder="property value"
            value_el.classList.add("w-1/2","w-full","border","border-gray-300","border-solid","focus:border-primary-500");
            value_el.value = type == 'arrobj' ? obj.value : obj 
        }
 
        let on_change = (e)=> {
            consume(e);   do_emit(root, get_fieldvalue(root))
        }
        let on_input = (e)=> consume(e)
        
        name_el.addEventListener    ('input', on_input);
        name_el.addEventListener    ('change',on_change);
        if ( type == 'arrobj' ){ 
            value_el.addEventListener   ('input', on_input);
            value_el.addEventListener   ('change',on_change);
        }

        
        var drg_el = document.createElement("button");
        drg_el.classList.add("rearrange");
        drg_el.innerHTML =svg_bar 
        add_dnd_fx(drg_el, obj, index);

        var bt_wrap = document.createElement("div");
        bt_wrap.classList.add("control-wrap","opacity-30","hover:opacity-90")
        bt_wrap.appendChild(drg_el)
        bt_wrap.appendChild(x_el)


        
        row.appendChild( bt_wrap )
        var sub_row = document.createElement("div")
        sub_row.classList.add("flex", "flex-1", "gap-2");

        sub_row.appendChild( name_el )
        if ( value_el ) sub_row.appendChild( value_el )
        row.appendChild(sub_row)

        return row
    }

    let default_type  = "string"
    let do_emit = (root, value )=>{
        util.trigger("value-field-change", root, {value })
    }
    let consume =(e)=>{
        e.stopPropagation();
        e.preventDefault()
    }
    let force_string = (val )=>{
        
        if ( typeof val == 'object' && val != null){
            return typeof val != 'function' ? JSON.stringify(val) : null 
        }else {
            return val 
        }
        
    }
    let force_object = (val)=>{ 
        if ( typeof val == 'object' && val != null ) {
            return val;
        }else {
            try {
                return JSON.parse(val)
            }catch(e) {
                return val 
            }
        }
    }
    let create_valuefield  = (root, type, data_for_valuefield)=>{
        var element = root.querySelector(".value-field");
        root.classList.remove("multiplex")
        if ( !element) { 
            element = document.createElement("div");
            element.classList.add('value-field')
            root.appendChild(element)
        }
        special_names.forEach(name =>{
            name = name.substring(1);
            element.classList.remove(name);
        })
        element.innerHTML= ''
        element.classList.add(type)
        if ( type == 'string' || type == 'number') {
            var io = document.createElement("input")
            io.type = type =='string' ? 'text' : 'number'
            io.value = data_for_valuefield = force_string( data_for_valuefield ) 
            io.classList.add("w-full","border","border-gray-300","border-solid","focus:border-primary-500");
            io.addEventListener('input',(e)=>{
                consume(e);  do_emit(root, e.target.value )
            })
            io.addEventListener('change', (e)=>{ 
                consume(e);    do_emit(root, e.target.value)
            })
            io.addEventListener('blur', (e)=> consume(e)  )
            element.appendChild(io) 
        }else if ( type == 'text') {
            var io = document.createElement("textarea") 
            io.classList.add("w-full")
            io.style.minHeight = '96px'
            io.classList.add("w-full","border","border-gray-300","border-solid","focus:border-primary-500");
            io.value = data_for_valuefield = force_string( data_for_valuefield )
            io.addEventListener('input',(e)=>{
                consume(e); do_emit(root, e.target.value )
            })
            io.addEventListener('change', (e)=>{ 
                consume(e);  do_emit(root, e.target.value)
            })
            io.addEventListener('blur', (e)=> consume(e)  ) 
            element.appendChild(io) 
        }else if ( type == 'bool'){
            //if a string, convert said string to a boolean
            if (typeof data_for_valuefield == 'object'){
                data_for_valuefield = force_string(data_for_valuefield)
            }
            if ( typeof data_for_valuefield == 'string'){
                data_for_valuefield =  ['on','true','yes','ok'].includes(data_for_valuefield)
            }

            var io = el2("checkbox", {}, data_for_valuefield)
            io.addEventListener('change',(e)=>{
                consume(e) ;  do_emit(root, e.target.checked )
            })
            element.appendChild(io)
        }else if (type == 'datetime' || type == 'date'){ 
            var value = data_for_valuefield = force_string (data_for_valuefield)
            var io = el2(type , {  value      })
            element.addEventListener('change',(e)=>{
                consume(e) ; do_emit(root, e.detail.value)
            })
            element.appendChild( io )
        }else if (type == 'lookup'){ 
            var value = data_for_valuefield = force_object (data_for_valuefield)
            var io = el2('lookup' , {  value      })
            element.addEventListener('change',(e)=>{
                consume(e) ; do_emit(root, e.detail.value)
            })
            element.appendChild( io )
            setTimeout(()=> util.trigger('selected-value', io ,{}))
        }else if (type == 'color'){
            var value = data_for_valuefield =  force_string(data_for_valuefield )
            var io = el2('color' , {  value   })
            element.addEventListener('change',(e)=>{
                consume(e) ; do_emit(root, e.detail.value)
            })
            element.appendChild( io )
        }else if ( type == 'arrobj'){
            root.classList.add("multiplex")
            var control_box =  el2('div',{  classes:['w-full', 'row']  },
                    el2("button", {
                        classes: ['button', 'add'],
                        innerHTML: svg_add ,
                        onClick(e){
                            consume(e);
                            var valz = get_fieldvalue(root);
                            valz.push({ name : '', value : ''}) 
                            do_emit(root, valz)
                            util.trigger('refresh', root, { value : valz })
                        }
                    })
            );//End of control box
            element.appendChild(control_box)
             
            data_for_valuefield = force_object(data_for_valuefield)
 
            element.appendChild(create_placement(root, 0))
            var iter
            for ( var i=0; i < data_for_valuefield.length; i++){
                iter = data_for_valuefield[i];
                if ( typeof iter == 'string'){
                    iter = { name : iter , value : ""}
                }
                element.appendChild ( create__arr_row(iter,i, type, root)  )
                element.appendChild(create_placement(root, i+1))
            }
        }else if ( type == 'arritem'){
            root.classList.add("multiplex")
            var control_box =  el2('div',{  classes:['w-full', 'row']  },
                    el2("button", {
                        classes: ['button', 'add'],
                        innerHTML: svg_add ,
                        onClick(e){
                            consume(e);
                            var valz = get_fieldvalue(root);
                            valz.push( '' )  
                            do_emit(root, valz)
                            util.trigger('refresh', root, { value : valz })
                        }
                    })
            );//End of control box
            element.appendChild(control_box)
             
            data_for_valuefield = force_object(data_for_valuefield) 
 
            element.appendChild(create_placement(root, 0))
            var iter
            for ( var i=0; i < data_for_valuefield.length; i++){
                iter = data_for_valuefield[i];
                element.appendChild ( create__arr_row(iter,i, type, root)  )
                element.appendChild(create_placement(root, i+1))
            }
        }
        do_emit(root, data_for_valuefield)
    }
    let get_fieldvalue = (root )=>{
        var element = root.querySelector(".value-field");
        if ( ! element ) return null;  
        var type = default_type;; 
        special_names.forEach(name =>{
            name = name.substring(1);
            if ( element.classList.contains(name) ){
                type = name; 
            }
        })
        var value = null; 
        if ( type == 'string' ||  type == 'number') {
            var io = element.querySelector(".value-field > input");
            value = io.value; 
            if ( type == 'number') {
                try{
                    value = JSON.parse(value)
                }catch(e){}
            }
             
        }else if ( type == 'text'){
            var io = element.querySelector(".value-field > textarea");
            
            value = io.value;  
        }else if ( type == 'bool'){
            var io = element.querySelector(".value-field .s-checkbox input")
            value = io.checked  
        }else if ( type =='date' || type == 'datetime'){
            var io = element.querySelector(".value-field .date")
            value = io.getAttribute("value"); 
        }else if ( type == 'lookup'){
            var io = element.querySelector(".value-field .lookup")
            value = io.getAttribute("value"); 
            try {
                value = JSON.parse(value);
            }catch(e) { value = [] }
        }else if (type == 'color'){
            var io = element.querySelector(".value-field .color-picker")
            value = io.getAttribute("value"); 
        }else if ( type == 'arrobj') {
            var ios = element.querySelectorAll(".value-field .row.data");
            value = [];
            ios.forEach( row =>{
                var obj = {};
                obj.name = row.querySelector(".name").value; 
                obj.value = row.querySelector(".value").value ;
                value.push( obj ) ;
            }) 
        }else if ( type == 'arritem') {
            var ios = element.querySelectorAll(".value-field .row.data");
            value = [];
            ios.forEach( row =>{
                var val =   row.querySelector(".name").value;  
                value.push( val ) ;
            })  
        }
 
        return value 
    }
    let check_name_field =(root,  data_for_valuefield)=>{
        //Get the name field
        var name_field = root.querySelector("input.name");
        if ( ! name_field) return; 
        //If name is empty, exit
        var name_value = name_field.value;
        if ( !name_value) return; 

        //Check if the name is special 
        var special_name_value= null, snval
        for ( var i=0; i < special_names.length; i++){
            snval = special_names[i]
            if ( name_value.endsWith(snval)){
                special_name_value = snval
                break;
            }
        }
        var value_type = default_type; 
        if ( special_name_value ) value_type = special_name_value.substring(1); 
 
        create_valuefield(root,value_type, data_for_valuefield )
    }

    util.delegate("input", ".meta-box > input.name", (e)=>{ 
        var root  =e.target_actual.closest(".meta-box");
        var input = root.querySelector("input.name")

        var value =  get_fieldvalue (root) 
        check_name_field(root , value  ) 
    })
    
    /**
     * Called upon document load, refresh, or manual component redraw
     */
    util.delegate("refresh", ".meta-box" ,(e)=>{ 
        var root = e.target_actual; 
        if ( ! root) return; 
        if ( root.classList.contains('.meta-box')) root = root.closest(".meta-box");
        if ( !root ) return 
        
        var input = root.querySelector('input.name');
        if ( input && !input.placeholder){
            input.placeholder="name_<arrobj|arritem|string|number|text>"

            input.classList.add("w-full","border","border-gray-300","border-solid","focus:border-primary-500");
        }
        var value = e.detail.value 
        if ( ! value ) {
            value = get_fieldvalue(root)
            
        }
 
        check_name_field(root, value )
    })
    
}