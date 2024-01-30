
<template>
  <div class="s-blocks"> 
 
    <div class="card">
        <div class="data-canvas bg-white" ref="canvas">
            <div class="quick-actions" style=" "></div>
        </div>
        <section class="block-tree shadow flex gap-3 overflow-hidden" ref="block_tree"></section>
        <aside class="data-inspector" ref="inspector">
            <button class="pin sm button" @click="hnd_toggle_data_inspector_pin">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
                class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>

            </button>
            <h4 class="title" @mouseover="hnd_mouse_over_inspector_title" @mouseleave="hnd_mouse_out_inspector_title"></h4>
            <div class="description"></div>
    
        </aside>
    </div>
  </div>
</template>
<script setup>
import util from "~/assets/js/util";
import { useMainStore } from "~/store";
import el_compiler from "~/assets/js/el2"
import el2 from "~/assets/js/el2";
import chk from "~/assets/js/chk";


const debug = (level=0, ...args) =>{
    var tab ="";
    for(var i=0; i < level; i++) tab += "\t"; 
    console.log (tab, ... args)
}
const error = (level=0, ...args) =>{
    var tab ="";
    for(var i=0; i < level; i++) tab += "\t"; 
    console.error (tab, ... args)
}
 
 

const component_props = defineProps({
  modelValue: { type: null, default: Array },
  options : { type : Object , default: ()=>({}) }
});
const emit = defineEmits([
  "change",
  "update:modelValue",
  "open-inspector",
  "open-block",
  "settings"
]);

 
    
onBeforeUnmount(()=>{
    document.querySelectorAll(".blk-style").forEach( style => style.remove() )
})

/** HTML Reference to the holder for  */
const block_tree = ref(null)
/** Canvas is the area where all HTML representation of the data are placed */
const canvas    = ref(null)
/** Inspector is the area where all HTML representation of the inspector data are placed */
const inspector = ref(null)
/** An Object where each key represents the ID of a block instance and each value is an object structured
 *  as { type: Block type, default : Array of object type & value :HTML default inspector fields, custom : Points to custom inspector fields }
 */
const inspector_controls = {}
/**
 * When @set_inspector is called, this variable points to the block instance that is set as active
 */
let inspector_active_block = null; 

let inspector_is_pinned = ref(false)

/**
 * Use this to brute force set_inspector where a block instance is being set repeatedly for the same block
 */
let forcibly_set_inspector = null;


/**
 * Must be an array of Objects where each object follows the format:
 * { id, type, children : Array, data : Object }  
 */
const d = useModel(component_props, emit);

  

//Watch D Value; anything length is less than 1 force add;
watch(d, value =>{ 
  console.log("D.changed")
  enforce_non_empty()

}, { deep: true})
/** Used to watch whether or not the value has changed */
let d_has_changed = false; 

/**
 * Utility function that allows us, via watch, to continuously ensure that d-value contains at least 1 root 
 * block instance
 */
let enforce_non_empty = ()=>{
    if ( ! d.value  ) d.value = []
    if ( d.value.length == 0 ) {
        d.value.push({   type : "paragraph", children : [], data : {} })
    } 
    d_has_changed = true;  
}
let is_redraw = ()=> d_has_changed==true; 
enforce_non_empty();
/** Forcibly notify parent that data has changed */
let emit_value = ()=>{
    d.value.push({ });
    d.value.splice(d.value.length-1,1)
    //emit("change"           , d.value )
    emit("update:modelValue",d.value)  
}


 /**
  * An array of all Registered Blocks that can be placed in the canvas.  Each structured as:
  *  { name, Class, is_inspector, native, priority, status}
  */
let reg_blocks = ref(null); 
 

let store = useMainStore();

/**
 * A subject of registered blocks that are not inspector only.  Each structured as:  
 * { name, Class, is_inspector, native, priority, status}
 */
let normal_reg_blocks = computed(() => {
  return reg_blocks.value == null
    ? []
    : reg_blocks.value.filter((it) => !it.is_inspector);
});
/**
 * Load all Registered blocks from server and compile the Class field to runnable.
 */
let load_blocks = async () => {
  //Get the blocks
  reg_blocks.value = await store.load_blocks();
  if ( Array.isArray(reg_blocks.value)){
    reg_blocks.value.forEach(block => {
        //block = { name, Class, is_inspector, native, priority, status}
        try {  
            block.Class = (new Function("return " +block.Class)) ()
        }catch(e){
            error(0,"Error within Block Class",e,"\n\n", block.Class )
        }
    })
  }
  useRequest( {url : "/api/posts/types",}).then( res=>{
    var arr = res.d; 
    if (! Array.isArray(arr)) return 
    list_post_types = arr.map ( post_type =>{
        return {
            title : post_type.title, value : post_type.name 
        }
    }) 
  })

  if ( !reg_blocks.value ) { 
    console.error(`Error loading registered blocks`)
    return false;
  } 
}


/**
 * List of all post types on the site
 */
let list_post_types = [] 

onMounted(()=>{

    window.addEventListener("mouseover",(e)=>{
       
        // Target all blocks that immediately houses a slot
        var start_elem = e.target
        var it = start_elem, slot, slot_parent;
        var path = e.composedPath();
        for(var i=0; i < path.length; i++){
            it = path[i];
            if  (! it.tagName ) break;
            if ( it.tagName.toLowerCase() == 'body') break;  

            if ( it.classList.contains("children-slot") ){
                var blk = it.closest(".block-instance");
                if ( ! blk ) break; 
                blk.classList.add("has-mouse","has-slot")
                break; 
            }
            
        } 
        var clz_identifier = "targeted"
        let monitor_event = (me)=>{
                    //Erase all others
                    canvas.value?.querySelectorAll(".block-instance."+clz_identifier).forEach(other=>{ 
                        other.classList.remove(clz_identifier)
                        other.removeEventListener('mouseout',monitor_event)
                    })
                    //REMOVE SELF
                    var target = me.target
                    target.classList.remove(clz_identifier)
                    if(me.relatedTarget) me.relatedTarget.classList.remove(clz_identifier)
                    target.removeEventListener("mouseout",monitor_event)
        }

        //do clean sweep just prior to walking the path tree
        canvas.value?.querySelectorAll(".block-instance."+clz_identifier).forEach(other=>{ 
            other.classList.remove(clz_identifier)
            other.removeEventListener('mouseout',monitor_event)
        })

        //MOUSE POINTING HERE 
        for(var i=0; i < path.length; i++){
            it = path[i];
            if ( ! it.classList) continue; 
            if ( it.classList.contains("block-instance") && !it.classList.contains(clz_identifier)){
                it.classList.add(clz_identifier)
                
                setTimeout((target)=>{
                    target.addEventListener("mouseout",monitor_event)
                }, 75,it )
                
                break; 
            }
        }
    })
    //Initialization Code
    setTimeout(async ()=>{
        await load_blocks();
        await init_canvas();

    },100)


})


let hnd_mouse_over_inspector_title = () =>{
    let blk = inspector_active_block
    if ( ! blk )return;
    var blk_id = blk.id ; 
    var el_blk = document.querySelector(`#${blk_id}`)
    if( ! el_blk ) return;
    el_blk.classList.add('spotlight')
}
let hnd_mouse_out_inspector_title = ()=>{
    let blk = inspector_active_block
    if ( ! blk )return;
    var blk_id = blk.id ; 
    var el_blk = document.querySelector(`#${blk_id}`)
    if( ! el_blk ) return;
    el_blk.classList.remove('spotlight')

}
/**
 * Given a Block Name, return the block from the list of registered blocks
 * @param {String} block_name String name of the block
 * @returns {Object} Object { name , Class: runnable, is_inspector, native, priority, status}
 */
let get_block= (block_name)=>{
    if ( ! block_name ) return null; 
    block_name = block_name.toLowerCase()
    if ( ! reg_blocks.value ) return null; 

    var out = reg_blocks.value.filter(block =>{
        var sname = block.name 
        if ( ! sname) return false; 
        sname = sname.toLowerCase();
        return sname == block_name
    })
    if ( out.length == 0) return null; 

    return out[0]; 
}
let get_block_root =(block_name)=>{
    if ( ! block_name ) return null; 
    var el = canvas.value.querySelector("#"+block_name);
    if ( ! el ) {
        console.error("get_block_root - cannot find ", block_name )
    }
    return el 
}
let create_block_id = ()=>{
    var prefix = "B";
    var digi, id;
    var found = false;  
    var max_loop = 10;
    var counter = 0;
    do {
        digi    = Date.now().toString().substring(9);;
        id      = prefix + util.random_str(6).toUpperCase() + digi;
        found   = canvas.value.querySelector("#"+id);
        counter ++; 
        if ( counter > max_loop) break;
    }while (  found  ) // if found, search again until not found
    return id; 
}
/**
 * Given a block name and its data, return a valid block instance.  This function is ideal for creating new block instances
 * or respawning an instance based off of existing data. 
 * @param {Object} block_data Block data for the newly instanciated object {type,id,children, data}
 * @returns {Class} Create new block instance
 */
let get_block_class = ( block_instance = { type: null}, for_inspect=false) => {
    if ( ! block_instance.type ) return null; 
    var block       = get_block( block_instance.type )
    if ( ! block ) return null; 

    if ( block_instance.data === null) {
        block_instance.data = {}
    }
   
    //block_instance = { type,id, children, data },  obj_instance = an object instance from "new BlockClass"
    let copy_block_data_to_instance = (block_instance, class_inst)=>{
        if ( !block_instance ||!class_inst) return; 
        if (block_instance.data == null ||block_instance.data == undefined) 
            block_instance.data = {}
        var value = null;
        
        var key_set = Object.keys(block_instance.data)
        for(let key of Object.keys(class_inst)){
            if ( !key_set.includes(key)) key_set.push(key);
        }
        
        //loop all the keys of block_instance data to copy into data
        for ( let key of key_set){
            value = null; 
            if (block_instance.data[key] != undefined )value = block_instance.data[key]
            if ( value == null && class_inst[key] != undefined)value = class_inst[key] 

            class_inst[key]             = value  
            block_instance.data[key]    = value; 
        }
    }
    var cls = new block.Class( block_instance , { cp: copy_block_data_to_instance, chk } ) 
    return cls
}
/**
 * Search entire array of block instance to locate a specific block
 * @param {String} block_id Id of the block instance
 * @param {Array|NUll} nullable_subarray Default is null, internally used for recursion
 */
