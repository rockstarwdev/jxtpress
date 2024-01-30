export default class {

    constructor(instance, {cp, chk} ){ 
        if ( instance && instance.data ) {
            this.font_family = chk(instance.data, 'font_family','') 
            this.font_google = instance.data.font_google 
            this.font_size   = chk( instance.data, 'font_size', '100%')
        }
        cp(instance, cp)
    }
    edit ( { el, set, get, block_id , debounce , query, fonts  }){
        
        if (!fonts ) fonts = []
        fonts.push ({ title : "Google Fonts", value : "google" })

        
        var google_font_control = null;     
        var value_of_font_name = get("font_family")
        if ( this.font_family == 'google') {
            google_font_control = el('div',{},
                el('label', {}, "Googe Font"),
                el('string', {
                    value : this.font_google,
                    placeholder : "Google font name",
                    onChange(e){
                        set({ font_google : e.target.value })
                    }
                })
            ) 
        }

        return  el('inspector',{ priority: 50 },[
                    el('div', {classes:['flex','gap-1',]}, 
                        el('div',{},
                            el('label',{ },  "Font Family" ),
                            el('dropdown',{   value : value_of_font_name  , 
                                classes:['block-font-family'], 
                                values : fonts,
                                html ( it ){
                                    return `<span style="font-family:${it.value}">${it.title} </span>`
                                },
                                onChange(e){
                                    let font_family = e.detail.value 

                                    var editcontrols = null
                                    editcontrols = document.querySelector(`#${block_id} .font-target`);
                                    if (! editcontrols )
                                        editcontrols = document.querySelector(`#${block_id} .edit-controls`);

                                    if ( editcontrols ) {
                                        editcontrols.style.fontFamily = font_family
                                    }

                                    set({ font_family })
                                }
                            }), 
                        ),
                        el('div',{}, 
                            el('label',{}, "Font Size"),
                            el('duplex',{
                                onChange(e){
                                    if ( ! e.detail) return; 
                                    var editcontrols = null; 
                                    
                                    editcontrols = document.querySelector(`#${block_id} .font-target`);
                                    if (! editcontrols )
                                        editcontrols = document.querySelector(`#${block_id} .edit-controls`);
                                    if ( editcontrols ) {
                                        editcontrols.style.fontSize = e.detail.value 
                                    }
                                    set({ font_size : e.detail.value })
                                }
                            },this.font_size),
                        )
                    ),//End side by side font size and famil
                    google_font_control 

            ]) 
    }
    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) {
        return false; 
    }
}