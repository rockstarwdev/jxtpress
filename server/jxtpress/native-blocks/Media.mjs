export default class  {
 
    constructor(instance, { cp, chk} ){ 
        //text , title 
        if ( instance){
            this.flow = chk(instance.data,"flow", "left")
            this.title = chk(instance.data,"title","")
            this.description = chk(instance.data,"description", "")
            this.image = chk(instance.data,"image", [])
            this.svg = chk(instance.data,"svg",null) 
            this.blank_placeholder = chk(instance.data, "blank_placeholder",true) //chk(instance.data,"blank_placeholder", true)//use blank placeholder if no image or svg
            this.url = chk(instance.data, "url","")
        }
        cp(instance,this);
    }
 
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ( {  el , set,    get, query , cls  }) { 
        

        var title_tag = 'h2'

        var img = this.image ; 
        var svg = this.svg 
        
        var img_el = !svg ? (
                            img && img.length > 1 ? el('img', { src : img }) : 
                            el('div',{ classes: ['bg-gray-300','rounded'] , style:{width:'100px',height: '65px'} })
                        ) :
                        el('span',{innerHTML : svg })

        var flow_class = '';
        if ( this.flow =='right') flow_class = 'reverse'
        else if (this.flow=='center')flow_class = 'center'
        else if ( this.flow=='center-image')flow_class = 'center-image'

        return el ( 'div' , { classes : [ "media", "media-block", flow_class , ... cls(),'mb-9' ], style:{margin:0,padding:0} },  
            el('div',{  classes: ['image'] },
               img_el 
            ),
            el('div', { classes: ['content']},
                el('editable', { 
                    style: { borderBottom: '1px dashed var(--gray-300)'},
                    classes : ['title'], tag : title_tag, placeholder: "Title" , 
                    onChange(e){
                    set({title : e.detail.value })
                }}, this.title ),
                el('editable', {
                    style: { borderBottom: '1px dashed var(--gray-300)'},
                    classes : ['description'] , placeholder: "description", onChange(e){
                    set({description: e.detail.value })
                }}, this.description)
            ),
            el('inspector', {},
                el('checkbox',{ classes:['sm'], label : "Use blank placeholder", value : get("blank_placeholder")  , onChange(e){
                    var blank_placeholder = e.target.checked
                    console.log ("blank_placeholder",blank_placeholder)
                    set({blank_placeholder   })
                }}),
                el('div', {},
                    el('label', {}, "Direction"),
                    el('dropdown', {
                        values : this.get_direction_choices(),
                        onChange (e){
                            var mb = query(".media-block");
                            var flow = e.detail.value 
                            if ( mb ) {
                                mb.classList.remove("reverse","center","center-image")
                                if ( flow == 'left') {
                                    
                                }else if (flow=='right') {
                                    mb.classList.add("reverse")
                                }else if (flow =='center'){
                                    mb.classList.add('center')
                                }else if (flow =='center-image'){
                                    mb.classList.add('center-image')
                                }
                            }
                            set({ flow   })
                        }
                    }, this.flow), 
                ),
                el('div', {},
                    el('label', {}, "Image"),
                    el('media', {
                        values : this.get_direction_choices(),
                        onChange (e){
                            console.log ("image change", e.detail )
                            set({ image : e.detail.value[0].url })
                        }
                    }, this.image), 
                ),

                el('div', {},
                    el('label', {}, "SVG Data"),
                    el('textarea', { 
                        value : this.svg, 
                        onChange (e){
                            var svg =  e.target.value
                            var mb = query(".media-block > .image"); 
                            if ( mb ) {
                                mb.innerHTML = svg ; 
                            }
                            set({ svg  })
                        }
                    } ), 
                ),
                el('row',{
                    label : "Link to",
                },
                    el('string', {
                        value : get('url'),
                        placeholder : "URL to navigate to",
                        onChange(e){
                            set({ url : e.target.value })
                        }
                    })
                )
            )
        );
    }
    async render (core,{inner_html, esc, id , classes, iattrs }){ 
        var has_link = this.url != null && this.url.length > 0
        var begin_link = "", end_link = "";
        if ( has_link){
            begin_link = `<a href="${this.url}">`
            end_link = '</a>'
        }
        var image = ``;
        if ( this.svg ) {
            image = this.svg;
        }else {
            
            if ( this.image && this.image.length > 0) {
                 
                image = `<img class="media-image" src="${esc(this.image[0])}">`
            }else {
                
                var def_feature_image = await core.get_option({ name : 'default_feature_image', flat : true });
                var standing_default = `http://placehold.co/600x400.png`
                var src = def_feature_image || standing_default
                
                image = `<img class="media-image" src="${esc( src )}">`
                /*
                if ( this.blank_placeholder) { 
                    image = `<div class='blank-image'></div>`
                }else {
                    image = `<!-- blank-placeholder: false -->`
                }*/
            }
        }


        var flow_class = '';
        if ( this.flow =='right') flow_class = 'reverse'
        else if (this.flow=='center')flow_class = 'center'
        else if ( this.flow=='center-image')flow_class = 'center-image'
        

        var title_div = ``;
        if ( this.title && this.title.length > 0){
            title_div = `<div class="title">${begin_link} ${esc(this.title )} ${end_link}</div>`
        }
        var desc_div = ``
        if ( this.description && this.description.length>0){
            desc_div = `<div class="description">${this.description}</div>`
        }
        var html = 
        `<div ${id()} ${classes('media '+ flow_class)}  ${iattrs()}  >`+ 
            `<div class="image">${begin_link} ${image} ${end_link} </div>` +
            `<div class="content">`+
                `${title_div} ${desc_div}` +
            `</div>`+
        `</div>`

        return { html }
    } 
    drop ( instance ) {
        return false 
    } 
    get_direction_choices(){
        return [
            { title : "Left", value :'left'},
            { title : "Right", value : 'right'},
            { title : "Center", value : 'center'},
            { title : "Center-Image", value : 'center-image'}
        ]
    }
 
}