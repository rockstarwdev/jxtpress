export default class  {
 
    constructor(instance, { cp, chk} ){ 
        if ( instance  )   this.text =chk ( instance.data, "text", "Title")
        if ( instance  )  this.level= chk (instance.data,"level", 1) 
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
        switch(this.level){
            case 1 : tag = "h1"; break;
            case 2 : tag = "h2"; break;
            case 3 : tag = "h3"; break;
            case 4 : tag = "h4"; break;
            case 5 : tag = "h5"; break;
            case 6 : tag = "h6"; break; 
        }
        var text = get('text');
        return el ( 'div' , { classes : [ ] }, 
               
                el('editable',{  editable:true, 
                    classes:['title-editor', ... cls() ], use_tag : tag  , 
                    attrs : { id : get('element_id') },
                    onChange (e){
                        set({ text : e.detail.value })
                    }
                }, text ),
                el('inspector', {},[
                    el('label',{text: "Level"  } ),
                    el('dropdown',{   
                        value :get('level'), classes : ['level'],
                        values : [
                            { title : "Level 1", value : 1 },  
                            { title : "Level 2", value : 2 },  
                            { title : "Level 3", value : 3 },  
                            { title : "Level 4", value : 4 },  
                            { title : "Level 5", value : 5 },  
                            { title : "Level 6", value : 6 },   
                        ],
                        onChange(e){
                            set({level : e.detail.value })
                        } 
                    })
                ]) 
            
        )
    }
    render (core, { id, classes, s, iattrs  } ){ 
        var tag = "h1"; 
        switch(this.level){
            case 1 : tag = "h1";break;
            case 2 : tag = "h2";break;
            case 3 : tag = "h3";break;
            case 4 : tag = "h4";break;
            case 5 : tag = "h5";break;
            case 6 : tag = "h6";break; 
        }
        var html =  `<${tag} ${classes("title-block")} ${id()} ${iattrs() }>${this.text} </${tag}>`
        return {
            html 
        }
    }

    
    drop ( instance ) {
        return false 
    }
    style(render){
        return ` 
        `
    }
    
    script (render){

    }
}