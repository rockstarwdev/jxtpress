import util from "./util";
 

//For conversion function see https://css-tricks.com/converting-color-spaces-in-javascript/
let _mem_color = {

}

function mem_recycle (){
    for(var key in Object.keys(_mem_color)){
        if ( _mem_color[key] && _mem_color[key].parentElement == null){
            delete _mem_color[key];
        }
    }
}


  /**
   * Finds the color in the given array that is closest to the target color.
   * @param {string} target_color - The target color in hex or rgb string format  
   * @param {string[]} arr_colors - An array of colors to compare against the target color.
   * @returns {string} The color in the array that is closest to the target color.
   */
  function get_closest_color  (target_color, arr_colors)  {
    let closest_dist = 99999999;
    let closest_color = null;
    
    
    const c1 = util.decompose_color_to_rgb(target_color); // Convert target color from hex string to RGB values
    console.log ("get-clostest-color of ", target_color, c1, arr_colors)
    // Loop through the array of colors
    arr_colors.forEach((color) => {
        // Convert current color from hex string to RGB values
        //const [r2, g2, b2] = decompose_color_to_rgb(color);
        
        // Calculate the Euclidean distance between the target color and current color
        const distance = Math.sqrt(
            (c1.r - color.r) ** 2 +
            (c1.g - color.g) ** 2 +
            (c1.b - color.b) ** 2
        );
        
        // Update closest color and distance if the current distance is smaller than the closest distance
        if (distance < closest_dist) { 
            closest_dist = distance;
            closest_color = color;

        }
    }); 
    return closest_color;
  }

/**
 * 
 * @param {HTMLElement} elem an HTML element representing the color component
 * @returns 
 */
