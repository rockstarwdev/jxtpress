import util from "./util";

export default function(){

    const route = useRoute(); 
    let consume = (e)=>{ 
        e.stopPropagation();
        e.preventDefault();
    }
    util.delegate("click","a", (e)=>{ 
        let target  = e.target_actual || e.target;
        var url     = target.getAttribute("href")
        if ( ! url ) return ;

        //Allow navigation per normal
        if (  url.startsWith("http")) return 

        //At this point, the link is likely internal, so navigate using nuxt
        var prevent_default_behavior = true; 
        var new_tab = target.getAttribute("target")
        if (new_tab && new_tab.toLowerCase() =='_blank'){
            prevent_default_behavior = false; 
        }
        if (!prevent_default_behavior) return 
        
        // -----------------------------------
        // prevent normal behavior
        // 
        consume(e);
        navigateTo( url )//{ path : url })  
    })
}