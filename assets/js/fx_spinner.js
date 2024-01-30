import util from "./util";

export default function(){
    /**
     
    
          <div class="spinner" min="4" max="15" step="2.5"  >
            <input value="6.125" >
            <div class="controls"> 
              <button type="button" class="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                  stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg> 
              </button>

              <button type="button" class="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>


     */
  
    let get_root = (e)=>{
        if ( ! e ) return null; 
        var target = e.target_actual || e.target ;

        if ( ! target ) return null; 
        if ( ! target.classList) return null; 
        if (target.classList.contains("spinner")) return target ;
        return target.closest(".spinner")
    }
    let get_step = (e)=>{
        var root = get_root(e) 
        if ( ! root) return 1;
        return  parseFloat ( root.getAttribute("step") || 1 )
    } 
    let get_min = (e)=>{
        var root = get_root(e) 
        if ( ! root) return 1;
        var min=  root.getAttribute("min") 
        if (min == null) return null; 
        else return parseFloat( min || 1 )
    } 
    let get_max = (e)=>{
        var root = get_root(e) 
        if ( ! root) return null ;
        var max=  root.getAttribute("max")  
        if (max == null) return null; 
        else return parseFloat( max || 1 )
    } 
    let get_cur_value = (e)=>{
        var root = get_root(e);
        if ( ! root ) return 0;
        var input = root.querySelector("input")
        if ( ! input ) return 0 ;
        var value = parseFloat( input.value )
        if ( isNaN(value)) value = 0
        return value; 
    }
    let set_value = (e, value )=>{ 
        var root = get_root(e);
        if ( ! root ) return 0;
        var input = root.querySelector("input")
        if ( ! input ) return 0 ;
        value = parseFloat(value )
        input.value = value 
        util.trigger('change',root, { value  })
    }
    let enforce_min_max = (e, value )=>{ 
        var min = get_min(e);
        if ( min != null ) {
            if ( value < min) value = min; 
        } 
        var max = get_max(e);
        if ( max != null ) {
            if ( value > max) value = max; 
        } 
        return value; 
    }
    let click_on_button = (e) =>{
        var target = e.target_actual 
        var parent = target.parentElement 
        var index = -1;
        for ( var i=0; i < parent.children.length; i++){
            if ( parent.children[i] == target) {
                index = i;
                break; 
            }
        }
        
        if ( index ==-1) return; 
        var amount = get_step(e) * (index == 0 ? 1 : -1 )
        var value = get_cur_value(e)
         
        value =  value + amount  
        set_value( e , enforce_min_max (e, value) )  
    }

    util.delegate("click", ".spinner > .controls .button", (e)=>{
        click_on_button(e) 
    })

    util.delegate('focusin', ".spinner .button",(e)=>{
        var target = e.target_actual || e.target 
        var root = get_root(e);
        root.classList.add("focus") 
        let release = (f)=>{
            root.classList.remove("focus") 
            target.removeEventListener("blur",release)
        }
        target.addEventListener("blur",release)
    })
    util.delegate("focusin", ".spinner > input", (e)=>{
        var target = e.target_actual || e.target 
        if ( ! target ) return; 
        var root = get_root(e); 
        root.classList.add('focus')
        let fx = (f) =>{
            set_value (e , enforce_min_max(e, target.value )) 
            root.classList.remove('focus')
            target.removeEventListener('blur', fx )    
        }
        let fx_change = (f) =>{//prevent bubbling up
            f.stopPropagation()
            target.removeEventListener('change',fx_change)
        }
        target.addEventListener('blur', fx )   
        target.addEventListener('change', fx_change )  
    })
}