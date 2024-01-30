export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  ) {
            this.image      = chk(instance.data,'image'     )
            this.title      = chk(instance.data,'title'     )
            this.subtitle   = chk(instance.data,'subtitle'  )
            this.tiny_text   = chk(instance.data,'tiny_text'  )
            this.wrap_link  = chk(instance.data,'wrap_link' )

            this.button1 = chk(instance.data,'button1' )
            this.button2 = chk(instance.data,'button2' )
        }
        cp ( instance,this );
        
    }

    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query, cls }) { 
        var tag     = "h1";
        var self    = this; 
        var img_url = this.image ;
        try { 
        var out =  el ( 'div' , { classes : ['card','no-padding', ... cls() ] }, 
               el('div',{classes:['card-image'] },
                 !img_url ? el('div',{}) : el('img',{ src: img_url })
               ),
               el('div',{classes:['card-content']},

                    !this.tiny_text ? null: el('div',{classes:'tiny-text'}, this.tiny_text  ),
                    el('div',{classes:'title'}, this.title || "Card title..."),
                    el('div',{classes: 'subtitle',},this.subtitle || "Your subtext ..."),
               ),
               el('inspector', {},[
                    el('div',{},  
                        el('label',{text: "Title"  } ),
                        el('string',{   
                            value :get('title'),  
                            onChange(e){
                                set({title : e.target.value })
                            } 
                        })
                    ),
                    el('div',{},  
                        el('label',{text: "Subtitle"  } ),
                        el('text',{   
                            value :get('subtitle'),  
                            onChange(e){
                                set({subtitle : e.target.value })
                            } 
                        })
                    ),

                    el('div',{},  
                        el('label',{text: "Tiny Text"  } ),
                        el('string',{   
                            value :get('tiny_text'),  
                            onChange(e){
                                set({tiny_text : e.target.value })
                            } 
                        })
                    ),
                    el('div',{},  
                        el('label',{text: "Image"  } ),
                        el('media',{ 
                            value : this.image , placeholder : "Image URL",
                            onChange (e){
                                var files = e.detail.d; 
                                if (files.length == 0 ){
                                    set({image : "" })
                                }else {
                                    set({ image : files[0].url })
                                } 
                            }
                        })
                    ),

                    el('div',{},  
                        el('label',{text: "Wrap Link"  } ),
                        el('string',{   
                            value :get('wrap_link'),  
                            onChange(e){
                                set({wrap_link : e.target.value })
                            } 
                        })
                    ),
                ]) 
        )

        return out; 
        }catch(e){
            console.error(e)
            return el('h1',{innerHTML: "HELLLLL"})
        }
    }
    render (core, { id, classes, s , inner_html, iattrs } ){ 
        var tag             ="div"; 
        var img_html        =``;
        var title_html      =``
        var subtitle_html   =``
        var tiny_text_html  = ``
        var a0            =``
        var a1            =``
        if ( this.tiny_text){
            tiny_text_html = `<small class='tiny-text'>${this.tiny_text}</small>`
        }
        if ( this.wrap_link ) {
            a0 = `<a href="${this.wrap_link}">`
            a1 = `</a>`
        }
        if ( this.image ) {
            img_html = `<div class="card-image"><img src="${this.image}"></div>`
        }
        if ( this.title ) {
            title_html = `<div class="title">${this.title }</div>`
        }
        if ( this.subtitle ) {
            subtitle_html = `<div class="subtitle">${this.subtitle }</div>`
        }
        
        var html =  `${a0}
            <${tag} ${classes("card-block card no-padding")} ${id()}  ${iattrs()} > 
                ${img_html}
                <div class="card-content">
                    ${tiny_text_html}
                    ${title_html}
                    ${subtitle_html}
                </div>
            </${tag}> ${a1}`
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