let get_block_instance = (block_id, nullable_subarray=null)=>{
    if( !Array.isArray(d.value)) return null; 

    var search = nullable_subarray || d.value; 
    if ( ! Array.isArray(search) ) return null; 

    var blk_instance = null;
    var found_block = null; 
    for(var i=0; i < search.length; i++){
        blk_instance = search[i];
         
        if ( blk_instance.id == block_id) { 
            found_block = blk_instance; 
            break;
        }
        //search children
        if (Array.isArray(blk_instance.children)){
            var it = get_block_instance(block_id, blk_instance.children);
            if ( it != null){
                found_block = it;
                break;
            }
        }
    }

    if (found_block) {

    }
    return found_block;
}
 
/**
 * Search entire array of block instances to locate a specific block data
 * @param {String} block_id Id of the block instance
 * @param {Array|NUll} nullable_subarray Default is null, internally used for recursion
 */
let get_block_instance_parent = (block_id )=>{
    
   
    let R = (arr, PARENT)=>{
        if ( !Array.isArray(arr)) return null; 
        var it; 
        for ( var i =0;i < arr.length; i++){
            it = arr[i];
            if ( it.id == block_id ) {
                return PARENT;
            }else {
                if (!Array.isArray(it.children)) continue; 
                var found_it = R(it.children, it);
                if ( found_it ) return found_it 
            }

        }
        return null; 
    }
    return R(d.value, null);
}
/**
 * Provide a uniform way to get the "belly" of the parent.  The "belly" is the place where all block instances are kept within
 * the parent for each instance.  All top level instances are kept as array items within d.value, while each item there after
 * is kept in the items block_instance.children.
 * @param {Object|Null} parent_instance Object block of which children array reference is returned.  When null returns d.value, otherwise returns parent_instance.children
 * @returns { Array | Null} Reference to parent's array where children are kept
 * */
let get_block_instance_parent_belly = (parent_instance)=>{
    if ( ! parent_instance ) {
        return d.value;
    }else {
        return parent_instance.children; 
    }
}
/**
 * Remove a block instance from it's parent's belly
 * @param {Object} block_instance {id, type, children , data}
 */
let remove_block_instance = (block_instance, redraw=true)=>{
    if ( ! block_instance ) return; 
    var is_in_inspect_mode = false;

    if ( inspector_active_block && inspector_active_block.id ==  block_instance.id)is_in_inspect_mode=true; 
    console.trace("Removing", block_instance.id);
    var parent = get_block_instance_parent(block_instance.id);
    var old_belly = get_block_instance_parent_belly(parent);
    for(var i=0; i < old_belly.length; i++){
        if ( old_belly[i].id == block_instance.id){
            
            old_belly.splice(i,1);
            break; 
        }
    }
    set_inspector(null);
 
    let block_root = get_block_root(block_instance.id );
    if ( block_root) { 
        block_root.style.transition='height 180ms ease-in-out;'
        block_root.style.height ='0px !important'
        block_root.style.overflow = 'hidden'
        setTimeout(()=> { 
            block_root.remove() 
            util.trigger('blur',block_root.closest('.block-instance'))
        }, 230)
        
    }
    console.log ("Removed block - no redraw", )
}
/**
 * Add a block to parent
 * @param {Object} blk_target The block_instance( new or old ) that is to be added add using the instructions of "how"
 * @param {Object} how { parent : parent object or null, 
 *                      after|before : id name of block to insert before or after }
 */
let add_block_instance = async (blk_target, how, fn_callback) =>{
    if ( ! blk_target ) return false; 
    if ( ! how ) throw new Error("\"how\" field is required with { parent, after|before }")
         
    if ( !how.append ) { 
        if ( ! how.before && ! how.after) throw new Error("how.before or how.after is required");
    }
    var parent_belly = get_block_instance_parent_belly( how.parent )
    if ( ! Array.isArray(parent_belly) ) { 
        console.error("add-block-instance","error for adding\n",blk_target,"\nHow=",how)
        throw new Error("Unable to get a valid parent belly")
    } 
    

    //See where we need to place the element
    var adjacent_target_id = how.before || how.after, inst; 
    if ( adjacent_target_id) how.how = how.before ? "before" : "after"
    if (adjacent_target_id &&  adjacent_target_id ==blk_target.id){
        debug(2,"canceling add block - cannot add to self")
        return false;
    }

    
    debug(0, "<*> Add block", blk_target.type+"."+blk_target.id, 
    (how.before ? "Before" :"After" ) + " " + adjacent_target_id, how )

    var existing_parent = get_block_instance_parent(blk_target.id)
    var existing_parent_belly = get_block_instance_parent_belly(existing_parent);
    if (!Array.isArray(existing_parent_belly)){
        debug(1,"canceling add block due to existing block array not found")
        return false;
    }
    var existing_index=-1; 
    for(var i=0; i < existing_parent_belly.length; i++){ 
        if ( existing_parent_belly[i].id == blk_target.id ){
            existing_index= i;
            break; 
        }
    }

    
    console.log ( "---->", how.parent , blk_target.id)
    var parent_id = how.parent ?  (typeof how.parent =='object' ? how.parent.id : how.parent  ) : null 
    var parent_root = get_block_root( parent_id ); //the new place the element was insert
    var existing_parent_root = get_block_root(blk_target.id)

    if ( how.append) { 
        //Append to the new parent
        parent_belly.push(blk_target);  
        //REmove existing
        if ( how.parent !== existing_parent && existing_index != -1){
            existing_parent_belly.splice(existing_index,1);       
        }   
        if (! parent_root ) {
            await redraw_canvas();//redraw the hole canvas
            console.log("Append redraw whole canvas as no null parent (entire document)")
        }else {
            console.log("Append redraw - deferred to event")
            util.trigger('blur',parent_root);// defer redraw to eventhandler
        }
    }else { 
        
        for ( var i =0; i < parent_belly.length; i++){
            inst = parent_belly[i];
            if ( inst.id == adjacent_target_id){ 
                if ( how.before){
                    parent_belly.splice(i,0, blk_target)
                    if ( existing_parent_belly === parent_belly) existing_index++;
                }else {
                    //after - leave existing_index alow
                    parent_belly.splice(i+1, 0, blk_target) 
                } 
                if (! how.is_new ){  
                    //When not a new item, remove the old item
                    existing_parent_belly.splice(existing_index,1)
                }
                util.trigger('blur',existing_parent_root)
                util.trigger('blur',parent_root);
                break;
            }//end if 
        }

        await redraw_canvas()
    }
    emit_value()

    setTimeout(()=>{
        if ( typeof fn_callback=='function')fn_callback()
    },100)
    return true
} 
 
/**
 * Given a block type, return a new version of that block
 * @param {String} type Name of a block type to instantiate
 */
let create_block_instance = (type)=>{
    var new_block_instance = {
        is_new : true,
        id :  create_block_id(),
        type  ,
        data : {} ,
        children: []
    }
    return new_block_instance
}

/**
 * Upon window resize or setting a new Block Instance to the inspector, check and update the height of the content div
 */
