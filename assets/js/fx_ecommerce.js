import { useMainStore } from "~/store";
import util from "./util";


export default function(){

    let store = useMainStore()

    /** Get the number if product/service the user wants to add to cart */
    let get_post_quantity = (post_id, new_value ) =>{
        var quantity = 1; 
        if ( ! post_id ) return quantity
        document.querySelectorAll(`.PostQuantity[post-id]`).forEach(node =>{
            if ( node.getAttribute("post-id") == post_id ) {
                var input =  node.querySelector("input")
                quantity = parseFloat( input.value  )
                if ( new_value != null && new_value != undefined ) input.value = 1
            }
        })
        return quantity
    }
    let get_variations = (post_id ) =>{
        var out_vars = {}
        var post_vars = null; 
        document.querySelectorAll("[block-type='postvariations']").forEach(node =>{
            if ( node.getAttribute("post-id") == post_id ) {
                post_vars = node; 
            }
        })
        if ( ! post_vars ) return nulll;
        var variation, var_id , var_value , var_name 
        for(var i=0; i < post_vars.children.length; i++){
            variation = post_vars.children [i] ;
            var_id  = variation.dataset.mId
            var_name= variation.dataset.mName 
            if (! variation.classList.contains('single')){ 
                var_value = variation.querySelector(".choices .item.active").getAttribute("value") 
            }else {
                var_value = variation.querySelector("input").value 
            }
            out_vars[var_name] = var_value
        }
        return out_vars
    }
    //When Post Action is clicked on, send the serve the
    // action request
    util.delegate("click",".PostActionButton",async (e)=>{
        let target =e.target_actual ||e.target 
        //Get the product ( post-id ) and the type of action
        var action = target.getAttribute("action-type")
        var post_id = parseInt ( target.getAttribute("post-id") );
        if ( isNaN (post_id)) post_id =null; 
        if ( ! action ) return; 
        var quantity = get_post_quantity(post_id,1)

        var variations =  get_variations(post_id)


        let body = { action, post_id, quantity, variations }
        var res = await store.post_action_button(body )


        console.log ("Post-action", body, "=>", res  )
    })
    util.delegate("click", ".variation-ui.choices > li", async (e)=>{
        var target = e.target_actual;
        var parent = target.parentElement;
        Array.from ( parent.children).forEach(node => node.classList.remove('active'))
        target.classList.add("active") 
    })
    
    
}