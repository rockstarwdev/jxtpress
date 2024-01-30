export default class  {
 
    constructor(instance, { cp, chk} ){ 

        if ( instance ) {
            this.text = chk(instance.data,'text','')
            this.title = chk(instance.data,'title','')
        }
        cp(instance,this); 
    }
    get_name () {
        return "My ParagrapX"
    }
    get_icon (){
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 9V7.2C8 7.08954 8.08954 7 8.2 7L12 7M16 9V7.2C16 7.08954 15.9105 7 15.8 7L12 7M12 7L12 17M12 17H10M12 17H14"></path></svg>`
    }
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ( {  el , set,    get , cls }) { 
 
        return el ( 'div' , { classes : [    ] },  
                el('editable',{ 
                    on_change : (e)=>{  
                        set({ text : e.detail.value })
                    },
                    attrs : { id : get('element_id') },
                    placeholder : "Your first paragraphm",
                    value : get('text') , classes:['paragraph-editor',... cls() ] }),
                 
                el('inspector', {},
                    
                     
                ) 
        )
    }
    render (core,{inner_html,attr,  esc, id , classes , iattrs }){ 
        var title = esc(this.title);
        if ( title ) title =  attr( 'title', title ) 
        var html = `<p ${id()} ${classes('paragraph-block')} ${title} ${iattrs()} >`+
        `${esc(this.text)} </p>`

        return { html }
    } 
    drop ( instance ) {
        return false 
    }
    style( ){
        return  ` 
        `
    }
    script ( ){
        return `
            console.log ("Yolo this is from block.script")
        `
    }
 
}