let update_inspector_height = ()=>{
    if ( ! inspector.value ) return; 
    //----------------------------------------------------------------------
    // 
    //----------------------------------------------------------------------

    var content = null;
    for(var i =0; i < inspector.value.children.length; i++){
        if ( inspector.value.children[i].classList.contains('content')){
            content = inspector.value.children[i]
        }
    }
         
    if ( ! content) return; 
    var screen_height = window.innerHeight;
    var content_height = screen_height * 0.90;
    content.style.maxHeight = content.style.height =`${content_height}px`
    
}
let update_block_tree_position = ()=>{
    var bt              = block_tree.value 
    bt.style.position   = 'fixed'
    bt.style.bottom     = '10px'
    bt.style.width      = canvas.value.getBoundingClientRect().width + 'px'
    bt.style.zIndex     = 300

    // 
    if ( ! inspector_active_block ) return; 
    var tree = [];
    var it = inspector_active_block;
    while ( it ) {
        tree.push( it )
        it = get_block_instance_parent( it.id ); 
    }

    var bt_settings = document.createElement("button")
    bt_settings.type="button"
    bt_settings.classList.add("button")
    bt_settings.innerHTML =`  
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>` 

    bt_settings.addEventListener('click',(e)=>{
        e.preventDefault();
        e.stopPropagation()
        emit_settings_emits()
    })
    var temp = [],  tree_leaf 
    for( var i =0; i< tree.length; i++){
        it = tree[i];
        tree_leaf = document.createElement('div')
        tree_leaf.classList.add('tree-leaf','rounded', 'bg-white', 'p-1', 'px-3','shadow','hover:bg-primary-300','hover:color-white', 'flex','items-center')
        tree_leaf.style.fontSize ='82%'
        tree_leaf.style.cursor = 'default'
        tree_leaf.setAttribute('for',it.id );
        var tree_title = document.createElement('dd')
        tree_title.classList.add('title',);

        var block_class = get_block_class({type : it.type, data:{}})

        var display_text =  block_class.get_name ? block_class.get_name() : it.type ; 
        if ( ['title','element'].includes( it.type) ) {
            var tag = it.data.tag;
            switch(it.data.level){
                case 1: tag='h1'; break;
                case 2: tag='h2'; break;
                case 3: tag='h3'; break;
                case 4: tag='h4'; break;
                case 5: tag='h5'; break;
                case 6: tag='h6'; break;  
            }
            if ( tag ) { 
                tag = tag.toUpperCase(); 
                display_text = `<b>${tag}</b>(${it.type})`
            }
        }
        tree_title.innerHTML =display_text
        
        tree_leaf.appendChild(tree_title);

        temp.push( tree_leaf)
        tree_leaf.addEventListener('mouseenter', (e)=>{
            var id = e.target.getAttribute('for')
            var target_block = canvas.value.querySelector("#"+ id)
            if ( !target_block) return; 
            target_block.classList.add('spotlight')             
           // target_block.scrollIntoView(false)
        })
        tree_leaf.addEventListener('mouseleave', (e)=>{
            var target_block = canvas.value.querySelector("#"+ e.target.getAttribute('for'))
            if ( !target_block) return; 
            target_block.classList.remove('spotlight')
        })

        tree_leaf.addEventListener('click', (e)=>{
            var target =  e.target
            if (! target.classList.contains('tree-leaf')) target = target.closest(".tree-leaf")
            var id = target.getAttribute('for')
        
            if (!id ) return; 
            var blk = get_block_instance(id ) 
            set_inspector( blk )
        })

        var carrot = document.createElement('div');
        carrot.style.minWidth='12px'
        carrot.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="opacity: 0.5; position: absolute; top: 12px"
                 stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>

        `
        if ( i  < tree.length -1 ){ 
            temp.push(carrot)
        }
        
    }
    bt.innerHTML = ''
    bt.classList.add("flex", "justify-between")

    var left_box = document.createElement("div");
    left_box.classList.add("tree-leaf-list","flex-1","flex","gap-2")
    var right_box = document.createElement("div");
    bt.appendChild(left_box)
    bt.appendChild(right_box);

    right_box.appendChild(bt_settings)
    temp.forEach(node => left_box.appendChild(node )) 

}

/**
 * Recurrently watch for when registered blocks have completely loaded and that canvas object is ready
 * and if so perform the first display of the SBlock Editor
 */
let init_canvas = ()=>{
    let delay=100;
    if ( ! reg_blocks.value ){ 
        setTimeout(()=> init_canvas(), delay)
        return; 
    }
    if ( ! canvas.value ) {
        setTimeout(()=>init_canvas(),delay);
        return ;
    }
    
    window.redraw_canvas = redraw_canvas
 
    window.get_canvas_data = ()=>{ 
        return util.copy(d.value)
    }
    window.addEventListener('resize',(e)=> update_inspector_height() )
    window.addEventListener('resize', (e)=>update_block_tree_position( ))
    update_block_tree_position()
    var extra_css = `
        :root {
            --highlight-border-color: #2019978f;
            --highlight-color: #ffff001c;
        }
        .data-canvas {
            padding: 1em 0; 
        }
        .block-instance {
            position: relative;
            min-height: 32px;
            border-radius: 2px;
        }
        .block-instance.listitem {
            margin-bottom: 0.5em;
        }
        .listitem > .edit-controls {
            padding-left: 2.05em;
            position: relative;
        }
        .block-instance .quick-actions {
            position: absolute;
            min-height: 32px;
            border: 1px solid var(--ui-border-color);
            min-width: 210px;
            background-color: var(--white);
            border-radius: 2px;
            top: 24px;
            left: -16px;
            display: none;
            opacity: 1.0;
            z-index: 100;
            box-shadow: 0 0 2px 1px rgba(0,0,0,0.10);
            min-height:80px;
        }
        .block-instance {
            border: 2px dashed transparent;
        } 
        .block-instance.targeted {
            border-color: var(--highlight-border-color) !important; 
            background-color: var(--highlight-color) !important;
        }
        .block-instance.targeted {
            
        }
        .block-instance.spotlight {
            background-color: var(--highlight-color);
            box-shadow: 0 0 1px 1px var(--primary-200);
        }
        .block-instance.show-actions > .quick-actions {
            display:block; 
            color: var(--text-color);
        } 


        .filterable {
            --height: 240px;
            display: flex;
            overflow: auto;
            max-height: var(--height);
            min-height: var(--height);
            user-select: none;
        }
        .filterable.modify { 
            min-height: 32px;
        }

        .filterable > li {
            padding: 0.75em 0.5em;
            cursor: pointer;
            font-size: 80%;
            display: flex;
            margin: 0;
            align-items: center;
        }
        .filterable > li.error .shape{
            animation: shake-horizontal .3s cubic-bezier(.215,.61,.355,1) ;
        }
        .filterable li.hidden {
            display: none;
        }
        .filterable > li:hover {
            color: var(--primary-700);
            background-color: var(--primary-50);
        }
        .filterable > li .shape {
            display: inline-flex;  
            padding: 4px;
            border-radius: 2px;
        }
        .filterable > li:hover .shape {
            background-color: var(--primary-100);
        }
        .filterable > li.error  {
            color: var(--red-600);
        }
        .quick-actions .modify, .quick-actions .add {
            display: none;
        }
        .quick-actions.modify .modify, .quick-actions.add .add {
            display: block;
        }
        .block-instance .children-slot {
            min-height: 32px;
            margin: 0 0.25em;
            background-color: #a1adc50f;
            border-radius: 3px;
            border: 2px dashed transparent; 
        }
        .block-instance > .block-info {
            z-index: 100;
            border: 1px solid var(--gray-200);
            visibility: hidden;
            opacity: 0.0
        }

        .block-instance.active > .block-info {
            opacity: 1.0;
            visibility : visible
        } 


        .block-instance  .children-slot.active { 
            /*border-color: var(--primary-800); */
        }

        .block-instance .actions-trigger {
            position: absolute;
            left: -54px;
            top: -2px;
            stroke: transparent;
            fill: var(--gray-400);
            display: none;
            
        }

        .block-instance.active > .actions-trigger {
            display: flex;
            background-color: #5d69980f;
            border-radius: 8px;
            background-color: var(--white-t);
        }
        .actions-trigger > button {
            padding: 0.25em 0.5em;
        }
        .actions-trigger > button:first-child{
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }
        .actions-trigger > button:last-child{
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        .actions-trigger > button:hover {
            background-color: var(--highlight-color);
            
        }

        .data-canvas .drag-indicator {
            width: 100%;
            min-height: 12px;
            background-color: var(--primary-300);
            border-radius: 2px;
            position: absolute;
            display: none;
            opacity: 0.0;
            left: -8px;
        }
        .data-canvas .drag-indicator.before { top : -8px }
        .data-canvas .drag-indicator.after { bottom : -6px }

        .data-canvas.dragging .drag-indicator {
            display:block;
            opacity: 0.0;
        }
        .data-canvas.dragging .drag-indicator.hover {
            opacity: 1.0;
        }

        .children-slot {
            border: 2px dashed transparent;
        }
        .children-slot.dropzone {
            border-color: var(--green-600);
            background-color: #17912b5e !important;
        }
        .children-slot.dropzone.not-allowed {
            border-color: var(--red-600);
            background-color: var(--red-200) !important;
        }

        .data-canvas .children-slot.empty-nest {
            display:none
        }
        .data-canvas.dragging .children-slot.empty-nest {
            display:block;
        }

        [block-type=container] {
            margin: 10px;
        }
        .repeater {
            padding-top: 28px;
        }
          
        .repeater.empty {
            border: 2px dashed var(--gray-200);
            border-radius: 3px;
        }
        .repeater-item .item-actions {
            visibility: hidden;
        }
        .repeater-item:hover .item-actions{
            visibility: visible;
        }
        .repeater> .action-group {
            position: absolute;
            top: 2px;
        }
        .repeat-placement {
            z-index: 100;
            min-height: 9px;
            background-color: var(--gray-300);
            border-radius: 2px;
            opacity: 0.0;
        }

        .repeat-placement.hover {
            opacity: 1.0;
            background-color: var(--green-500);
        }
        
        .repeat-placement.error {
            opacity: 1.0;
            background-color: var(--red-500);
        }
        button.delete {
            background-color: var(--red-800);
        }
        .condition-item:not(:last-child) {
            border-bottom: 1px dashed var(--ui-border-color);
            margin-bottom: 0.5em;

        } 
        .condition-item:hover {
            background-color: var(--primary-50);
        } 
        .block-tree {
            background-color: var(--white);
            min-height: 1.75em;
            padding: 0.25em;
            border-radius: 3px; 
            opacity: 0.75;
            transition: opacity 200ms ease, background-color 200ms ease;
        }
        .block-tree:hover {
            transition: opacity 200ms ease, background-color 200ms ease;
            background-color:var(--primary-50);
            opacity: 1;
        }
        /* For Listitem */
        .listitem .checklist-item.done > .editable {
            text-decoration: line-through;
            color: #1d1a254d;
        }

        .inspector-elements {
            padding: 0.125em;
        }
        .ii3 {
            width: 12px;
            height: 12px; 
            border-radius: 3px;
            border: 1px solid var(--ui-border-color); 
            display: inline-block;
        }
        .label {
            color: var(--gray-600);
            font-size: 80%;
            cursor: default;
            font-weight: 600;
        }
        .PostLoopWrapper.edit-controls {
            border: 2px solid var(--orange-500);
            border-style: double;
            border-radius: 6px;
            background-color: #ffa50008;
        }

        .stand-in {
            min-height: 48px;
            padding: 10px;
            border: 3px solid var(--red-500);
            border-radius: 4px;
            background-color: #ff321114;
        }
    `;

    let style   = document.querySelector("#sblock-style");
    if ( style ) style.remove();
    style       = document.createElement('style'); style.id = "sblock-style";

    style.innerHTML = extra_css;
    document.body.appendChild(style);


    redraw_canvas()
}
let word_summary = ref({
    list : [] ,
    pre_count : 0, count : 0 
})
/**
 * This function is called when a UI block component is interacted with or the entire page is redrawn
 */
let evaluate_document = async ()=>{
    if ( ! canvas.value ) return ;
    var doc_text = canvas.value.innerText || "";
    doc_text =doc_text.toLowerCase()
    var words = doc_text.split(/\s/gm), word =null; 
    var pre_count = words.length 
    var word_map = {}
    var word_list = []
    for(var i=words.length-1; i > -1; i--){
        word = words[i]
        if ( word.length < 2 ) {
            words.splice(i,1);
            continue;
        }
        //count each instance
        if ( word_map[word] == undefined ){
            try { 
                var matches = doc_text.match(  new RegExp(word,"gmi") )
                if (!matches ){
                    //console.error("Weird, there should be some matches", word, matches )
                    continue; 
                } 
                word_map[word] = matches.length;
                word_list.push({ word, count : matches.length})
            }catch(e){ }
        }
    }
    var count = words.length
    word_list.sort( (  A, B)=>{
        return B.count - A.count 
    })
    word_summary.value.count = count 
    word_summary.value.pre_count=pre_count
    word_summary.value.list = word_list


}
let redraw_canvas =  util.debounce(async ()=>{
    debug(0, "Redraw Canvas");
    
    var refresh = canvas.value.querySelector("button.refresh-canvas");
    if ( refresh)refresh.addEventListener('click',(e)=>{
        redraw_canvas()
    })


    canvas.value.classList.add('relative')
    
    var temp = document.createElement("div");
    temp.innerHTML = `
        <div class="absolute doc-controls" style="top:-8px; right: 20px; z-index: 100;">
            <button title="Refresh document" type='button' class=" refresh-canvas">
                <svg style="opacity: 0.75" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </button>
            <button title="Info & tips" type="button" class="more-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
    
            </button>
            <button title="Document Settings" class="document-settings">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div> `;
    if ( Array.isArray(d.value)){ 
        let ui ;
        
        //Add into temp backwardss
        for(var i=d.value.length-1; i >-1 ; i--){
            ui = await render_instance(d.value[i], {} );
            if ( ! ui ) continue;
            // Remove existing
            var prior_el = temp.querySelector("#"+d.value[i].id);
            if ( prior_el ) prior_el.remove();
            // Append new
            temp.appendChild(ui)
        }

        /* --You can delete this line.  this sniplet was commented out and replaced in "holder" sniplet below it and the goal is to
            clean up the hard refresh that results in jagged redrawing
        //Now add into canvas backwards always so that each tim added to canvas and temp.children is decremented
        //it correctly adds all children
        canvas.value.innerHTML = ''
        for(var i =temp.children.length-1; i > -1; i--){
            canvas.value.appendChild( temp.children[i] ); 
        }*/
        let holder = document.createElement("div");
        holder.classList.add("holder");
        canvas.value.innerHTML = ''
        for(var i =temp.children.length-1; i > -1; i--){
            holder.appendChild( temp.children[i] );
        }
        canvas.value.appendChild(holder)

        
        canvas.value.querySelectorAll(".block-instance > .edit-controls, .block-instance .lookup ").forEach(ec=>{
            util.trigger('ready', ec, {})
        })

        canvas.value.querySelectorAll(".lookup").forEach(lk=>{
            util.trigger('selected-value',lk, {});
        })
    }
    evaluate_document()
    var doc_settings = canvas.value.querySelector("button.document-settings"); 
    if ( doc_settings)doc_settings.addEventListener('click',(e)=>{
        e.preventDefault(); e.stopPropagation()
        emit_settings_emits()
    })
    var more_info = canvas.value.querySelector("button.more-info");
    if (more_info ){
        more_info.addEventListener("click",(e)=>{
            e.preventDefault(); e.stopPropagation()
            var icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
</svg>
`
            var wrd_sum = `<h2 class="color-primary-600"><span>${icon}</span> <span>Content Summary</span></h2>`+
            `<p>Pre-count ${word_summary.value.pre_count} / Count ${word_summary.value.count}</p>`

            var tmp = `<div class="overflow-auto flex gap-2 p-1 mb-2 flex-wrap" style="font-size:80%; max-width: 450px; max-height: 220px">`, word 
            for(var i=0; i< word_summary.value.list.length; i++){
                word = word_summary.value.list[i]
                tmp += `<div class="border border-solid border-gray-200 rounded px-1 hover:bg-primary-50">` +
                    ` ${word.word } <b class="${word.count > 5 ? 'color-primary-500' : 'color-gray-400'}">${word.count}</b></div>`
            }
            tmp += `</div>`
            wrd_sum += tmp

            var iconx= `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.745 3A23.933 23.933 0 003 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.78 1.5 5.817 1.5 9s-.533 6.22-1.5 9M8.25 8.885l1.444-.89a.75.75 0 011.105.402l2.402 7.206a.75.75 0 001.104.401l1.445-.889m-8.25.75l.213.09a1.687 1.687 0 002.062-.617l4.45-6.676a1.688 1.688 0 012.062-.618l.213.09" />
</svg>
`
            $util.open_modal({
                title : ``,
                content : `
                 <div class="md:w-400 lg:w-500 ">   
                    ${wrd_sum}
                    <h3 class="text-left mb-3 mt-2 color-primary-600"><span>${iconx}</span><span > 
                        Embeddable Variables</span></h3>
                    <p>Embeddable variables are special formatted strings that place holder data to 
                        be process when the post is render to be rendered.</p>
                    <p>To use use, type: <span class="tag"><b>@</b>toplevel.secondary.so_on.property<b>;</b></span> </p>
                    <p>For example: <span class="tag">@post.title;</span> will output the title for the current post.</p>
                    <ul style="max-width: 480px">
                        <li><b>post</b>: { id, group_id, user_id , layout , created_by_name, created_by_title, tags, published, modified, created, url, amount , description, title }</li>
                        
                        <li><b>site</b>:  {  <site_options> }</li>
                    </ul>
                     
                </div>
                `
            })
        })
    }
    
})


