import util from "./util";

export default function(){

   

    util.delegate("click", ".nav-button", (e)=>{
        var target =  e.target_actual 
        var nav = target.closest("nav");
        if ( ! nav ) return; 
        var has_active = nav.classList.toggle("active") 
    }) 
    
}