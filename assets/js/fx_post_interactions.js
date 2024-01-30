import util from "./util";
/**
 * Handles UI interaction of rendered posts
 */
export default function(){
 
    util.delegate("mouseenter", ".post-handle .post-edit",(e)=>{
        var post =e.target.closest(".Post");
        if  (! post) return; 
        post.classList.add('hover')
    })
    util.delegate("mouseout", ".post-handle .post-edit",(e)=>{
        var post =e.target.closest(".Post");
        if  (! post) return; 
        post.classList.remove('hover')
    })
}