/** Trigger an openning of the parent Document Editor */
let emit_settings_emits = async ()=>{    
    emit_value() 
    setTimeout(()=> emit('settings', { action : 'toggle' , value : null, data : d.value }), 75)
}

let update_gizmos =()=>{
    if ( canvas.value) {  
        canvas.value.querySelectorAll(".block-instance.active")
            .forEach(node =>node.classList.remove("active"))
        if ( inspector_active_block ){
            var active_block = canvas.value.querySelector("#"+inspector_active_block.id); 
            active_block?.classList.add("active")
        }
    } 
}

let do_control_ready = (edit_controls )=>{
    
    util.trigger('ready', edit_controls , {})
    edit_controls.querySelectorAll(".lookup").forEach(lku=>{
        util.trigger("selected-value", lku)
    })
}

/**
 * Variable used to remember what block object is being transfered
 */
let block_instance_to_transfer = null; 

/**
 * Given a block instance, create the internal UI, and append children into children slots and then
 * return the overall root HTML representation.
 * @param {Object} block_instance { id, type, children, data }
 * @param {Object} render_props Properties passed in from parent to this instance
 * @returns {HTMLElement} 
 */
let render_instance =  async (block_instance, render_props, tab=0)=>{
    if ( ! block_instance) return; 
    if ( ! Array.isArray(block_instance.children)) block_instance.children = [] ;
    var must_set_as_active_on_append = block_instance.set_active_on_append || false;
    delete block_instance.set_active_on_append ;

    
    let block_class = get_block_class(block_instance)
    if ( ! block_class){
        console.error(block_instance, "has null block-class " + block_instance.type);
        var stand_in = document.createElement("div");
        stand_in.classList.add("stand-in","not-found", "relative")
        stand_in.innerHTML=`<b>{</b> <span ><i class='color-red-500 font-extrabold'>${block_instance.type} Block</i> (${block_instance.id}) `+
            `Not Found</span> <b>}</b> <p class="mt-3 text-sm color-gray-400">block will not render when published</p> `+
            `<div class="absolute" style="bottom:1em;right:1em">`+
            `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 color-red-500 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg></div>`
        
        var fxremove = el2('button',{ classes: ['absolute','danger'],
            attrs: {'data-title': 'Remove block'},
            style:{top:'0.4em', right: '0.5em'},
            onClick(e){
                remove_block_instance(block_instance)
            },
            innerHTML:`
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            `
        })
        stand_in.appendChild(fxremove)
        return stand_in;
    }

    //Ensure all rendered instances always have an ID
    if ( ! block_instance.id ) block_instance.id = create_block_id()
    let block_id = block_instance.id; 
    if ( tab == undefined ) tab =0;

    //Create the top level wrapper for the block-instance
    let instance_root = document.createElement("div");
    let block_type = block_instance.type.toLowerCase()
    let el_block_info = document.createElement("div") 
    el_block_info.classList.add("absolute","block-info", "flex","gap-2","items-center","p-1","bg-white", "text-sm") 
    el_block_info.style.bottom="-24px"
    el_block_info.style.left="25px"
    let el_block_name = document.createElement("span") 
    el_block_name.innerHTML = block_type
    el_block_info.appendChild(el_block_name ) 


    instance_root.appendChild(el_block_info)
    block_instance.type = block_type
    instance_root.classList.add("block-instance", block_type)
    instance_root.setAttribute("block-type", block_type)
    instance_root.id    = block_id; 

 
    instance_root.addEventListener('mouseout',(e)=>{
        instance_root.classList.remove("has-mouse")
    })
    instance_root.addEventListener('dragover', (e)=>{
        instance_root.classList.add('draggin-on-block')
    })
    instance_root.addEventListener('dragleave', (e)=>{
        instance_root.classList.remove('draggin-on-block') 
    })
     
    instance_root.addEventListener('click',(e)=>{
        e.stopPropagation()
        e.preventDefault()
        
        set_inspector(block_instance );
    })
    instance_root.addEventListener('destroy',(e)=>{
        e.stopPropagation()
        e.preventDefault()
        e.target.remove();  
    })


    instance_root.addEventListener('blur',(e)=>{ //re-draw the block on an event
        let old_instance_root   = instance_root;
        let parent_root         = old_instance_root.parentElement;
        e.stopPropagation()
        let delay = 1;

        setTimeout (async (parent_el)=> {// Perform Re-draw (redraw)
            
            update_gizmos() 
            evaluate_document();

            if ( !parent_el){  return; } 

            if ( ! is_redraw () ){ 
                emit_value ();
                debug(4,"redraw not required")
                return;
            }
            debug(tab,"Event.blur Fields changed") 
            
            delete inspector_controls[block_id] ;
            let new_block_instance= await render_instance(block_instance, render_props, tab+1)
            if ( ! new_block_instance ) return; 
            if ( inspector_active_block && inspector_active_block.id == block_instance.id){ 
                new_block_instance.classList.add("active")
            }
            try{  
                old_instance_root.classList.add('delete-me')
                parent_el.insertBefore(new_block_instance, old_instance_root)
                old_instance_root.remove();
                forcibly_set_inspector = block_instance.id;
                
                emit_value ();

                //Run Post insertion events for special elements
                new_block_instance.querySelectorAll(".lookup").forEach(lk=>{
                    util.trigger('selected-value',lk, {});
                })

                setTimeout(()=>{
                    new_block_instance.querySelectorAll(".edit-controls").forEach(node=>{
             
                        do_control_ready ( node ) 

                        
                    }) 
                }, 50)//make the newly replaced element ready 

                debug(2,"Re-render",`${block_type}.${block_instance.id}`)
                
            }catch(exc){  }
            setTimeout(()=>{
                set_inspector(block_instance);
                //reset redraw flag, remove the, now, old
                util.trigger('destroy',old_instance_root )            //Remove old  instance root
                d_has_changed=false; 

            },110)
            
        }, delay, parent_root)
    })
    
    if ( ['paragraph','title'].includes(block_type) ){   
        instance_root.addEventListener('new_paragraph',async (e)=>{  
            var new_block_instance = {type:"paragraph",data:{ }}
            new_block_instance.set_active_on_append = true; 
            
            await add_block_instance(new_block_instance, {
                after : block_instance.id, call_from : 'dynamic-new-paragraph',
                parent : get_block_instance_parent(block_instance.id) ,
                is_new : true 
            }) 
             
        })
    }

    
    let over_drag_indicator =(e)=>{
        e.preventDefault()
        e.target.classList.add("hover");
    }
    let drop_on_indicator = async (e)=>{
        e.preventDefault()
        if ( ! block_instance_to_transfer ) return; 

        //Get the block-instance being transfered
        var dragged_instance = get_block_instance(block_instance_to_transfer);
        e.stopPropagation()

        var parent_instance = get_block_instance_parent(block_instance.id);
        var parent_belly    = get_block_instance_parent_belly(parent_instance);
        if ( ! parent_belly) return;  


 
        if ( !is_drop_allowed(parent_instance )) {
            debug(2,'before/after drop denied')
            return; 
        }
        var max_iteration =2000;
        for(var i=0, it=null; i < parent_belly.length;i++){
            it = parent_belly[i];
            if ( block_instance.id == it.id){
                
                let target_name = null, is_before =  e.target.classList.contains("before");
                if ( is_before ){
                    if ( parent_belly[i-1]) target_name = block_instance.id;
                }else {
                    if ( parent_belly[i+1]) target_name = block_instance.id; 
                }
                if ( target_name == null) target_name = block_instance.id;
                let before  =  is_before ? target_name : undefined;
                let after   = !is_before ? target_name : undefined; 
                await add_block_instance (dragged_instance, 
                    { parent : parent_instance, before, after, call_from: 'drop-on-indicator'})
                break;
            }
            if (i >= max_iteration) {
                console.warn("Force Stop:",i);
                break;
            }
        }
    }
    let drag_indicator_before   = document.createElement("div");
    drag_indicator_before.classList.add("drag-indicator","before");
    instance_root.appendChild( drag_indicator_before ) 
    drag_indicator_before.addEventListener('dragover',over_drag_indicator)

    let drag_indicator_after   = document.createElement("div");
    drag_indicator_after.classList.add("drag-indicator","after"); 
    drag_indicator_after.addEventListener('dragover',over_drag_indicator);

    drag_indicator_before.addEventListener('drop', drop_on_indicator);
    drag_indicator_after.addEventListener('drop', drop_on_indicator);
    


    let clean_indicators = ()=>{
        drag_indicator_after.classList.remove("hover")
        drag_indicator_before.classList.remove("hover")
        drag_indicator_after.style.display      = '';
        drag_indicator_before.style.display     = '';

        //Strategically hide the drag indicator based on the instance_root index 
        var parent_root =instance_root.parentElement;
        if ( ! parent_root) return; 

        var is_first , is_last , is_inbetween ;
        var child_count = parent_root.children.length; 
        for(var i=0; i < child_count; i++){
            if ( parent_root.children[i] == instance_root){
                is_first = i == 0;
                is_last = i == child_count-1;
                is_inbetween = !is_first && !is_last; 
                
                break;
            }
        }
        if (child_count > 1 ){ 
            if ( is_first ){
                drag_indicator_after.style.display='none' 
            }
            if ( is_last){
                if(child_count > 2){// 3 or more
                    drag_indicator_before.style.display='none'
                }

            }
        }
    }
    instance_root.addEventListener("dragenter",clean_indicators)
    instance_root.addEventListener("dragleave",clean_indicators)

    let set =  (object_field)=>{ // I removed the util.debounce out from set to allow for quicker writes
        if ( ! object_field ) return; 
        var fields_affected     = 0;
        var affected_keys       = Object.keys(object_field);

        var valid_children_container = Array.isArray( block_instance.children)
        for ( let key of affected_keys){
            if ( ['fn_sort'].includes(key)){
                var fn = object_field[key];
                if (  fn   ) { 
                    if ( valid_children_container && key == 'fn_sort'){ 
                        block_instance.children = block_instance.children.sort( fn  )
                        
                        var v = util.copy( block_instance.childrn)  
                        v.forEach( it=>{
                            console.log (it.data )
                        })
                    
                    }
                }
                d_has_changed = true;  
            }else { 
                block_instance.data [ key ] = object_field[key]
                // debug (tab,"[" + key + "=>" +object_field[key]+ "]")
                fields_affected ++;
            }
        }

        var instantiated = get_block_class(block_instance)
        for ( let key of Object.keys(instantiated)){
            if ( affected_keys.includes(key)) continue; 
            if ( block_instance.data[key] === undefined) 
                block_instance.data[key] = null; 
        }

        if ( fields_affected > 0 ) {  
            //util.trigger('redraw',instance_root ) 
        }
        return block_instance.id; 
    } 
    let query = (css_selector, return_root_on_null )=>{
        var rd = canvas.value.querySelector("#"+block_id );
        var out = rd.querySelector(css_selector); 
        if (!out && return_root_on_null) out = instance_root; 
        return out; 
    }
    let get = (field)=>{
        var val = block_instance.data[field];
        return val;
    }
    let cls  = ()=>{
        var str = get('classes');
        var arr = null 
        if ( !str) arr = [];
        else arr = str.split(/[\s,]/g)
        return arr  
    }
    let append = (child_block_instance)=>{
        if ( ! child_block_instance ) return null; 
        if ( ! child_block_instance.type ||  !child_block_instance.data ) return null; 
        if  ( !Array.isArray (block_instance.children) )block_instance.children = []

        let block_class = get_block_class({type : block_instance.type, data : {} });
        if (! block_class.drop( child_block_instance ) ) {
            console.error(`Cannot append ${child_block_instance.type} into ${block_instance.type}`)
            return null; 
        } 
        block_instance.children.push(child_block_instance)
        return true;
    }

    
    //Create the block-instance UI
    let el_edit_controls = null;
    let edit_param = { 
            ... component_props.options,  
            fonts : util.get_font_list ( component_props.options.fonts ), 
            id : block_id, useRequest, 
            el: el_compiler , append,
            set, get, query , q : query, cls, 
            block_type : block_instance.type, 
            block_id : block_instance.id ,
            debounce : util.debounce,
            util , props : render_props , create_block_id,
            post_types : list_post_types ,
            child_count : block_instance.children.length, 
        }

    try {
        el_edit_controls = block_class.edit( edit_param );
    
    }catch(e){
        console.error(`${block_type}.edit error - (${e.message})`,"\n" , e )
        throw new Error(e.message)
    }
    try{ 
        el_edit_controls.querySelectorAll("[fn]").forEach(node=>node.removeAttribute('fn'))
        var font_family = block_instance.data.font_family
        var font_size = block_instance.data.font_size; 
        if ( font_family )  el_edit_controls.style.fontFamily = font_family
        if ( font_family =='google'){
            try { 
                var g_fontname = block_instance.data.font_google
                el_edit_controls.style.fontFamily = g_fontname

                var font_google     = g_fontname.replace(/\s/gm,'+');
                var font_google_id  = g_fontname.replace(/\s/gm,'_');
                var ltag            = document.head.querySelector("link#"+font_google_id);
                if ( ! ltag ) {
                    var baseurl = `https://fonts.googleapis.com/css2?family=` 
                    ltag        = document.createElement("link");
                    ltag.setAttribute ("rel","stylesheet")
                    ltag.setAttribute("href",`${baseurl}${font_google}`)
                    ltag.id = font_google_id
                    document.head.appendChild( ltag )
                }
            }catch(e){console.error(e)}
        }
        if ( font_size ) el_edit_controls.style.fontSize = font_size; 
 
        if ( typeof block_class.assets == 'function' ) {
            var asset_arr = block_class.assets (el_edit_controls);
            var A, elo
            for(var i=0; Array.isArray(asset_arr) && i < asset_arr.length;i++){
                A = asset_arr[i];
                if ( A.tag == 'callable')continue; 
                if ( !A.id ) continue; 
                elo = document.head.querySelector("#"+A.id);
                if ( !elo){
                    elo = document.createElement(A.tag);
                    elo.id = A.id; 
                    for(var key in A) {
                        if ( key == "tag")continue; 
                        elo[key] = A[key]
                    }
                    document.head.appendChild(elo)
                }
            }
            for(var i=0; Array.isArray(asset_arr) && i < asset_arr.length;i++){
                if ( A.tag != 'callable' )continue; 
                if ( typeof A.fn=='function') {  
                   setTimeout((asset)=> asset.fn(el_edit_controls),120, A )
                }
            }
        }
        
    }catch(e){
        console.error(`Error(${e.message}) within ${block_type} Block`, block_instance, "edit function")
        console.log ("\t",e.message, util.copy( block_instance) )
        throw new Error(e.message)
    }
    el_edit_controls.classList.add("edit-controls")
    instance_root.appendChild( el_edit_controls ); 
    do_control_ready( el_edit_controls )


    make_custom_checkboxes_clickable(instance_root);
    
    
    //Create the custom global style element
    var global_css = typeof block_class.style == 'function' ? block_class.style({ edit_mode: true, block_id : block_instance.id }) : null;
    if ( global_css) {
        var previous_css_el = document.querySelector("#style-" + block_type);
        if ( ! previous_css_el ) { 
            var global_css_el       = document.createElement("style");
            global_css_el.classList.add("blk-style")
            global_css_el.id        = "style-" + block_type; 
            global_css_el.innerHTML = global_css;
            previous_css_el         = global_css_el
            document.body.appendChild(global_css_el);
        }else {
            previous_css_el.innerHTML = global_css
        } 
    }

    /**
     * @params {Object} Block instance to drop into
     * @returns {Boolean} Returns true always, accept is Class.drop is defined
     */
    let is_drop_allowed = (into_instance_object)=>{
        if( into_instance_object == null) return true; 
        if ( ! block_instance_to_transfer ) return false; 

        var class_obj = get_block_class(into_instance_object);
        if (typeof class_obj.drop == 'function'){ 
            let dragged_instance = get_block_instance(block_instance_to_transfer);
            var allowed =  class_obj.drop ( dragged_instance )  
            if ( ! allowed ) {
                debug(1, into_instance_object.type + "."+into_instance_object.id, " restricts ", 
                dragged_instance.type ," to be dropped")
                return false ; 
            } 
            return true; 
        }else {
            //If funct
            return true; 
        } 
    }
    
    //Check to see if there is a placement location for children elements 
    // for the block UI
    var el_slot = el_edit_controls.querySelector(".children-slot");
    if ( el_slot){ 
        if ( block_instance.children.length > 0 ){
            el_slot.classList.add("has-children");
        }else {
            el_slot.classList.add("empty-nest")
        }
        el_slot.addEventListener('dragenter', (e)=>{
            e.target.classList.add("dropzone")
            var el_blk_inst = e.target.closest("[block-type]");
            if ( ! el_blk_inst) return; 
             
            if ( ! is_drop_allowed(get_block_instance(el_blk_inst.id ))){
                e.target.classList.add("not-allowed")
            }
        });
        el_slot.addEventListener('dragleave', (e)=>{
            e.target.classList.remove("dropzone","not-allowed")
        });
        el_slot.addEventListener('dragover',(e)=>{
            e.preventDefault()
        })
        el_slot.addEventListener('drop',async (e)=>{
            e.preventDefault(); 
            e.stopPropagation()
            
            let dragged_instance = get_block_instance(block_instance_to_transfer);
            if ( !is_drop_allowed(block_instance )) return;
            
            ///var parent= get_block_instance(block_instance.id)
           
            await add_block_instance( dragged_instance ,{ 
                parent : block_instance ,   append : true, call_from : "drop-event"
            })
        })
    }
    if ( el_slot && block_instance.children ){ 
        var props = el_slot.getAttribute("props");
        try {
            props = JSON.parse( props ) || {}
        }catch(e){
            console.error("Unable to parse props", props)
            props= {}
        }
        var child_instance, rendered_child;
        for ( var i =0; i< block_instance.children.length; i++){
            child_instance = block_instance.children[i];
            if ( ! child_instance ) continue; 
            canvas.value.querySelectorAll("#"+child_instance.id).forEach(node => node.remove())

            rendered_child = await render_instance(child_instance, props );
            // append the child into the slot for children
            if ( rendered_child) {
                var child_prior_el = canvas.value.querySelector("#"+child_instance.id);
                if ( child_prior_el) child_prior_el.remove(); 
                el_slot.appendChild( rendered_child );
            }
        }
    }

    //Create Holder for this block-instance's inspector items: defaluts & custom
    if ( ! inspector_controls[block_id] ) {
        inspector_controls[block_id] = {
            type : block_type,
            defaults : [] ,
            custom : null, 
        }
    }

    _render_inspector(edit_param, el_edit_controls, block_instance, instance_root)
    _render_quick_actions(instance_root, block_instance)    
    

    // Check if this Block Has Server Side Rendering
    var server_side_el = instance_root.querySelector(".serverside");

    if ( server_side_el) { 
        //Make sure the serverside render element is an immediate child of this current block instance
        var parent_block_root = server_side_el.closest(".block-instance");
        var is_immediate = parent_block_root == instance_root;

        if ( is_immediate){ 
            try { 
                var res = await useRequest({ url: "/api/site/block-render", method: "post", body: block_instance });
               
               
                if ( res.d ) {   
                    server_side_el.innerHTML = res.d.html;  
        
                }else {
                    server_side_el.innerHTML=`<span><b class="color-red-500">{ Server Error}</b></span>`
                } 
            }catch(iex){
                console.error(iex,"Unexpected error")
            }
        }
    }
     
    instance_root.appendChild( drag_indicator_after )
    if ( must_set_as_active_on_append ) {
        setTimeout(()=>{
            set_inspector(block_instance)
            var editable = instance_root.querySelector(".editable");
            if ( editable) editable.focus()
        },30)
    }
    instance_root.querySelectorAll("[fn]").forEach(node=>node.removeAttribute('fn'))
    return instance_root;
}
/**
 * 
 * @param {Object} edit_param { id , set, get, el } Properties and functions to pass to Block compiler
 * @param {*} el_edit_controls The complete set of compiled HTML values 
 * @param {*} block_instance 
 */
