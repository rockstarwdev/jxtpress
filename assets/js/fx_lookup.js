import el2 from "./el2";
import util from "./util";
 

let initial_values = ()=>{
    document.querySelectorAll(".lookup").forEach( lk =>{
        setTimeout((rr)=>{
 
            util.trigger('selected-value', rr ,{ })
        }, 120, lk )
        
    })
}
/**
 * By default, lookup use search using "/api/lookup".  Optionally, developer can specify attribute (context) 
 * to further narrow down the lookup search.
 * <div class="lookup" value="[... ids]" action|endpoint="url-to-api">
 *  <input type="text">
 * </div>
 */
export default function(){
    





    let txt_selector=".lookup > input[type=text]";
    var __root_with_focus = null; 
    /**
     * Search records from the data base and return to the user any matches the user is able to see.  Upon user
     * clicking a search result, trigger event "select" upon lk_root.
     * 
     * @param {HTMLInputElement} lk_root The HTML Input element that triggered this function
     * @param {String} search The string to be searched within the database 
     */
    let do_fetch = async (lk_root ,  search)=>{
        let context = null;
        let endpoint = lk_root.getAttribute("url");
        if ( ! endpoint) endpoint = lk_root.getAttribute("action")
        if ( ! endpoint) endpoint = lk_root.getAttribute("endpoint")
        if ( ! search ) return ;
        if ( ! endpoint ) {
            context     = lk_root.getAttribute("context");
            endpoint    = "/api/lookup"; 
        }
        __root_with_focus = lk_root;
        //Initially show the Markup

        //Create the popover element
        var popover = document.querySelector(".popover.lookup")
        if (! popover) { 
            popover = document.createElement("div")
            window.addEventListener('scroll', ()=>{
                if ( __root_with_focus)
                util.keep_relative(__root_with_focus, popover);
            })
        }

        let clean_up_event = util.click_outside(popover,(e)=>{
            util.trigger('click-off', lk_root , { value : e.target, popover } )
        })

        popover.innerHTML = ''
        popover.classList.add("popover", 'lookup',"active" );
        document.body.appendChild(popover);
        

        var loading = el2('div',{ classes:['flex','justify-center','absolute','z-100', 'w-full', 'p-4']},
            el2('div',{classes:['loader','loading','sm','primary']})    
        )
        popover.appendChild(loading)
        

        //Get the Data from server
        var terms = search.trim().split(/\s/gm);
        var res = await useRequest({ url: endpoint, 
            method:'get', query :{ terms , context }
        })
        loading.remove()
        var data_results = res.d; 

        //Create Result holder
        var results=document.createElement("div");
        results.classList.add("results") 
        results.style.maxHeight='240px'
        results.style.overflow='auto'

        var it_data, it_el 
        for ( var i=0; i < data_results.length; i ++){
            it_data  = data_results[i]; 

            var img =  it_data.image ? 
                el2('img',{ src : it_data.image, style:{ maxWidth: '64px'},  attrs : { title : `Id(${it_data.id})`}   }) : 
                el2('div',{classes:['bg-gray-300'],style:{width:'64px',height: '40px',borderRadius:'4px'}})

            if ( it_data.url ) {
                img = el2('a',{ attrs : { href: it_data.url , _target:"blank"}  }, img )
            }    
            it_el = el2('div',{ classes:['media', 'hover:bg-primary-100', 'pointer'], 
                    style:{fontSize:'90%', padding: '0.25em', margin: '0'},
                    attrs : { index :  i, value : it_data.id  },
                    onClick (e){ 
                        var target = e.currentTarget
                        var index = parseInt ( target.getAttribute("index"))
                        var data = data_results [index];
                        if ( data ) { 
                             
                            add_value_item(lk_root,data.id )
                            util.trigger('selected-value',lk_root, { value : data }); 
                            setTimeout(()=>    util.keep_relative(lk_root, popover), 200)
                        }
                    }
                },
                el2('div',{classes: ['image']}, img  ),
                el2('div',{classes: ['content']},
                    el2('h3',{classes:[''], attrs : {title : `Id(${it_data.id})`}},it_data.title || it_data.name||"Untitled"),
                    el2('div',{classes:['']},it_data.description|| "" )
                )
            )
            it_el.removeAttribute("fn")
            results.appendChild(it_el);
        }
        popover.appendChild( results );
        setTimeout(()=> {
            util.keep_relative(lk_root, popover);
        },120)
         
    }
    /** The User wants to use the ID look up the value in server */
    let expand_resource = async ( root)=>{
        var values = get_value_items(root); //an array of value ids
        if ( ! values ) return []
        var context = root.getAttribute("context") 
        var res = await api("/api/lookup-resolve", { method: 'post', body : { values , context}  })
        console.log ("==Expands to ", res.d )
        return res.d  
    }
    let do_init_setup = (root)=>{
        var placeholder = root.querySelector("placeholder");
        if ( placeholder ) {
            var input = root.querySelector("input");
            if ( input) input.placeholder = placeholder
        }
    }
    let release_focus = (root)=>{
        if ( ! root ) return ;
        root.classList.remove("focus");
    }
    let get_value_items = (root)=>{
        if ( ! root ) return [] ; 
        var attr_val = root.getAttribute("value") 
        if ( attr_val == undefined || attr_val == null || attr_val=='undefined'){
            attr_val = null; 
        }
        var valz = JSON.parse( attr_val)
        if ( ! valz) valz = [];
        return valz 
    }
    let add_value_item = (root ,value )=>{
        var valz = get_value_items(root) 
        if ( valz.includes (value)) return ;
        valz.push(value ) ; 

        __update_value(root, valz )
    }
    let remove_value_item = ( root,index)=>{
        if ( ! root ) return; 
        var valz = get_value_items(root)
        if ( ! valz)return [] 
        if ( index == -1 ) {
            index = valz.length-1;
            if ( index == -1 ) return  [];
        }
        valz.splice(index, 1);
        __update_value(root, valz )

        setTimeout(()=>{
            util.trigger('blur', root , {})
        },100)
    }
    let __update_value = (root, valz) =>{ 
        if ( ! valz ) valz = []
        if ( typeof valz != 'function') root.setAttribute('value', JSON.stringify(valz))
        util.trigger('change',root,{value : valz })
    }
    util.delegate("keydown", txt_selector, (e)=>{
        var key = ( e.keyCode )
        if ( key == 8 || key == 46){
            if ( e.target_actual.value.length == 0){
                var root = e.target_actual.closest(".lookup");
                var sels = root.querySelectorAll(".selected > .value")
                remove_value_item ( root, -1)
                var index = sels.length-1;
                if ( index > -1) sels[index].remove();
            }
        }
    })
    util.delegate("type-complete", txt_selector, (e)=>{ 
 
       if ( !e.detail) return; 
       var root = e.target.closest(".lookup");
    
       do_fetch(root,  e.detail.value );

    })
    util.delegate("focusin", txt_selector, (e)=>{ 
        var root = e.target_actual.closest(".lookup"); 
        root.classList.add("focus")
        let click_outside_focus = (e)=>{
            var popover = document.querySelector(".popover.lookup.active");
            if ( ! (root.contains(e.target) || (popover && popover.contains(e.target)))){
                root.classList.remove( "pending")
                release_focus( root )
                window.removeEventListener('click',click_outside_focus)  
            }
        }
        if(!root.classList.contains("pending")){ 
            root.classList.add("pending")
            window.addEventListener('click',click_outside_focus);
        }
    })
    util.delegate("click-off", ".lookup", (e)=>{
        if ( !e.detail) return ; 
        var clicked_on_el = e.detail.value 
        var popover = e.detail.popover
        var root = e.target_actual.closest(".lookup");

        if ( !root.contains(clicked_on_el )  ){
            //we clicked outside of the lookup element 
            popover.remove() 
            release_focus(root )
        }
    })



    // Call upon crated adhoc lookup items
    util.delegate('selected-value', ".lookup", async (e)=>{
     
        e.stopPropagation()
        e.preventDefault()
        var result = null; 
        var root = e.target_actual;
        do_init_setup(root);
        if ( e.detail.value ) result = e.detail.value ;   //should be an object
        else { 
           
            result = await expand_resource( root)    //should be an array of objects
            
        } 
        console.log ("Doing selected value")
        
        //Create or update the div that contains selected values
        var selected = root.querySelector(".selected");
        if (!selected) {
            var input = root.querySelector("input");
            if ( !input) { 
                console.log ("early exit")
                return;
            }
            selected = document.createElement("div");
            selected.classList.add('selected')
            root.insertBefore(selected, input)
        }else {
            
        }
        
        if ( !result) { 
            console.log ("Exit due to no data")
            return ;
        }
        if ( !Array.isArray(result) ){
            result = [ result]
        }

 
        
        let add_result = (data,index)=>{

            var title = data.title||data.name;
            if( title ) {
                var length = title.length; 
                var max = 12;
                title = title.substring(0, max)
                if ( length > max) title += "..."
            }

            var val_el = el2('div',{ classes:['value', "items-center"], attrs:{ value : data.id } } ,
                el2('span', { }, title ),
                el2('button', { classes:['danger', 'sm'],
                    innerHTML : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 opacity-30 hover:opacity-90">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  `,
                  onClick(e) { 
                    remove_value_item(root, index )
                    val_el.remove()
                  }
                })
            )
            selected.appendChild( val_el)

        }

 
        var selected_id ;
        for ( var i=0; i<result.length; i++){ 
            //Store memory T
            selected_id = result[i].id
            var selected_el = root.querySelector(`.selected > [value='${selected_id}']`)

            if ( selected_el ) {  
                continue ;
            }
            add_result(result[i], i )
        } 
    })
 

  //  util.ready( initial_values )
    //On pagiation to new route, call init functions
    util.delegate('page-load', 'body', (e)=> initial_values () )
    util.delegate('refresh', '.lookup', (e)=> initial_values () )
     
}