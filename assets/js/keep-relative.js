    /**
     * Create a position relationship between an anchoring element and a floating element such that it stays fixed
     * @param {HTMLElement} anchoring_element The element that stays stationary
     * @param {HTMLElement} floating_element The element that is position adjacement to the anchoring element
     * @param { Object } options { placement : "top|right|bottom|left" }
     * @returns Nothing
     */
export default  (anchoring_element, floating_element, options)=>{
        if ( !anchoring_element || !floating_element) return; 
        setTimeout(()=>{ 
            //Reset position
            floating_element.style.left = ''
            floating_element.style.right = ''
            floating_element.style.top = ''
            floating_element.style.bottom = ''

            var num_pad = 10;
            if  ( options && options.padding) num_pad = options.padding 

            // Get Dimensions
            var rect_anchor = anchoring_element.getBoundingClientRect();
            var rect_float  = floating_element.getBoundingClientRect();

            var offset      = window.innerHeight - rect_anchor.bottom ;
   
 
            // By default, place the element, below the target and if outside of window bottom
            // reverse it and place above the target element
            var top = offset > rect_float.height ? 
                      rect_anchor.bottom + num_pad : 
                      rect_anchor.top - rect_float.height - num_pad

            var left = rect_anchor.left ;
            var past_page_overlap = left + rect_float.width + num_pad 
            if (past_page_overlap  > window.innerWidth  ) {
                var overlay_offset  = past_page_overlap - window.innerWidth  
                //left = window.innerWidth - overlay_offset - rect_float.width + rect_anchor.width;
                left = rect_anchor.right - Math.max ( rect_anchor.width,rect_float.width ) - num_pad
            }
            //Now check if there are custom behaviors the developer wanted
            if ( options && options.placement  ){ 
                var { placement } = options;
                var float_width = rect_anchor.width;

                if ( placement == 'right' ){
                    left = rect_anchor.right + num_pad
                    top = rect_anchor.top + num_pad * 0.5
                }else if ( placement == 'left'){
                    left = rect_anchor.left - rect_float.width - num_pad
                    top = rect_anchor.top + num_pad * 0.5
                }else if ( placement == 'top'){
                    var mid = rect_anchor.left + float_width * 0.5
                    var twidth =   rect_float.width * 0.5 
                    
                    left = mid - twidth
                    if ( left < rect_anchor.left ) left = rect_anchor.left + num_pad
                    top  =  rect_anchor.top - rect_float.height - num_pad 
                }
            }
            
            floating_element.style.position = 'fixed'
            floating_element.style.top      = top + 'px'
            floating_element.style.left     = left + 'px'
        }, 1) 
    }