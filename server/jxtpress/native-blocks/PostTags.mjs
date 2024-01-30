export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          
        }
        cp(instance, this)
    }
    edit ( {el} ){
        return el('serverside',{},null); 
    }

    async render (core, {id, classes, iattrs, is_preview , is_404, block_type }){
        
        if ( is_404 ) return { html : `<!-- ${block_type}:post is 404 -->`}
        if ( is_preview ){
            var name = "<span><b>{</b> Post Tags <b>}</b></span>"
            return { 
                html : `
                    <div>
                        <div>${name}</div>
                        <div>
                            <span class="tag">tag 1</span>  <span class="tag">tag 2</span> <span class="tag">...</span>
                        </div>
                    </div>` 
            }
        }else {
            var tags = this.tags;
            if ( ! tags) tags = "div";
            var output = `<div ${id()} ${classes("PostTags")} ${iattrs()} > `;
 
            for(var i=0; i < tags.length; i++){ 
                output += `<a href="/tags/${tags[i]}"><span class="tag mr-2">${tags[i]}</span></a>`
            }
            output += "</div>"
            return { html : output };
        }
 
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