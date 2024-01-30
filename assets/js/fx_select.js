import util
 from "./util";


        /*
          Markup 
          .select <.is-array> value="somthings"
            .selected 
                <span>some value</span>
            .values 
                div value="something" => Text REPEAT 
        */
export default function (){
    window.addEventListener( 'scroll', (e)=>{
        var nodes = document.querySelectorAll(".select");
        for(var i=0; i < nodes.length; i++){ 
            util.keep_relative ( nodes[i], nodes[i].querySelector(".values") )
        }
    });
    //When select is clicked, open the picker
    util.delegate("click", ".select", (e)=>{
        var target = e.target;
        if ( !target.classList.contains("select")) target = target.closest(".select");
        var select = target;
        var values = e.target.closest(".values");
        if ( values || !select ) return;//Do not process when the click orginated from values
        values = select.querySelector(".values");
        if (! values   ) return; //Exit
        
        var is_active = select.classList.contains("is-active")
        if (  is_active )return; //Already open
        select.classList.add('is-active')
        util.click_outside(select, ()=> select.classList.remove('is-active'))

        util.keep_relative ( select, values ) 
    })
    //When user removes items from the selected value
    util.delegate("mouseenter",".select > .selected > span", (e)=>{
        var selected_container = null;
        var value_el = null, iter=0;
        do {
            if (iter > 30) break; 
            selected_container = e.target.parentElement;
            value_el = e.target;  
            iter++;
        }while (!selected_container.classList.contains("selected"));
        
        if ( ! selected_container ) return; 
        var select = selected_container.closest(".select"); 
        

        let leave_value = (le)=>{
            value_el.removeEventListener('mouseleave', leave_value)
        }
        value_el.addEventListener('mouseleave', leave_value); 

        var span = document.createElement('span');
        span.classList.add('icon'); span.classList.add('close')
        span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
        stroke-width="3.5" stroke="currentColor" class="w-3 h-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /> 
        </svg>`
        var existing_span = value_el.querySelector(".icon");
        if (existing_span) return; 
        value_el.appendChild(span)

        span.addEventListener('click',(sc)=>{
            var txt_val = value_el.getAttribute('value');
            if ( txt_val == 'undefined' || txt_val == 'null' || txt_val ==null)txt_val=null
            var span_val    =  null; 
            try { span_val = JSON.parse( txt_val ) ; } catch(e){ span_val = txt_val }
            if ( select.classList.contains("s-select")) {
                util.trigger('remove', select, { value : span_val})
            }else { 

                update_select_value(select, span_val, false )
                value_el.remove() 
            }
            
        })
    })


    let update_select_value = (select, val, add=true)=>{
        console.log (val, add, "update value")
        if ( select.classList.contains('s-select')) return false ; 
        var t_val = select.getAttribute('value') , cur_values 

        if ( typeof t_val == 'string' ) {
           if ( t_val.charAt(0) == '[' || t_val.charAt(0) == '{') {
            cur_values = JSON.parse( t_val )  
           }else {
            cur_values = t_val; 
           }
        } 
        
        if ( select.classList.contains('is-array') && ! Array.isArray(cur_values)) cur_values = [ cur_values ];
        if (cur_values == null && select.classList.contains('is-array')) {
            cur_values = [];
        }
        if ( Array.isArray(cur_values)){
            if ( add ) { 
                if ( ! cur_values.includes(val)) cur_values.push( val );
            }else { 
                var index =  -1
                for(var i=0; i < cur_values.length; i++){ 
                    if ( cur_values[i] == val ) {
                        index = i;
                        break;
                    }
                } 
                cur_values.splice ( index , 1 )                 
            }
        }else { 
            if ( add) { 
                cur_values = val;
            }else {
                cur_values = ''
            } 
        }
        let is_arr = Array.isArray(cur_values);
        if ( is_arr){
            for(var i=0; i < cur_values.length; i++){
                if ( ! isNaN(cur_values[i])) cur_values[i] = Number.parseFloat(cur_values[i])
            }
        }
        var value = is_arr ? JSON.stringify(typeof cur_values != 'function' ? cur_values : null ) : cur_values
        
        if ( ! select.classList.contains('s-select')){ 
            select.setAttribute('value',value);
        }
        util.trigger('change',select, { value : cur_values})
        return cur_values
    }

    //When user clicks on a choice item
    util.delegate('click', ".select > .values > *", (e)=>{
        var values = null;
        var value_el = null, iter=0;
        var path = e.composedPath();
        for(var i =0; i < path.length; i++){
            if ( path[i].classList.contains('values')){
                values = path[i];
                value_el = path[i-1];
                break; 
            }
        }
        /*console.log( e.target, e.composedPath() )
        do {
            if (iter > 30) break; 
            values = e.target.parentElement;
            value_el = e.target;  
            iter++;
        }while (!values.classList.contains("values")); */
        value_el = e.target; 
        values = values.closest(".values");
        if ( ! value_el) return;


        var select = value_el.closest(".select");
        if ( ! select ) return; 
        var selected = select.querySelector(".selected");

        if (value_el.parentElement != values ){
            var iter = value_el.parentElement;
            while ( iter  != values ){
                value_el = iter; 
                iter = iter.parentElement 
            }
        }

        var val
        try {   
        val = JSON.parse ( value_el.getAttribute('value') )
        }catch(e) { val = value_el.getAttribute('value')  }
        var display = (value_el.getAttribute("label")|| value_el.getAttribute("display")) || value_el.innerText
         
        if ( select.classList.contains('s-select')) { 
            util.trigger('select',values, { value : val })
            return; 
        }
        var cur_values = update_select_value(select, val, true )

        selected.innerHTML = ''
        var iter_val = Array.isArray(cur_values) ?  cur_values : [cur_values];
        iter_val.forEach( it =>{
            var selector = `[value="${it}"]`;
            var s = selected.querySelector(selector )
            var val_src = values.querySelector(selector)
            if ( ! s && val_src ) { 
                try { 
                    display = (val_src.getAttribute("label")|| val_src.getAttribute("display")) || val_src.innerText

                    s = document.createElement('span')
                    s.setAttribute('value', it)
                    s.innerHTML = display
                    selected.appendChild( s ) 
                }catch(e){
                    console.log("Error for selector <"+selector+"> ",e )
                }
            } 
        })

    })

}