let _render_inspector = (edit_param, el_edit_controls, block_instance, block_root)=>{
    let block_id = block_instance.id; 
    //Build out all the default inspector controls and store them in the holder
    var reg_bloc =null; 
    for ( var i =0;  reg_blocks.value && i < reg_blocks.value.length; i++ ){
        reg_bloc = reg_blocks.value[i];
        if( reg_bloc && reg_bloc.is_inspector){//only if is inspector
            var cls     = get_block_class  ({ type : reg_bloc.name , data : block_instance?.data }, true)
            var isptr   = cls.edit(edit_param)//HTML control
            var priority = Number.parseFloat( isptr.getAttribute('priority') )
            var defaults = inspector_controls[block_id].defaults; 
            var already_exists = false; 
            for(var j=0; j < defaults.length; j++){
                if ( defaults[j].type.toLowerCase() == reg_bloc.name.toLowerCase()){
                    defaults[j].value = isptr;
                    defaults[j].priority=priority;
                    already_exists = true; 
                }
            }
            if ( ! already_exists){
                //Apply any styles housed within the inspector right upon render
                isptr.querySelectorAll("style").forEach(s =>{ 
                    s.remove();//remove it from the inspector where it is at currently
                    block_root.appendChild(s) //then append it to the root block
                })

                defaults.push({ type : reg_bloc.name.toLowerCase() , value : isptr });
            } 
        }
    }
    //Add the custom controls to the Holder as well
    var edit_inspectors = el_edit_controls.querySelector(".inspector-elements")
    if ( edit_inspectors){ // if the Block.edit has inspectors, remove it from the edit-controls and append it to the 
        //holding areas until the element is clicked
        edit_inspectors.remove();
        var styles = edit_inspectors.querySelectorAll("style");
        styles.forEach( s =>{ 
            s.remove()
            block_root.appendChild(s)
        })
        inspector_controls[block_id].custom = edit_inspectors;
    }
}
/**
 * Create a visual controls for when user clicks drag handle, or "more" options for the Block item
 * @param {HTMLElement} instance_root The overall HTML Element representint the physical editable block component
 * @param {*} block_instance The Data presentation of the Block item's data
 */
