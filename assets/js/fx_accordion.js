import util from "./util";

 const _accmem = {}
export default function(){

    let fx = (e)=> {
        var target = e.target;
        var accordion_item = target.closest(".accordion-item")
         

        var content = accordion_item.querySelector(".content");

        if ( ! content ){  return; }
        var content_child = content.children[0];
        var content_height = 0, rect = null
        for(var i=0; i < content.children.length; i++){
            rect = content.children[i].getBoundingClientRect()  
            content_height += rect.height
        }
        if ( ! content_child) { return ; }

        var was_hidden =! accordion_item.classList.contains("active")
        var rect = content_child.getBoundingClientRect() 
        var delay = 240;

        var is_initial_click=false; 
        var one_time_init_force_maximized = false; 
        //On very first click, do one-time smooth initialization
        if (!  accordion_item.classList.contains('mx3')){ 
            accordion_item.classList.add('mx3')   
            is_initial_click=true;
            content.style.transition=`max-height ${delay}ms ease`
            
            if ( was_hidden ) { 
                //is starting out as hidden and transiting to active 
                content.style.maxHeight ='0px'  
                if ( ! accordion_item.classList.contains('active'))one_time_init_force_maximized=true; 
                content.style.transition=`max-height ${delay}ms ease`
            }else { 
                content.style.maxHeight =  content_height +'px' 
            }
            content.style.display='block'
        } 
        let do_collapse_toggle = ()=>{
            var is_active = accordion_item.classList.toggle("active") 
 
            if ( is_active ) {
                content.style.transition=`max-height ${delay}ms ease`
                content.style.maxHeight = content_height+'px' 
            } else { 
                content.style.display='block';//Hold visible
                content.style.transition=`max-height ${delay}ms ease`
                content.style.maxHeight ='0px'
            }     
            if ( one_time_init_force_maximized ) {
               content.style.maxHeight = ''
            }
        }
        //if ( is_initial_click){
        //    setTimeout(()=> do_collapse_toggle(), 10)
        //}else {
            do_collapse_toggle()
        //}
        
 
    }

    util.delegate('mclick', '.accordion-item > .title ', fx)
    util.delegate('click', '.accordion-item > .title ', fx)
    util.delegate('refresh', '.accordion-item ', (e)=>{
        let target = e.target_actual;
        if ( ! target.classList.contains('active')) return ;
        var content = target.querySelector(".content");
        if ( ! content) return ;
        content.style.maxHeight = ''
    })
    

}