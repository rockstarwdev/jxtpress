export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          this.template = chk(instance.data, "template", "user date") 
          this.date_format = chk(instance.data, "date_format", 1)
          this.time_format = chk(instance.data, "time_format", 1)
        }
        
        cp(instance, this)
    }
    get_date_formats (){
        return [
            { title : "Friday, June 99, 9999", value : 1},
            { title : "June 99, 9999", value : 2},
            { title : "Jun 99, 9999", value : 3},
            { title : "9/9/9999", value : 4},
        ]
    }
    get_time_format(){
        return [
            { title : "hh:mm PM", value : 1 },
            { title : "h:mm PM", value : 2 },
            { title : "HH:MM ", value : 3 },
            { title : "H:MM ", value : 4 },
        ]
    }
    edit ({ el , get, set, query } ){     
        return el('serverside',{ 
                attrs: { id : get('element_id')},
            },
            el('inspector',{},
                el('label',{},'Template'),
                el('string',{ 
                    value : get('template'), placeholder : "Use 'user','date', and or 'time' as terms",
                    onChange(e){
                        set({template : e.target.value })
                    }
                }), 
                el('row',{ label : 'Date Format',  },
                    el('dropdown', {
                        value : get('date_format'),
                        values : this.get_date_formats(),
                        onChange(e){
                            set({date_format:e.detail.value })
                        }
                    })
                ),
                el('row',{ label : 'Time Format',  },
                    el('dropdown', {
                        value : get('time_format'),
                        values : this.get_time_format(),
                        onChange(e){
                            set({time_format:e.detail.value })
                        }
                    })
                ),
            )
        );  
    }

    /**
     * 
     * @param {*} core 
     * @param {*} blk_options { 
     *  block_id, block_type :String, 
     *  css : Function, esc :Function, classes : Function, id : Function, attr : Function, style : Function, iattrs : Function,
     *  props : Object nullable, inner_html : HTML of this blocks children, inner_arr : empty array,
     *  req : HTTP Request, param : Object - HTTP Request,query : Object - HTTP Request , 
     *  headers : HTTP Request, cookies : Object, now : Object,
     *  of_layout: Boolean - block render function is called from layout post context,
     *  user_id_admin : Boolean, user_id : Number,
     *  consumable_child_data : Object,
     *  post: Object -the post being requested to render,  }
     * @returns 
     */
    async render (core, blk_options ){
        let { esc , is_preview, iattrs, id , classes , is_404, post_type  } = blk_options
        
         if ( is_404 )  return  { html : `<!-- ${post_type} : no render 404 -->`}
         
         console.log ("PostAttr.render is_404=",is_404)

        var name = `<span class="username"><b>${this.created_by_title || this.created_by_name || "Username"}</b></span>`

        var date = ``;
        var time = ``
        if ( is_preview ) {
            this.published = new Date()
        }
        
        var lz = (v) =>{
            return v < 10 ? '0'+v : v 
        }
        var d = core.to_user_time({date :  new Date( this.published ) });

        var str_date = {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
        }
        if ( this.date_format == 2) {
            str_date = {  year: "numeric", month: "long", day: "numeric"  }
        }else  if ( this.date_format == 3 ){
            str_date = {  year: "numeric", month: "short", day: "numeric"  }
        } else if ( this.date_format == 4 ){
            str_date = {  year: "numeric", month: "numeric", day: "numeric"  }
        } 
        date = "<span class='post-date'>" + d.toLocaleDateString("en-US", str_date) + "</span>"

        
        var zH =  d.getHours()
        var zM =  d.getMinutes()
        var zTimeDay = '';

        zTimeDay = d.getHours() > 12 ? 'PM' : 'AM'
        var str_time =  `${lz(zH)}:${lz(zM)} ${zTimeDay }`
        if ( this.time_format == 2){
            str_time = `${zH}:${lz(zM)} ${zTimeDay}`
        } else if ( this.time_format == 3 ){
            str_time = `${lz(zH)}:${ lz(zM) }`
        }else if ( this.time_format == 4 ){
            str_time = `${zH}:${ lz(zM) }`
        }

        time = '<span class="post-time">'+ str_time + '</span>'



        var expr = this.template || "user date time";
        expr = expr.replace(/user/gi, name).replace(/date/gi,date).replace(/time/gi,time);

        if ( is_preview ){
            return {html : `<div> <div><b>{</b> Post Attribute <b>}</b></div>${expr} <div class="mb-2></div> </div>` }
        }else {
            
            return {
                html :`<div ${id()} c${classes("PostAttr mb-4 mt-1") } ${iattrs()} >${expr}</div>`
            } 
        }
 
    }
    style({}){
        return `

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