let _render_quick_actions = (instance_root, block_instance)=>{

    // Apply the quick Actions
    /** HTML containing all the contextual button actions or insert new Block controller */
    let quick_actions = document.createElement("div");
    quick_actions.classList.add("quick-actions")
    
    var show_actions_clz="show-actions"
    let evt_cancel_quick_actions = (ce)=>{

        
        if ( !quick_actions.contains( ce.target)) {
            close_quick_actions(ce, false);
        }
    }
    /** Method to close out the quick actions menu */
    let close_quick_actions = (e, success)=>{
        if ( ! e) return;  
        quick_actions.classList.remove( "anime-pop-in")
        quick_actions.classList.add("anime-pop-out");
   
        window.removeEventListener('mousedown',evt_cancel_quick_actions)
        setTimeout(()=>{
            instance_root.classList.remove(show_actions_clz)
            quick_actions.classList.remove("add","modify")
        },100) 
    }
    /** Method to open up the quick actions menu */
    let open_quick_actions = (e)=>{
        e.stopPropagation();
        var has_event_cleaner=instance_root.classList.contains(show_actions_clz);
        quick_actions.classList.remove("add","modify","anime-pop-out");
        instance_root.classList.add(show_actions_clz)
        quick_actions.classList.add("anime-pop-in");
        if ( ! has_event_cleaner) { 
            setTimeout(()=>{
                window.addEventListener('mousedown',evt_cancel_quick_actions) 
            },10)
            
        } 
        
    }
    var buttons_holder = el2('div',{classes: "actions-trigger",   });

    var btn_drag = el2('button',{ 
        attrs : { draggable : true,  'data-title' : block_instance.type, },
        classes: "handle",
        innerHTML:`<svg class="" width="8px" height="8px" fill="currentColor">
            <circle cx="6.5" cy="1.5" r="1.5"></circle><circle cx="6.5" cy="6.5" r="1.5"></circle>
            <circle cx="1.5" cy="1.5" r="1.5"></circle><circle cx="1.5" cy="6.5" r="1.5"></circle> </svg>`,
        onMouseover(e){ 
            instance_root.classList.add("spotlight")
        },
        onMouseleave(e){
            instance_root.classList.remove("spotlight")
        },
        onMouseout(e){
            instance_root.classList.remove("spotlight")
        },
        onClick : (e)=> { 
            e.stopPropagation();
            e.preventDefault() 
            if ( e.shiftKey || e.ctrlKey ) { 
                var parent = get_block_instance_parent(block_instance.id);
                if ( ! parent ) return; 
                set_inspector(parent);
            }else {  
                open_quick_actions(e)
                quick_actions.classList.add("modify") 
            }
        },
        onDragStart( e ){
            block_instance_to_transfer = block_instance.id;   
            canvas.value.classList.add("dragging")  
        },
        onDragEnd(e){ 
            canvas.value.classList.remove("dragging") 
            block_instance_to_transfer = null;  
            canvas.value.querySelectorAll(".dropzone").forEach(n => n.classList.remove('dropzone','not-allowed'))
            
        }, 
    }); //End of button drag
    let btn_add = el2('button', {
        classes: "new-block", style: { },
        innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
         stroke="currentColor" class="w-4 h-4" style="transform:translateY(3px)">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> `,
        onClick : (e)=>{
            e.stopPropagation()
            e.preventDefault()
            open_quick_actions(e)
            quick_actions.classList.add("add")
        }
    })
    buttons_holder.appendChild(btn_add);
    buttons_holder.appendChild(btn_drag);
    instance_root.appendChild(buttons_holder);


    let search = el2('ul',{classes:"search"}, el2('input',{
        classes:'search-context', placeholder:"filter"
    }))
    let search_box = search.querySelector(".search-context");
    search_box.style.borderTopRightRadius = "0"
    search_box.style.borderTopLeftRadius = "0"

    let context_modify  = el2('ul',{ classes : ['filterable','modify','modify-existing-block'],})
    let context_add     = el2('ul',{classes : ['filterable','add', 'insert-new-blocks']});


    search.addEventListener("typing-complete",(e)=>{ 
        let reset = (node)=>{
            node.classList.remove("hidden")
        }
        context_modify.querySelectorAll ("li.hidden").forEach( reset )
        context_add.querySelectorAll ("li.hidden").forEach( reset )

        var txt = e.target.value.toLowerCase(); 
        let search_modify = quick_actions.classList.contains("modify");
        let search_add = quick_actions.classList.contains("add");
        let search_target = search_modify ? context_modify : search_add ? context_add : null; 

        if (! search_target) { 
            return;
        }
        
        search_target.querySelectorAll("li").forEach(node=>{
            let keyword = node.getAttribute("keywords");
            if (! keyword) {  
                return; 
            }
            var keywords = keyword.toLowerCase().split(","); //do not push anything extra unto keywords 

            var has_at_least_one_match = false; 
            keywords.forEach(word=>{
                if ( has_at_least_one_match) return;  
                if ( word.includes(txt)) has_at_least_one_match = true; 
            })
             
            if ( has_at_least_one_match == false) node.classList.add('hidden') 
        }) 
    })

    //Create all list of blocks that can be inserted into the conten t
    if ( reg_blocks.value){ // Add in the Registered blocks

        context_add.appendChild( el2('li', { 
            classes: [  'registered-block', 'item' ,'m-0', 'py-2', 'list-none', 'hover:bg-primary-100', 'ripple' ],
            attrs : { keywords : 'template,sniplet,part'},
            innerHTML :
            `<span class="mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0010.607 12m3.736 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.343 12l-2.882 1.664" />
</svg></span> <span>Template Parts</span>`,
            onClick (e){
                open_template_parts_browser(block_instance,e.shiftKey ) 
                close_quick_actions(null,true);
            }
        }), ) //create block button that allows insertion of templates
        reg_blocks.value.forEach(blk =>{
            //blk = { is_inspector, name, native, priority, status }
            if ( blk.is_inspector) return; 

            var empty_class = get_block_class({type : blk.name , data :{} })
            var name_text   = empty_class.get_name ? empty_class.get_name() : blk.name ;
            var icon        = empty_class.get_icon ? empty_class.get_icon() : '';

            var li = el2('li', {
                    classes: [  'registered-block', 'item' ,'m-0','py-2', 'hover:bg-primary-100', 'ripple' ],
                    attrs : {keywords : blk.name.toLowerCase() } ,
                    onClick : async (e)=>{
                        let new_blk = create_block_instance(blk.name);
                        
                        if ( new_blk.type.toLowerCase() == 'layout'){
                            new_blk.data.layout_gap = "gap-2"
                            new_blk.data.layout_type = "layout-1x3"
                            for(var i=0; i < 3; i++){ 
                                new_blk.children.push({
                                    type : 'container', children : [], id : create_block_id(), data : {}
                                })
                            }
                        }


                        if ( ! e.shiftKey ){ 
                            //Insert directly into parent
                            await insert_new_block_next_to(block_instance, new_blk )
                        }else { 
                            await insert_new_block_into_parent_of(block_instance, new_blk)

                        }

                        close_quick_actions(null,true);
                    }
                }, 
                el2('span',{innerHTML : icon }),
                el2('span',{innerHTML : name_text })
            )
            context_add.appendChild(li)
        })//End of for each loop
        
    }


    let animate_error = (li)=>{
        console.log("Animate error")
        li.classList.add("error");
        setTimeout(()=>{
            li.classList.remove("error")
        },380)
    }
    context_modify.appendChild(  el2('li',{
        classes : ['m-0'],
        attrs : { keywords:"parent,select"}, 
        onClick(e){
            var parent = get_block_instance_parent(block_instance.id);
            if ( ! parent )  return animate_error(e.target)

            console.log("Successfully set parent to inspector")
            set_inspector(parent);
            close_quick_actions(e,true)
            e.stopPropagation()
            e.preventDefault()
        }
    }, el2('span',{classes:['mr-2','shape'], innerHTML:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" 
    viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 19.5l-15-15m0 0v11.25m0-11.25h11.25" />
    </svg>
    `}),el2('span',{innerHTML:"Select Parent"})))


    context_modify.appendChild(     
        el2('li',{ attrs: { keywords:"popout,pop,out" }, classes: ['m-0'],
                onClick:(e)=>{
                    var parent = get_block_instance_parent(block_instance.id );
                    if ( ! parent ) {
                        console.error("cannot popout as no parent exist");
                        return; 
                    }
                    if ( ! e.shiftKey ){ 
                        add_block_instance( block_instance, { parent : get_block_instance_parent(parent.id) , before : parent.id  })
                    }else { 
                        add_block_instance( block_instance, { parent : get_block_instance_parent(parent.id) , after : parent.id  })
                    }
                    //remove_block_instance(block_instance)
                }   
            },el2('span',{ classes:['mr-2', 'shape'] ,innerHTML:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>`}), 
            el2('span',{innerHTML: 'Popout'})
    ))

    context_modify.appendChild(
        el2('li',{ attrs: { keywords:"move,up"},
                onClick:async (e)=>{
                    var parent = get_block_instance_parent(block_instance.id) 
                    var parent_belly = get_block_instance_parent_belly(parent);
                    if ( ! parent_belly ) { console.log ("Move up - no parent belly"); return;  }
                    var before = null; 
                    for ( var i=0; i < parent_belly.length; i++){
                        if ( parent_belly[i].id == block_instance.id && parent_belly[i-1] != undefined) {
                            before = parent_belly[i-1].id;
                            break; 
                        }
                    }
                    if ( ! before) return animate_error(e.target)
                    await add_block_instance(block_instance, {  parent ,   before , call_from : 'context-move-up' })
                    close_quick_actions()
                }
            },el2('span',{ classes:['mr-2', 'shape'],innerHTML:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" 
            viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
            `}), el2('span',{innerHTML: 'Move up'})
        )) 
    
    
    context_modify.appendChild(   //Create quick action for saving template part sniplets  
        el2('li',{ attrs: { keywords:"sniplet, save, template, part" },
                onClick: async (e)=>{
                    
                    var data = util.copy( block_instance );
                    var clean_data = (blk)=>{//recursive function used to walk down the node and clean data before saving
                        if ( ! blk ) return ;
                        delete blk.id 
                        if ( Array.isArray(blk.children ) ){
                            for ( var i=0; i< blk.children.length; i++){
                                clean_data(blk.children[i])
                            }
                        }
                    }
                    clean_data(data);
                    var tp_obj = { title : "", description : "", type : "template-part", url: "#", value : [data] }
                    var data_change = (e)=>{
                         
                    }
                    
                    var msg_area = el2("div",{classes:['color-red-600']})
                    var modal_content = el2('div',{
                            classes : ['save-template-part-modal']
                        },
                        el2('h3',{classes:['title']},"Template Part"),
                        el2('div', {classes: ['content'], style: {maxWidth: '400px'}},
                            el2('div',{},
                                el2('label', {}, "Title"),
                                el2('input', { placeholder: "title",
                                    value : tp_obj.title, 
                                    onInput(e){
                                        tp_obj.title = e.target.value 
                                        data_change(e)
                                    }
                                }  )
                            ),
                            el2('div',{},
                                el2('label', {}, "Description"),
                                el2('text', { placeholder: "description",
                                    value :  tp_obj.description, 
                                    onInput(e){
                                        tp_obj.description = e.target.value 
                                        data_change(e)
                                    }
                                })
                            ),
                            msg_area
                        ),//End content
                        el2('div', { classes: ['footer','flex','justify-end', 'gap-2']},
                            el2('button',{classes: ['danger', 'modal-cancel']}, 'Cancel'),
                            el2('button',{classes: ['button','primary','flat', 'modal-ok']}, 'Save'),
                        )
                    )
                    var res = await util.open_modal({
                        content : modal_content,
                        before_ok (){
                            var min=2
                            if ( tp_obj.title.length <=min || tp_obj.description.length <=min){
                                msg_area.innerText = ("Title or description is too short");
                                console.warn("Revision needed before saving template-part", tp_obj)
                                return false; 
                            }
                            msg_area.innerText = ("");
                            return true; 
                        }
                    })
                    if ( res.action == 'ok'){ 
                        await useRequest({ url: '/api/posts', method : 'post' , body : tp_obj }) 
                    }
                }   
            },el2('span',{ classes:['mr-2', 'shape'] , style :{transform: 'scale(0.8)'},
            innerHTML:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.051.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0010.607 12m3.736 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.343 12l-2.882 1.664" />
</svg>
`}), el2('span',{innerHTML: 'Save As Template'})
    ))

    context_modify.appendChild(     
        el2('li',{ 
                attrs: { keywords:"delete,re,x" },
                onClick:(e)=>{
                    remove_block_instance(block_instance)
                }   
            },
            el2('span',{ classes:['mr-2', 'shape'] ,innerHTML:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 color-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                `}), 
            el2('span',{innerHTML: 'Remove'})
        )
    )



    context_modify.appendChild(     
        el2('li',{ attrs: { keywords:"move,down" },
                onClick: async (e)=>{
                    var parent = get_block_instance_parent(block_instance.id) 
                    var parent_belly = get_block_instance_parent_belly(parent);
                    if ( ! parent_belly ) { console.log ("Move up - no parent belly"); return;  }
                    var after = null; 
                    for ( var i=0; i < parent_belly.length; i++){
                        if ( parent_belly[i].id == block_instance.id && parent_belly[i+1] != undefined) {
                            after = parent_belly[i+1].id;
                            break; 
                        }
                    }
                    if ( ! after)  return animate_error(e.target);  
                    await add_block_instance(block_instance, {  parent ,   after, call_from : 'context-move-down'  })
                }
            },el2('span',{ classes:['mr-2','shape'],innerHTML:`<svg xmlns="http://www.w3.org/2000/svg" 
            fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>

            `}), el2('span',{innerHTML: 'Move down'})
    ))
    
    quick_actions.appendChild   (search);
    quick_actions.appendChild   (context_modify);
    quick_actions.appendChild   (context_add);
    quick_actions.addEventListener('click',(e)=>{
        e.stopPropagation() 
    })

    instance_root.appendChild( quick_actions );
}
let hnd_toggle_data_inspector_pin = ()=>{ 
    var inspector_root = inspector.value;
    if ( ! inspector_root ) return;
    inspector_root.classList.toggle("pinned")
}
/**
 * Update the inspector with the block data that should now be active.  When any UI has an event blur,
 * a new event targeting the Block Instance root element will be triggered.
 * @param {Object} block_instance {type,id,children, data }
 */
