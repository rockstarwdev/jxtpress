import util from "./util";

export default function(){

  
    let bt_selector="input[type=button],button, a.button";

    util.delegate("mouseover", bt_selector, (e)=>{
        if ( e.target_actual.classList.contains("hover")) return;  
        e.target_actual.classList.add("hover");
        var bg = e.target_actual.querySelector(".bg");
        if ( ! bg) {
            bg = document.createElement("span");
            bg.classList.add("bg", "pointer-events-none");
            e.target_actual.append( bg);
        }
    })
    util.delegate("mouseout",bt_selector,(e)=>{
        e.target_actual.classList.remove("hover");
    })

    util.delegate('click','.button.confirm', (e)=>{
        var target = e.target_actual;
        
        var added_affirm_class = target.classList.toggle('affirmative')
        if (added_affirm_class){
            //we are now just adding the affirm class on the button;
            let click_any_where_listener = (watcher_event)=>{
                var other = watcher_event.target;
                console.log ("Secondary click", other)
                if ( target == other || target.contains(other)) {
                    util.trigger('affirm', target);
                    util.trigger('confirm', target); 
                }
                window.removeEventListener('click',click_any_where_listener)
            }
            setTimeout(()=>{
                window.addEventListener('click',click_any_where_listener)
            }, 10)
        }
    })
}