let create_color_window =(elem)=>{
    _mem_color = {}
    mem_recycle()
    if ( ! elem) {

        throw new Error("You must provide element which either trigger the openning or must hold the initial value as an attribute")
    }
    if ( ! elem.classList) throw new Error("Element must a HTMLElement")

    if ( ! _mem_color[ elem ]){
        var in_color_value = elem.getAttribute("value")
        var parts = util.decompose_color_to_rgb( in_color_value ) 
        var alpha = parts?.a || 0
        _mem_color[ elem ]= {
            base_color :null,
            x : null,
            y : null, 
            bx : null,
            by : null,
            alpha_y : util.round ( (255 - alpha) / 255  * 100,2)  ,
            alpha ,
            r: parts?.r || null  ,
            g : parts?.g || null,
            b : parts?.b || null , 
        }
    } 
 
    var root = document.createElement("div");
    root.classList.add("colow-window", "popover","active", "p-2");
    root.style.minWidth = 'fit-content'
    
    var wrapper = document.createElement("div");
    wrapper.classList.add("wrapper", "relative","flex");
    root.appendChild(wrapper);


    var section_selector = document.createElement("div");
    section_selector.classList.add("selector","relative","selector");
    wrapper.appendChild(section_selector)


    var section_base = document.createElement("div");
    section_base.classList.add("selector","relative", "base");
    wrapper.appendChild(section_base)



    var section_alpa = document.createElement("div");
    section_alpa.classList.add("selector","relative","alpha");
    wrapper.appendChild(section_alpa)


    var selector_indicator = document.createElement("div")
    selector_indicator.classList.add("indicator", "absolute", "pointer-events-none")
    selector_indicator.style.borderRadius='50%'
    selector_indicator.style.width=selector_indicator.style.height='4px'
    selector_indicator.style.border="1px solid white"
    selector_indicator.style.boxShadow="0 0  1px 1px black"
    section_selector.appendChild(selector_indicator ) 




    var base_indicator = document.createElement("div")
    base_indicator.classList.add("indicator", "absolute", "w-full", "pointer-events-none")
    base_indicator.style.borderRadius='3px'
    base_indicator.style.width= '100%'
    base_indicator.style.height='4px'
    base_indicator.style.border="1px solid white"
    base_indicator.style.boxShadow="0 0  1px 1px black"
    section_base.appendChild(base_indicator ) 


    var alpha_indicator = document.createElement("div")
    alpha_indicator.classList.add("indicator", "absolute", "w-full")
    alpha_indicator.style.borderRadius='3px'
    alpha_indicator.style.width= '100%'
    alpha_indicator.style.height='4px'
    alpha_indicator.style.border="1px solid white"
    alpha_indicator.style.boxShadow="0 0  1px 1px black"
    section_alpa.appendChild(alpha_indicator ) 



    

 
    //When user clicks off this color editor, remove it from page
    util.click_outside(root, ()=>{ //On Click outside, then remove
        root.classList.remove("active");
        setTimeout(()=> root.remove(), 120)
    })


    //Create the canvas, set the size, and grab the context
    var canvas_sel_size=120
    /**
     * Responsible for determining the final color the user picks
     */
    var canvas_col_selector = document.createElement("canvas");
    var ctx_color_selector = canvas_col_selector .getContext('2d',{ willReadFrequently: true });  // This create a 2D context for the canvas
    canvas_col_selector.setAttribute("width",`${canvas_sel_size}px`)
    canvas_col_selector.setAttribute("height",`${canvas_sel_size}px`)
    canvas_col_selector.style.borderRadius="2px"
    section_selector.appendChild(canvas_col_selector); 

 
    var canvas_base_color = document.createElement("canvas");
    canvas_base_color.classList.add("ml-2")
    canvas_base_color.style.borderRadius ='3px'
    var ctx_base_color = canvas_base_color .getContext('2d',{ willReadFrequently: true });  // This create a 2D context for the canvas
    canvas_base_color.setAttribute("width",`${15}px`)
    canvas_base_color.setAttribute("height",`${canvas_sel_size}px`)
    section_base.appendChild(canvas_base_color); 


 
    var canvas_alpa_color = document.createElement("canvas");
    canvas_alpa_color.classList.add("ml-2")
    canvas_alpa_color.style.borderRadius ='3px'
    var ctx_alpha_color = canvas_alpa_color .getContext('2d',{ willReadFrequently: true });  // This create a 2D context for the canvas
    canvas_alpa_color.setAttribute("width",`${15}px`)
    canvas_alpa_color.setAttribute("height",`${canvas_sel_size}px`)
    section_alpa.appendChild(canvas_alpa_color); 


    

    var paint_color_selector = (color, base_color, must_align_indicator=false)=>{ 

        _mem_color[elem].base_color = base_color
        // Create a Horizontal Gradient (color)    
        let gradientH = ctx_color_selector .createLinearGradient(0, 0, ctx_color_selector .canvas.width, 0);
        gradientH.addColorStop(0, '#fff');
        //gradientH.addColorStop(1, color); //<--was this mone
        gradientH.addColorStop(1, base_color);   //<-- new

        ctx_color_selector.fillStyle = gradientH;
        ctx_color_selector.fillRect(0, 0, ctx_color_selector .canvas.width, ctx_color_selector .canvas.height);

        // Create a Vertical Gradient(white to black)
        let gradientV = ctx_color_selector.createLinearGradient(0, 0, 0, canvas_col_selector.height);
        gradientV.addColorStop(0, 'rgba(0,0,0,0)');
        gradientV.addColorStop(1, '#000');
        ctx_color_selector.fillStyle = gradientV;
        ctx_color_selector.fillRect(0, 0, ctx_color_selector .canvas.width,  ctx_color_selector.canvas.height); 

        
        if ( must_align_indicator ) {  //Don only on start up
            var rainbow = [], pixel
            var w = ctx_color_selector.canvas.width+1;
            var h =  ctx_color_selector.canvas.height+1
            for(var x=1; x < w ; x++){ 
                for ( var y =1; y < h; y++){
                    pixel = ctx_base_color.getImageData(x,y,1,1).data;
                    rainbow.push ({ 
                        r :  pixel[0] , g : pixel[1], b : pixel[2],  
                        x : w - x , y: h - y  // insert these 
                    })
                }
            }
            var closestc = get_closest_color(color, rainbow);
            console.log("CLosest COlor", closestc)
            if (closestc ){
                selector_indicator.style.left= closestc.x + 'px'
                selector_indicator.style.top= closestc.y + 'px'
            }else {
                console.log ("DID not find closest color")
            } 
        }

        if (_mem_color[elem].x != null){
            selector_indicator.style.left= _mem_color[elem].x + 'px'
        }
        if (_mem_color[elem].y != null){
            selector_indicator.style.top= _mem_color[elem].y + 'px'
        }

    }


    var paint_base_color = ( )=>{ 
        var rainbow = [] , pixel
        let h = ctx_base_color .canvas.height
        let grad = ctx_base_color .createLinearGradient(0, 0, 0, h );
        grad.addColorStop(0.00, "rgb(255,0,0)")
        grad.addColorStop(0.15, "rgb(255,0,255)")
        grad.addColorStop(0.33, "rgb(0,0,255)")
        grad.addColorStop(0.49, "rgb(0,255,255)")
        grad.addColorStop(0.67, "rgb(0,255,0)")
        grad.addColorStop(0.84, "rgb(255,255,0)")
        grad.addColorStop(1.00, "rgb(255,0,0)") 
        ctx_base_color.fillStyle = grad;
        ctx_base_color.fillRect(0, 0, ctx_base_color.canvas.width, h );

        for ( var y =1; y < h+1; y++){
            pixel = ctx_base_color.getImageData(1,y,1,1).data;
            rainbow.push ({ 
                r :  pixel[0] , g : pixel[1], b : pixel[2], 
                x : 1, y 
            })
        }
        if (_mem_color[elem].bx ) base_indicator.style.left = "3px"
        if (_mem_color[elem].by ) base_indicator.style.top  = _mem_color[elem].by + "px"

        return rainbow
    }



    var paint_alpha_color = ( )=>{ 
        //var rainbow = [] , pixel
        let h = ctx_alpha_color .canvas.height
        let grad = ctx_alpha_color .createLinearGradient(0, 0, 0, h );
        grad.addColorStop(0.00, "rgb(255,255,255)") 
        grad.addColorStop(1.00, "rgb(0,0,0)") 
        ctx_alpha_color.fillStyle = grad;
        ctx_alpha_color.fillRect(0, 0, ctx_alpha_color.canvas.width, h );

        
        alpha_indicator.style.left = "3px"
        if (_mem_color[elem].alpha_y ) alpha_indicator.style.top = _mem_color[elem].alpha_y + "px"

    }


    //Set the primary Color 
    var color = elem.getAttribute('value') || 'rgba(0,0,255,1)';
    console.log ("Paint Base for color",color, elem )
    
    var closestc = get_closest_color( color, paint_base_color() )
    var base_color = _mem_color[elem].base_color || `rgb(${closestc.r},${closestc.g},${closestc.b})`
    paint_color_selector(color, base_color, true)
    paint_alpha_color()

 
    
    var pad = 0
    let fn_update_col_selector = (e)=>{
        var rect = wrapper.getBoundingClientRect()
        let x = e.clientX - rect.x - pad ;  // Get X coordinate
        let y = e.clientY - rect.y - pad ;  // Get Y coordinate

        
        var img_data = ctx_color_selector.getImageData(x,y,1,1);
        var pixel = img_data['data'];   // Read pixel Color
        var color = { r :  pixel[0] , g : pixel[1], b : pixel[2] }
         
        _mem_color[elem].r = color.r
        _mem_color[elem].g = color.g
        _mem_color[elem].b = color.b  


        _mem_color[elem].x = x 
        _mem_color[elem].y = y 
        selector_indicator.style.left = x + "px"
        selector_indicator.style.top = y + "px"
         
        finalize_color();
    }

    let fn_update_base_selector = (e)=>{
        var rect = canvas_base_color.getBoundingClientRect() 
        let x = e.clientX - rect.x - pad ;  // Get X coordinate
        let y = e.clientY - rect.y - pad ;  // Get Y coordinate
 
        _mem_color[elem].bx = x ;
        _mem_color[elem].by = y 

         
        base_indicator.style.left =  "3px"
        base_indicator.style.top = y + "px"
        
        var img_data = ctx_base_color.getImageData(x,y,1,1);
        var pixel = img_data['data'];   // Read pixel Color
        var color = { r :  pixel[0] , g : pixel[1], b : pixel[2] }
        
        var rgb = `rgb(${color.r},${ color.g },${color.b })`;
        paint_color_selector(rgb, rgb )
    }

    let fn_update_alpha_selector = (e)=>{
        var rect = canvas_alpa_color.getBoundingClientRect() 
        let x = e.clientX - rect.x - pad ;  // Get X coordinate
        let y = e.clientY - rect.y - pad ;  // Get Y coordinate
  
        _mem_color[elem].alpha_y = y

         
        alpha_indicator.style.left =  "3px"
        alpha_indicator.style.top = y + "px"
        
        var img_data = ctx_alpha_color.getImageData(x,y,1,1);
        var pixel = img_data['data'];   // Read pixel Color
        _mem_color[elem].alpha =   pixel[0] 
        
        finalize_color();
    }
    let finalize_color=()=>{
        var new_color = "";
        new_color = `${_mem_color[elem].r||0},${_mem_color[elem].g||0},${_mem_color[elem].b||0}`
        if ( _mem_color[elem].alpha) new_color += `,${ util.round (_mem_color[elem].alpha / 255, 2)}`

        new_color = `rgb(${new_color})` 
        elem.setAttribute("value",new_color);

        console.log (new_color)
        var elem_col = elem.querySelector(".color")
        if ( ! elem_col ) {
            elem_col = document.createElement("span")
            elem_col.classList.add("color")
            elem.appendChild(elem_col)
        }
        elem_col.style.backgroundColor = new_color

        util.trigger('change',elem,{ value : new_color })
        
    }


    //Event: on canvas click, grab the color that was clicked
    var is_col_selector_pressed = false; 
    canvas_col_selector.addEventListener('click', fn_update_col_selector);
    canvas_col_selector.addEventListener('mousedown',(e)=>{
        is_col_selector_pressed = true; 
    })
    window.addEventListener('mouseup',(e)=>{
        is_col_selector_pressed = false; 
    })
    canvas_col_selector.addEventListener('mousemove', (e)=>{
        if ( ! is_col_selector_pressed) return; 
        fn_update_col_selector(e)
    })


    //Event: on Canvas click on base color
    var is_base_selector_pressed = false; 
    canvas_base_color.addEventListener('click', fn_update_base_selector);
    canvas_base_color.addEventListener('mousedown',(e)=>{
        is_base_selector_pressed = true; 
    })
    window.addEventListener('mouseup',(e)=>{
        is_base_selector_pressed = false; 
    })
    canvas_base_color.addEventListener('mousemove', (e)=>{
        if ( ! is_base_selector_pressed) return; 
        fn_update_base_selector(e)
    })


    //Event: on Canvas click on base color
    var is_alpha_selector_pressed = false; 
    canvas_alpa_color.addEventListener('click', fn_update_alpha_selector);
    canvas_alpa_color.addEventListener('mousedown',(e)=>{
        is_alpha_selector_pressed = true; 
    })
    window.addEventListener('mouseup',(e)=>{
        is_alpha_selector_pressed = false; 
    })
    canvas_alpa_color.addEventListener('mousemove', (e)=>{
        if ( ! is_alpha_selector_pressed) return; 
        fn_update_alpha_selector(e)
    })

     

    return root; 
}
    /*
          Markup 
          .color 
    */
export default function (){
 
    var selector = ".color-picker";
    let init =()=>{
         document.querySelectorAll( selector ).forEach( node=>{

            var value = node.getAttribute("value");
            var color = node.querySelector(".color");
            if ( ! color ) {
                color = document.createElement("div")
                color.classList.add("color"); 
                node.appendChild(color)
            }
            console.log("Init value",value)
            color.style.backgroundColor = value || "white"

         })
    }
    util.ready( init)
    //On pagiation to new route, call init functions
    util.delegate('page-load', 'body', (e)=> init () )

    //Open up the Dropdown Window
    util.delegate("click", selector , (e)=>{
        var do_later =()=>{
            e.stopPropagation()
            var target = e.target; 
            var root =   target.closest('.color-picker')

            //sanity check
            var color_window = create_color_window( root )
            document.body.appendChild( color_window )
            util.trigger('open', target, { window : color_window} )
            util.keep_relative ( root, color_window ) 
        }
        setTimeout(()=> do_later(), 45 )
    })



}