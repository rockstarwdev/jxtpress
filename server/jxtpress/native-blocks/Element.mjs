export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  )  this.tag= chk (instance.data,'tag', 'div') 
        cp ( instance,this );
        
    }

    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query,cls }) { 
        var tag     = "h1";
        var self    = this; 
  
        return el ( 'div' , { classes : [... cls() ] }, 
               
                el('slot',{ 
                     
                }),
                el('inspector', {},[
                    el('label',{text: "Tag"  } ),
                    el('dropdown',{   
                        value :get('tag'), classes : ['tag-type'],
                        values : [
                            { title : "Div", value : 'div' },  
                            { title : "Section", value : 'section' },  
                            { title : "Article", value : 'article' },  
                            { title : "Aside", value : 'aside' },  
                            { title : "Main", value : 'main' },    
                        ],
                        onChange(e){
                            set({tag : e.detail.value })
                        } 
                    })
                ]) 
            
        )
    }
    render (core, { id, classes, s , inner_html, iattrs } ){ 
        var tag = this.tag ; 
         
        var html =  `<${tag} ${classes("element-block")} ${id()}  ${iattrs()} > ${inner_html } </${tag}>`
        return {
            html 
        }
    }

    
    drop ( instance ) {
        return true 
    }
    style(render){
        return ` 
        `
    }
    script (render){

    }
}