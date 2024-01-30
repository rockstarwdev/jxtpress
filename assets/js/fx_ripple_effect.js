import util from "./util";


let fade_out_riple = (   elem , handleFadeOutRipple  ,  ripple , animationStart   ) => {
    const animationInterrupt = Date.now();
    let remainingTime = 600 - (animationInterrupt - animationStart);
    if (remainingTime < 200) remainingTime = 200;
    ripple.style.transition = `opacity ${remainingTime}ms linear`;
    if (ripple) ripple.classList.add("ripple-fade-out");
    const removeRipple = async () => {
      await new Promise((res) => setTimeout(res, remainingTime));
      if (ripple) ripple.remove();
    };
    removeRipple();
    elem.removeEventListener("pointerup", handleFadeOutRipple);
    elem.removeEventListener("pointercancel", handleFadeOutRipple);
    elem.removeEventListener("pointerleave", handleFadeOutRipple);
};

export default function(){

//Apply ripple
util.delegate("click",".ripple", (e)=>{ 

    // Create ripple
    const button =  e.target_actual ||e.target|| e.currentTarget  
    const ripple = document.createElement("span");


    const diameter      = Math.max(button.clientWidth, button.clientHeight);
    const radius        = diameter / 2;
    const rect          = button.getBoundingClientRect();
    ripple.style.width  = ripple.style.height = `${diameter}px`;
    ripple.style.left   = `${  e.clientX - rect.left - radius }px`;
    ripple.style.top    = `${  e.clientY - rect.top - radius }px`;
    ripple.classList.add("has-ripple");

    // Add ripple
    const anime_start = Date.now();
    button.insertBefore(ripple, button.firstChild);
    
    const hnd_fade_out = () => {
        fade_out_riple(button, hnd_fade_out, ripple, anime_start);
    };
    
    button.addEventListener("pointerup"         , hnd_fade_out);
    button.addEventListener("pointercancel"     , hnd_fade_out);
    button.addEventListener("pointerleave"      , hnd_fade_out);

})
}