let set_inspector = (block_instance )=>{
    //debug(2,"set_inspector to",block_instance?.id)
    /** Root of editor inspector HTML element */
    var inspector_root = inspector.value;
    //Toggle the inspector visiblity based on whether instance is null or not
    if ( inspector_root ){ 
        if ( block_instance ){
            inspector_root.classList.add( "active")
        }else {
            inspector_root.classList.remove("active")
        }
    }
 

    var duplicative_request = false; 
    var block_id = null; 
    block_id = block_instance?.id;
    //If the item is currently select, then exit  - no action required
    if ( block_instance == inspector_active_block ) {   
        var check_dup_request = true;
        if ( forcibly_set_inspector != null && forcibly_set_inspector == block_id){
            check_dup_request = false; 
            forcibly_set_inspector = null; //reset
        }
        if ( check_dup_request ) duplicative_request = true; 
    };
    
    if ( duplicative_request ) {  
        update_gizmos()
        emit('settings', { action : 'set' , value : false})
        return ;
    }
    //Clear what is currently stored
    var content = inspector_root?.querySelector(".content");
    if (  content )  content.remove();
    content                 = document.createElement("div");
    content.classList.add("content");
    content.style.overflow  = 'auto'
    inspector_root.appendChild(content);

    
    content.addEventListener('blur',(e)=>{
        //When the inspector has a blur event, inform the root_instance so that it can see if redraw is needed
        var instance_root = canvas.value.querySelector("#"+ block_id);
        if ( !instance_root) return;
        // debug(3, "Inspector triggered blur")
        util.trigger('blur',instance_root, { inspector_trigger : true });
    })
    content.innerHTML = '';

    update_inspector_height()
    inspector_active_block = block_instance;    //Set what is active
    update_gizmos()
    update_block_tree_position()
    if ( ! block_instance ) return;  
    emit('settings', { action : 'set' , value : false})


    var title       = inspector_root.querySelector(".title");
    var block_class = get_block_class({type : block_instance.type , data:{}});

    var title_text = typeof block_class.get_name == 'function' ? block_class.get_name() : block_instance.type
    title.innerHTML = `<span>${ title_text }</span> : <span>${block_id}</span> `
    title.classList.add( "mb-2","py-2")

    //Ensure that the inspector is sorted
    var arr_sortable_inspector = [];
    if ( inspector_controls[block_id].custom ){ 
        var priority =0;
        try {
            priority = Number.parseFloat(inspector_controls[block_id].custom.getAttribute('priorirty'))
        }catch(nothing){}
        arr_sortable_inspector.push ({ value :  inspector_controls[block_id].custom,   priority     })
    }
    for( var i=0; i < inspector_controls[block_id].defaults.length; i++){

        if ( inspector_controls[block_id].defaults [i] ) { 
            var descriptor = inspector_controls[block_id].defaults [i] 
            arr_sortable_inspector.push ( descriptor  )
        }
    }
    arr_sortable_inspector = arr_sortable_inspector.sort( ( A,B)=>{ // Sort from highest to lowest
        var b = B.value.getAttribute('priority');
        var a = A.value.getAttribute('priority');
        
        if ( ! B.priority ) B.priority = !isNaN(b) ? parseFloat(b) : 0
        if ( ! A.priority ) A.priority = !isNaN(a) ? parseFloat(a) : 0
         
        return B.priority - A.priority
    })
    arr_sortable_inspector.forEach( descriptor =>{ // Add to Element
        content.appendChild( descriptor.value  )
    })

    setTimeout (()=>{
        content.querySelectorAll(".lookup").forEach(lk=>{
            console.log ("<*> Triggering lookup selected-value", lk)
            util.trigger('selected-value',lk, {});
        })
    }, 200)


}

