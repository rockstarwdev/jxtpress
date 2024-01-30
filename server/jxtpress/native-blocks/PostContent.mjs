export default class {

    constructor(instance, { cp, chk} ){
        //instance.data IS "post" + instance block "data" merged together
        if ( instance ) {
          
        }
        cp(instance, this)
    }
    edit ( {el} ){
        return el('serverside',{
        },null); 
    }
    /**
     * 
     * @param {*} core 
     * @param {*} options { 
     *  css : Function, id : Function, classes : Function, attrs : Function, esc : Function, s|sty |style:Function,
     *  is_preview,  query:Object, params:Object, cookies:Object, headers:Object, req,
     *  consumable_child_data : Data to be consumed by the block,
     *  __the_child : only if consumable child data exists,
     *  the_loop : available when render_post is asked to render categories, tags, search, etc,
     *  block_id, block_type, inner_html, inner_arr , user_id, of_layout : Boolean,
     *  post : the specific post the user visted the page to view; this can be
     *           page, post, or archive listing for tags/categories/etc and contents of it include
     *      { post table plus tags, metas },
     *  
     *  post_id, 
     *  props ,
     *  children : Block's children,
     *  now : {today,date,now,year,month,day}, pagination : {p, limit}, 
     * }  
     * @returns {String} HTML
     */
    async render (core,  {inner_html, esc,id, classes, iattrs  }){
        var style_extra="";
        var additional_classes = ""
        if ( ! this.id ){
            var html =  `<div class="" style="min-height: 8em">` +
            `<b>{</b> Post Content <b>}</b>` +
                `<div class="w-full h-3 bg-gray-200 mb-2 rounded"></div>` +
                `<div class="w-3/4 h-3 bg-gray-200 mb-2 rounded"></div>` +
                `<div class="mb-3 h-3"></div>` +
                `<div class="w-1/3 h-3 bg-gray-200 mb-2 rounded"></div>` +
                `<div class="w-1/4 h-3 bg-gray-200 mb-2 rounded"></div>` +
                `<div class="w-3/4 h-3 bg-gray-200 mb-2 rounded"></div>` +

                
                `<div class="w-1/4"></div>` +
                `<div class="mb-3 h-3"></div>` +
                `<div class="w-1/3 h-3 bg-gray-200 mb-2 rounded"></div>` +
                `<div class="w-1/4 h-3 bg-gray-200 mb-2 rounded"></div>` +
                `<div class="w-16 h-3 bg-gray-200 mb-2 rounded"></div>` +
                `<div class="mb-4 h-3"></div>` +
            `</div>`

            return { html }
        }else {
            if ( ! inner_html ) {
                additional_classes += " hidden "
                inner_html = "<!--  no inner_html supplied -->"
            }
        }
        var html = `<div ${id()} ${classes("PostContent " + additional_classes) }  ${iattrs()}  t="post-content">`+
                `${inner_html } </div>`;
        return { html }
    }
    
    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) { 
        return false 
    }
}