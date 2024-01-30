export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
            this.image_sizes      = chk (instance.data, "image_sizes", 100 ) 
            this.min_size         = chk ( instance.data, "min_size", '120px')
            this.is_grid          = chk ( instance.data, "is_grid", false )
            //todo is_grid means creating a display of images such that each is clickable 
        }
        
        cp(instance, this)
    } 
    get_image_sizes(){
        return [
            { title : "100%", value:100},
            { title : "75%", value:75},
            { title : "50%", value:50},
            { title : "25%", value:25},
        ]
    }
    edit ({ el , get, set, query } ){     
        return el('serverside',{ 
                attrs: { id : get('element_id')},
            },
            el('inspector',{},
                 el('row',{
                    label : "Default Image Sizing",
                 },
                    el('dropdown', { value : get('image_sizes'), values : this.get_image_sizes(),
                        onChange ( e ) {
                            set({ image_sizes : e.detail.value })
                        }
                    })
                 ),
                 el('row',{label: "Min. Image Size"},
                    el('duplex', { 
                        value : get('min_size'),
                        onChange(e){
                            set({min_size : e.detail.value })
                        }
                    })
                 ),
                 el('row',{label: "Selectable Grid"},
                    el('checkbox', { 
                        value : get('is_grid'),
                        onChange(e){
                            set({is_grid : e.target.checked })
                        }
                    })
                 )
            )
        );  
    }

    async render (core, { id, classes,iattrs, esc , post_id , is_preview}){ 
        var html = '';
        var images = null;
        var additional_classes = "flex gap-2 flex-wrap"
        if ( is_preview ) {
            images = [ null , null , null ]
        }else {
            images = await core.pages.get_meta({ post_id, name : "images_arritem", flat : true })
            if ( ! images ) images = []
        }
        var item_cls ="m-0 p-0"
        var img = "", item; 
        var fake_colors = ['var(--gray-300)', 'var(--gray-700)','var(--gray-500)', 'gray-900']
        var fake_color_it = 0; 
        var get_fake_color = ()=>{
            var color = fake_colors[fake_color_it ];
            fake_color_it ++;
            if ( fake_color_it > fake_colors.length-1)fake_color_it = 0
            return color 
        }

        if ( !this.is_grid){    // Simply just list the images on the page wrapped in ul
            html += `<ul  ${id()}  ${iattrs()}  ${classes("PostImages " + additional_classes) } t="post-images">`
            
            
            for ( var i=0; i < images.length; i++){
                img = images [i]
                if (is_preview ) {
                    item = `<li class="${item_cls}" ><div class="image-item" style="background-color: ${get_fake_color()}"></div></li>`
                }else {
                    item = `<li class="${item_cls}"><img class="image-item" src="${img}" style="width:${this.image_sizes}%; min-width: ${this.min_size}"></li>`
                }
                html += item; 
            }
            html += `</ul>`
        }else {
            html = ``
            if ( this.is_grid){//begin grid interactive system
                html=`<div ${id()} ${classes("PostImages image-grid flex gap-3") } t="post-images">`
                
                var img_list = `<ul class='image-list list-none flex flex-col gap-2 w-24 overflow-auto' style="max-height: 28em;">`
                var first_img = null ;
                var is_active = false; 
                for ( var i=0; i < images.length; i++){
                    img = images [i]
                    is_active = is_active = i == 0 
                    if (is_preview ) {
                        item = `<li class="${item_cls} " ><div class="image-item" style="background-color: ${get_fake_color()}"></div></li>`
                    }else {
                        item = `<li class="${item_cls} ${is_active ? 'active' : ''}"><img class="image-item" src="${img}" style="width:84px"></li>`
                    }
                    img_list += item; 
                }
                if ( is_preview  ) {
                    first_img = `<div class="image-item" style="background-color: ${get_fake_color()}; min-height: 320px;"></div>`
                }else {
                    first_img = `<img src="${images[0]}" class="w-full">`
                }
                img_list += `</ul>`
                html += ` ${img_list} `+
                        ` <div class="image-view flex-1"> ${first_img } </div>`
                html += `</div><!--end image grid -->`
            }//end grid interactive system
            
        }
        return {
            html  
        }
    }
    style (){
        return ` 
            .block-instance .image-item {
                min-width: 230px;
                min-height: 100px;
                background-color: var(--gray-300);
            }
            .block-instance .image-grid .image-item {
                min-width: 100%;
                min-height: 100px;
                background-color: var(--gray-300);
            }
        `
    }
    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) { 
        return false 
    }
    /**
     * Defines which blocks and be allow to be inserted into the block
     * @param {Object} blk Block Definition
     * @returns {Boolean}
     */
    insertable (blk){ 
        return false 
    }
}