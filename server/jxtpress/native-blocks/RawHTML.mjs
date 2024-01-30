export default class  {
 
    constructor(instance, { cp, chk} ){ 
        //text , title 
        if ( instance){
            this.html = chk(instance.data,"html", "") 
            this.wrap = chk(instance.data,"wrap", false)
        }
        cp(instance,this);
    }
 
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ( {  el , set,    get, query , cls  }) { 
        

 
        return el ( 'div' , { classes : [ "html-block", ... cls() ] },   
            el('div', {  }, 
                el('text', {classes : ['html-code'] , 
                    onChange(e){
                        set({html: e.target.value })
                    },
                    style : {
                        minHeight : '145px'
                    }
                }, this.html)
            ),
            el('inspector', {},
               el('checkbox', {
                    label : "Wrap HTML", title : "When rendering, wrap HTML with DIV",
                    onChange(e){
                        console.log ("Changed checkbox", e.target, e.target.value)
                        set({ wrap : e.target.checked })
                    }
               }, this.wrap )
            )
        );
    }
    render (core,{inner_html, esc, id , classes, iattrs  }){ 
        
        var html = 
        `<div ${id()} ${classes('raw-html')} ${iattrs()} >`+ 
            `${this.html }` +
        `</div>`
        if ( ! this.wrap ) {

            html = `<!-- RawHTML ${id() } ${classes() }-->\n${this.html }\n <!-- /RawHTML -->\n`
        }

        return { html }
    } 
    drop ( instance ) {
        return false 
    } 
 
}