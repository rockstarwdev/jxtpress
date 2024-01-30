import util from "./util";

/**
 * Register interaction such that background videos only play when they are visible
 */
function register_auto_pause(){
    let options = {
        root: null,
        rootMargin: '0px',
        threshold:1.0
    };
    let callback = (entries, observer)=>{
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.play();
            } else {
                entry.target.pause();
            }
        });
    }
    let observer = new IntersectionObserver(callback, options);

    document.querySelectorAll(".container > video").forEach(video=>{
        var clz = "auto-stop";
        if ( video.classList.contains(clz) )    return ; //Already registerd
    
        video.classList.add(clz);
        observer.observe(document.querySelector( video ));
    })
    

}
export default function(){

    util.ready( register_auto_pause)
    //On pagiation to new route, call init functions
    util.delegate('page-load', 'body', (e)=> register_auto_pause () )
    

}