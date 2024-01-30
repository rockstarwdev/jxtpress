import util from "./util";

export default function(){

    var win = {x:0,y:0}
    var tooltip = null; 

    window.addEventListener('mousemove',(e)=>{
        win.x = e.clientX
        win.y = e.clientY
    })
    let on_click = e=>{
        nullify_tooltip() 
    }
    util.delegate("mouseover","[data-title]", (e)=>{
        var target = e.target_actual;
        if ( ! target.classList.contains( 'dtt' ) ){
            target.classList.add( 'dtt' )
            target.addEventListener('click', on_click)
            var delay = 200;
            setTimeout(() => {
                util.trigger('show-tooltip', target,{
                    msg : target.dataset.title 
                },true, window, win.x, win.y)
            }, delay);
        }
        
    })


    util.delegate("mouseout","[data-title]", (e)=>{
        var target = e.target_actual; 
        target.classList.remove("dtt")
        target.removeEventListener('click',on_click)
        nullify_tooltip();
    })

    var nullify_tooltip = ()=>{ 
        if ( ! tooltip ) return; 
        tooltip.remove();
        tooltip =null; 
    }
    var create_tooltip = (msg, next_to )=>{
        tooltip = document.createElement("div");
        tooltip.style.opacity=0.0;
        tooltip.style.position='fixed'
        tooltip.classList.add("tooltip");
        tooltip.innerHTML = msg || "";
        
        document.body.appendChild(tooltip)
        setTimeout( ()=>{
            var placement = next_to.dataset.placement || "top" //top, bottom, left, right

            util.keep_relative(next_to,tooltip, {
                placement  
            })
            setTimeout(()=>{ 
                if ( tooltip ){ 
                    tooltip.style.opacity=1.0
                }
            }, 1)
        },100)
    }

    util.delegate("show-tooltip","[data-title]", (e)=>{
        var target = e.target_actual;
        var detail = e.detail; 
        var rect = target.getBoundingClientRect()
        var x = e.clientX, y=e.clientY
        
        if ( rect.left < x && rect.right > x && 
             rect.top  < y && rect.bottom > y ){
            var msg = target.dataset.title ;
            if ( ! msg ) return ; 
            if ( tooltip ) nullify_tooltip() 

            var clean_msg = "";
            var break_every_x_chars = 50;
            for ( var i=0; i < msg.length ; i+= break_every_x_chars) {
                clean_msg += msg.substring(i, i + break_every_x_chars);
                clean_msg += "<br>\n";
            }
            create_tooltip(clean_msg, target)
        }
    })

}