let make_custom_checkboxes_clickable = (instance_root)=>{
    instance_root.querySelectorAll(".s-checkbox").forEach(chk_root=>{
        // Checkboxs dont seem to work when in the canvas, so any that are in
        // inspector areas can be skipped
        var inspector_parent = chk_root.closest(".inspector-elements");
        if ( inspector_parent ) return; //If under the inspector region, then skip

        //for those in canvas, Make it clickable
        var input   = chk_root.querySelector("input[type=checkbox]")
        var lbl     = chk_root.querySelector(".label");
        var chk     = chk_root.querySelector(".checkbox")

        let fn_click = (e)=>{ 

            var chk_input = e.target.parentElement.querySelector("input");
            var prev_val = chk_input.checked
            chk_input.checked = ! chk_input.checked
            chk_input.value = chk_input.checked  ? 'on' : 'off'
            setTimeout(()=>{
                util.trigger('change', chk_input)
                util.trigger('blur', chk_input)
            }, 5)
             
        }
        if ( lbl) {  lbl.addEventListener('click',fn_click) }
        if ( chk) {  chk.addEventListener('click',fn_click); }

        input.addEventListener('change',(e)=>{
            
        })

    })
}

let open_template_parts_browser = async (adj_blk, insert_into_adj_parent )=>{
    var parts = null
    var loading = el2('div',{classes:['flex','justify-center']},
        el2('div',{classes:['loader','loading']})
    )
    var min_h = '250px'
    var selected_template= null; 
    var list_el = el2('ul', {classes:['template-part-list'] , style:{maxHeight: min_h, overflow: 'auto', minHeight:min_h}})
    useRequest({ url: "/api/posts", query :{ type : "template-part"} }).then(res=>{
        if ( res ) parts = res.d 
        else parts = []
        if (loading ) loading.remove() 
        let add_part = (part)=>{
 
            part.value = JSON.parse(part.value ); 
            var part_el = el2('li',{
                    classes: ['media', 'rounded'], attrs: { "post-id" : part.id },style : { padding: 0, border:'1px solid transparent' },
                    onClick (e){
                        list_el.querySelectorAll(".media").forEach(m=>{
                            m.style.borderColor = '';
                            m.classList.remove('active');
                        })
                        part_el.classList.add("active")
                        part_el.style.borderColor = 'var(--primary-500)'
                        selected_template = part ; 
                    }
                },
                el2('div',{ classes: ['image'] },
                    part.image ? el2('img',{src : part.image}) : el2('div',{classes: ['blank-image']})
                ),
                el2('div', { classes: ['content'] },
                    el2('div',{classes:['title'], innerHTML : part.title }),
                    el2('div',{classes:['description'], innerHTML : part.description })
                )
            )
            //Loop all the content parts
            list_el.appendChild(part_el);
        }
        for(var i=0; i < parts.length ; i++) add_part ( parts[i] )
        
    })

    var content = el2('div', { classes:['loading-template-parts']},
        el2('h3',{classes:['title']}, 'Template Parts'),
        el2('div',{classes: ['content']},
            loading, list_el
        ),//Content
        el2('footer',{classes:['footer', 'flex','justify-end','gap-2']},
            el2("button",{classes: ['danger','modal-cancel'] },"Cancel"),
            el2("button",{classes: ['primary','modal-ok','button','flat']}, "Ok")
        )
    )
    util.open_modal({
        content 
    }).then( async res =>{
        if ( res.action!='ok')  return 
        if ( !selected_template ) return ;
        if ( ! Array.isArray(selected_template.value) ) return
        var new_blk = selected_template.value[0];
        if ( ! new_blk ) return; 

        if ( !insert_into_adj_parent ){ 
            insert_new_block_next_to(adj_blk, new_blk)
        }else {
            insert_new_block_into_parent_of(adj_blk, new_blk)
        }
        
        console.log ("User Selected ", new_blk)
    })
}
let insert_new_block_next_to =async (adj_blk, new_blk)=>{

    var parent = get_block_instance_parent(adj_blk.id)
        var can_add = true; 
        if ( parent ) { 
            var cls = get_block_class(parent);
            can_add = cls.drop( new_blk );
        }

        if ( can_add ) { 
            await add_block_instance(new_blk,{ 
                parent ,after:adj_blk.id  ,
                call_from : "add-block-event", is_new : true 
            }) 
        }else debug(1,`Cannot add ${new_blk.type} current block -M0001`)

}
let insert_new_block_into_parent_of = async (adj_blk, new_blk)=>{
    var parent = adj_blk
    var can_add = true; 
    if ( parent ) { 
        var cls = get_block_class(parent);
        can_add = cls.drop( new_blk );
    }
    if ( can_add){ 
        await add_block_instance(new_blk,{ 
            parent , append: true   ,
            call_from : "add-block-event", is_new : true 
        }) 
    }else debug(1,`Cannot add ${new_blk.type} current block -M0002`)
}


 

</script>
<style scoped > 
.data-inspector {
    position: fixed;
    height: 100%;
    width: 280px;
    background: var(--white);
    right: -280px;
    top: 0;
    box-shadow: 0px 0px 4px 0px rgb(25 5 61 / 23%);
    padding: 8px 6px;
    transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms,right 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
    z-index: 200;
}
.data-inspector.active {
    right: 0;
    transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms, right 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
} 
.data-inspector.pinned {
    right: -280px;
    transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms, right 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
} 
.data-inspector h4.title {
    font-size: 0.9em;
}
.data-inspector .pin {
    position: absolute;
    z-index: 100;
    left: -22px;
    background-color: var(--white);
    border: 1px solid var(--ui-border-color);
    border-right: none;
}
</style>