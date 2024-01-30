import util from "./util";

export default function(){

    /* https://getcssscan.com/css-checkboxes-examples */
    let clickable_selectors=".s-checkbox .checkbox, .s-checkbox .label";
    let fn_click = (e)=>{ 
    
        var root = e.target_actual.closest(".s-checkbox"); 
        if ( root.classList.contains("compnent"))return; 
        if ( ! root) return; 
        e.stopPropagation();
        e.preventDefault() 
        var input = root.querySelector("input[type=checkbox]");
        input.click() 
        util.trigger('blur', root);
    }
    util.delegate("touch", clickable_selectors,fn_click);
    util.delegate("click", clickable_selectors, fn_click)

    
    util.delegate('change','.s-checkbox',(e)=>{
        console.log ("fx- State Change", e.target.checked  )
         
    })
}