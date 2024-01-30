import util from "./util";


export default function(){

    // Apply Typing complete effect 
    let typing_timeout;
    let typing_delay=350;
    util.delegate("keyup","input,textarea", (e)=>{
        
        let done_typing = (f)=>{
            var tc_event = 'typing-complete';
            var target = e.target_actual ||e.target
            var ui = target.closest(".ui")
   
            util.trigger(tc_event, target);
 
            if ( ui) { 
                util.trigger(tc_event, ui, { value : target.value })
                util.trigger("typing", ui, { value : target.value })
                util.trigger("type-complete", ui, { value : target.value })
            }else {
 
                util.trigger(tc_event, target, { value : target.value })
                util.trigger("typing", target, { value : target.value })
                util.trigger("type-complete", target, { value : target.value })
            }
        }
        clearTimeout( typing_timeout)
        typing_timeout = setTimeout(done_typing, typing_delay);
    })
    
}