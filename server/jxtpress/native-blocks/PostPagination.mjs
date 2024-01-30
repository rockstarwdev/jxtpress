export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          this.height = chk(instance.data, "height", "24em")
        }
        cp(instance, this)
    }
    edit ( {el, set, util, get, query }){
        return el('serverside',{ },
            el('inspector',{},
                /*el('duplex',{
                    onChange(e){
                        if ( ! e.detail ) return; 
                        
                        var height =  e.detail.value
                        set({ height  })
                        var elh = query(".post-feature-image");
                        if ( elh ) {
                            elh.style.height = height
                        }
                    }
                }, get('height')) */
            )
        ); 
    }

    async render (core, { esc,classes,is_preview, pagination, id , iattrs  }){
        var img= `<b>{</b>Post Feature Image<b>}</b>`; 
        var mark_up="";
        
        var url = pagination.url 
        

        var n_sibling = 2;
        const left_sibling_index  = Math.max(pagination.p - n_sibling, 1);
        const right_sibling_index = Math.min(pagination.p + n_sibling, pagination.pages );
        var ranges = [];

        ranges.push({ p : 1 ,  title : "1" })

        if ( left_sibling_index != 1 ) {
            ranges.push({ p : null, title : "...", dots: true })
            for ( var i = left_sibling_index; i < pagination.p; i++){
                ranges.push({ p : i , title : i.toString() })
            }
        }else {
            for ( var i = 2; i < pagination.p+1; i++){
                ranges.push({ p : i , title : i.toString() })
            }
        } 
        //HERE for current page
        if ( !  [ 1, pagination.pages].includes ( pagination.p)  ) { 
            ranges.push({ p : pagination.p , title : pagination.p?.toString() })
        }


        if ( right_sibling_index != pagination.pages ) {
            for ( var i = pagination.p+1; i < right_sibling_index+1; i++){
                ranges.push({ p : i , title : i.toString() })
            }
            ranges.push({ p : null, title : "...", dots : true })
        } else {
            for ( var i = pagination.p+1; i < right_sibling_index; i++){
                ranges.push({ p : i , title : i.toString() })
            }
        }

        if ( pagination.p != pagination.pages )  ranges.push({ p : pagination.pages ,  title : pagination.pages?.toString() })

        

        pagination.left = left_sibling_index
        pagination.right = right_sibling_index
        
        if (  is_preview){
            
            mark_up = `<h1>Hi Pagination preview</h1>`
        } else {
            var html_items = '', rng, inners = "" ,url =''
            for(var i =0;i < ranges.length; i ++){

                rng = ranges[i];
                rng.current = pagination.p == rng.p 
                inners = rng.dots ? rng.title : `<a href="${url}?p=${rng.p}&limit=${pagination.limit}">${rng.title }</a> `
                html_items += `<li class="item ${rng.current ? 'current': ''} ${rng.dots ? 'dots' : ''} "> ${inners}  </li>`
            }
            mark_up = `${html_items}`
        }
        if ( pagination.pages == 1 ) mark_up = '<!-- Pagination not necessary -->';
        var html = `<ul ${id()}  ${iattrs()}  ` + 
        `${classes("post-pagaination pagination") } > ${mark_up} </ul>`


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