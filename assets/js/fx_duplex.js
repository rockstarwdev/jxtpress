import util from "./util";

/**
 * A duplex is a Div that wraps number input and a select control in order to combine but their input values
 * into a single unit
 */
export default function(){

    let input_change = (e)=>{
        e.stopPropagation();
        e.preventDefault()
        var target = e.target;
        if ( target.classList.contains("duplex")){ 
            return; 
        }
        var root = target.closest(".duplex");
        var el_num = root.querySelector("input");
        var el_sel = root.querySelector("select");
        if ( ! el_num || ! el_sel) return ; 

        var value = parseFloat(el_num.value)+ el_sel.value 
 
        root.setAttribute("value",value )
        util.trigger("change",root,{ value, num : parseFloat( el_num.value ), str : el_sel.value  })
    
    }
    util.delegate("input",".duplex > input", input_change)
    util.delegate("change",".duplex > input", input_change)
    util.delegate("change",".duplex > select",input_change)
 

    var on_focus =(e)=>{  
        var target = e.target;
        if ( target.classList.contains("duplex")){
            console.log ("Exiting by choice")
            return; 
        }
        
        var root = target.closest(".duplex");
        root.classList.add("focus");

        util.click_outside(root,()=>{
            root.classList.remove("focus")
        })
    }
    util.delegate("focusin",".duplex > input", on_focus)
    util.delegate("focusin",".duplex > select", on_focus)
}