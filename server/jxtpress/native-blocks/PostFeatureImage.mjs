export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          this.height = chk(instance.data, "height", "24em")
          this.alt_text = chk(instance.data,"alt_text", "")
        }
        cp(instance, this)
    }
    edit ( {el, set, util, get, query,  }){
        return el('serverside',{ },
            el('inspector',{},
                el('duplex',{
                    onChange(e){
                        if ( ! e.detail ) return; 
                        
                        var height =  e.detail.value
                        set({ height  })
                        var elh = query(".post-feature-image");
                        if ( elh ) {
                            elh.style.height = height
                        }
                    }
                }, get('height')),
                /*el('row',{ label: 'Alternate text'},
                    el('string',{
                        value : get('alt_text'),
                        onChange(e){
                            set('alt_text',e.target.value)
                        }
                    })
                )*/
            )
        ); 
    }

    async render (core, { esc,classes,is_preview, iattrs, id }){
        var img= `<b>{</b>Post Feature Image<b>}</b>`; 
        var preview="";

        var def_feature_image = await core.get_option({ name : 'default_feature_image', flat : true });
        var standing_default = `http://placehold.co/600x400.png`
        
        var h = esc ( this.height)
        if ( ! is_preview){
            var img_url = 'https://loremflickr.com/640/360'
            
            img_url = this.image || def_feature_image || standing_default
            
            img = `<img src="${img_url}" style="width:100%" class="rounded">`
            h= ""
        } else {
            //when no image, create default colored background
            h ="height: 160px; background-color: #6588ed4a;" 
            preview =`background-repeat:no-repeat; ` + 
                    `background-position: 50% 50%;` +
                    `background-size:cover; ` + 
                    `background-image: url(${standing_default});`
        }
        var html = `<div ${id()}  ${iattrs()}  ` + 
        `${classes("post-feature-image overflow-hidden") } style="${h} ${preview}">${img} </div>`

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