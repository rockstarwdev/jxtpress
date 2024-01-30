export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  )  { 
            this.field_name             = chk (instance.data,'field_name', '') 
            this.field_type             = chk (instance.data,'field_type', '') 
            this.label                  = chk (instance.data,'label', '') 
            this.label_display          = chk (instance.data,'label_display', 'top') 
            this.placeholder            = chk (instance.data,'placeholder', '') 
            this.is_required            = chk (instance.data,'is_required', false) 
            this.autocomplete           = chk (instance.data,'autocomplete', false)
            this.is_disabled            = chk (instance.data,'is_disabled', false) 
            this.tooltip                = chk (instance.data,'tooltip', '') 
            this.row_count              = chk (instance.data,'row_count',4)

            this.value_source           = chk (instance.data,'value_source', '') 
            this.values                 = chk (instance.data,'values', []) 
            this.initial_value          = chk (instance.data,'initial_value', '') 
            this.validation             = chk (instance.data,'validation', '') 
            this.min                    = chk (instance.data,'min',null) 
            this.max                    = chk (instance.data,'max',false)
            this.step                    = chk (instance.data,'step',false)
        }
        cp ( instance,this );
    }

    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query }) {
        var t = this.field_type; 
        var can_have_placeholder = ['number','text','string'].includes(t)
        var lbl_is_internal = ['button'].includes(t)

        var values = this.values || [];
        var has_values = ["dropdown","radio"].includes(t);
        return el ( 'div' , { 
                    classes : [  ] , 
                }, 
                el("serverside",{}),
                el('inspector', {},
                    
                    el("row",{label : "Field Name"}, 
                        el('string',{   
                            value : get('field_name'),  
                            onChange(e){
                                set({field_name : e.target.value })
                            } 
                        })
                    ),
                    el("row",{label : "Field Type"}, 
                        el('dropdown',{   
                            value :get('field_type'), 
                            values : this.get_field_types(),
                            onChange(e){
                                set({field_type : e.detail.value })
                            } 
                        })
                    ),
                    t =='text'? el('row', 
                        {label: "Row Count"},
                        el('number',{
                            value: this.row_count,
                            onChange(e){
                                set({row_count : parseInt (e.target.value) })
                            }
                        })
                    ):null,
                    el("row",{label : "Field Label"}, 
                        el('string',{   
                            value : get('label'),  
                            onChange(e){
                                set({label : e.target.value })
                            } 
                        })
                    ),
                    this.label && !lbl_is_internal ? el("row",{label : "Label Placement"}, 
                        el('dropdown',{   
                            value :get('label_display'), 
                            values : this.get_label_diplay_types(),
                            onChange(e){
                                set({label_display : e.detail.value })
                            } 
                        })
                    ) : null , 
                    can_have_placeholder ? el("row",{label : "Placeholder"}, 
                        el('string',{   
                            value :get('placeholder'),  
                            onChange(e){
                                set({placeholder : e.target.value })
                            } 
                        })
                    ) : null , 
                    el("row",{label : "Tooltip"}, 
                        el('string',{   
                            value : get('tooltip'),  
                            onChange(e){
                                set({tooltip : e.target.value })
                            } 
                        })
                    ),
                    el("flex-row", {},
                        el("checkbox",{
                            classes: ["sm"],label: "Required",
                            value : get('is_required'),
                            onChange(e){
                                set({is_required : e.target.checked })
                            }
                        }),

                        el("checkbox",{
                            classes :["sm"], label: "Autocomplete",
                            value : get('autocomplete'),
                            onChange(e){
                                set({autocomplete : e.target.checked })
                            }
                        }), 
                        el("checkbox",{
                            classes :["sm"], label: "Disable",
                            value : get('is_disabled'),
                            onChange(e){
                                set({is_disabled : e.target.checked })
                            }
                        }), 
                    ),

                    el("row",{label : "Initial Value"}, 
                        el('string',{   
                            value : get('initial_value'),  
                            onChange(e){
                                set({initial_value : e.target.value })
                            } 
                        })
                    ),
                    has_values ? el('div',{} ,
                        el("label",{},"Options List"),
                        el("repeater",{
                            values , 
                            get_new (){
                                return { name : "How 220", value : "watever"}
                            },
                            onChange(e){
                                console.log ("Values changxxxe",  e )
                                //set({ values : e.detail.value })
                            }
                        },
                            //Template for each 
                            el("flex_row", {},
                                el("row",{label : "Name"},  
                                    el('string', { classes:['name'],
                                        value : "{item.name}",
                                        onChange(e){
                                            set_item({ name : e.target.value })
                                        }
                                    })
                                ),
                                el("row",{label : "Value"},  
                                    el('string', {  classes:['value'],
                                        value : "{item.value}",
                                        onChange(e){
                                            set_item({ value : e.target.value })
                                        }
                                    })
                                ),
                            )//End of template for repetition
                        ),//End of repeater 
                    ) :null,
                )
            
        )
    }
    render (core, { id, block_id, classes, s , inner_html, name,attr , is_preview, consumable_child_data, iattrs } ){  
        var T = this.field_type
        var basic_clses = `class="border border-gray-300 focus:border-primary-500 ${T=='text'?'w-full':''}"`
        var fname = this.field_name;
        var fREQ = this.is_required ? "required" : ""
        var fPlc = this.placeholder
        var fTtip = this.tooltip || '';
        var fautoc = this.autocomplete 
        var fdisable= this.is_disabled
        var finit =  null; 
        if ( consumable_child_data ) {
            finit = consumable_child_data[fname] || this.initial_value 
        }else 
            finit = this.initial_value || ''
        var f_attr =
            ` ${attr('name',fname)} `+
            ` ${fREQ} ${attr('placeholder',fPlc)} ` +
            ` ${attr('aria-placeholder',fPlc)} ` +
            ` ${attr('aria-roledescription',T)} ` +
            ` ${fREQ ? attr('aria-required', 'true') : '' } ` +
            ` ${attr('data-title', fTtip )} ${attr('autocomplete',fautoc)}` +
            ` ${fdisable ? "disabled" : ""} `
        
        var ui_label = '';
        var lbl_pcls = ''
        if ( this.label) {
            ui_label = `<label class="field-label" for="${fname}">${this.label}</label>`
            f_attr += ` ${attr('aria-label',this.label)}`
            var loc = this.label_display|| "top"
            if ( loc == 'top'){
                lbl_pcls = `flex flex-col`
            }else if ( loc == 'bottom') {
                lbl_pcls = `flex flex-col-reverse`
            }else if ( loc == 'left'){
                lbl_pcls = `flex flex-row`
            }else if ( loc == 'right'){
                lbl_pcls = `flex flex-row-reverse`
            }else if ( loc == 'none'){
                lbl_pcls = ''
                ui_label = ''
            }
        }

        var is_button = T == 'button' || T == 'submit'
        var ui = '';
        var wrap_cls = `form-field mb-2 p-1 ${lbl_pcls} gap-1 ` + 
                        ` ${is_button ? 'button form-button':''} ` +
                        ` ${is_preview ? 'pointer-events-none': ''}`
        var wrap_attr= `${id()} ${classes(wrap_cls)}  ${attr("field-type",T)} ${attr('field-name',fname)} ${attr('field-id',block_id )} `
        var is_checked =  null;
        if ( T == 'checkbox' || T=='switch'){ 
            is_checked = ! ['',null,'no',0,'0', 'false','null'].includes(finit)
        }
        switch( T ) {
            case 'string':
                ui =`<input ${basic_clses} type="text" ${f_attr} ${attr('value',finit)} >` 
                break; 
            case 'number':
                ui =`<input ${basic_clses} type="number" ${f_attr} ${attr('value',finit)} >` 
                break; 
            case 'button':
            case 'submit':
            case 'submit':
                ui_label = '';
                lbl_pcls = '';
                ui =`<button ${wrap_attr} type="${T}" ${f_attr}>${this.label}</button>` 
                break; 
            case 'text': 
                ui = `<textarea ${basic_clses} rows="${this.row_count}" ${f_attr}>${finit}</textarea>`
                break;
            case 'switch':
                ui = `<label class="switch">\n`+ 
                        `\t\t<input type="checkbox"  ${ is_checked ? 'checked': ''}>\n` +
                        `\t\t<span class="slider round"></span>\n` +
                     `</label>\n`
                break; 
            case 'checkbox':
                ui_label = '';
                lbl_pcls = '';
                ui = `<div class="s-checkbox">`+ 
                    ` <input type="checkbox" ${ is_checked ? 'checked': ''}>` +
                    ` <label class="checkbox" ></label>` +
                    ` <label class="label">${this.label}</label>` +
                    `</div>`;
                break; 
            case 'color':
                ui =`<button value="${finit}" class="color-picker button" type="button" ${f_attr}><span class="color" style="background-color: ${finit}"></span></button>` 
                break; 
            case 'date':
            case 'datetime':
                var is_time = T == 'datetime'
                ui =`<div class="date ${is_time ? 'time': ''}" ${attr('value',finit)}>`+
                        `<div class="selected"> ` + 
                            `<span class="value">${finit}</span>` +
                        `</div>` +
                    `</div>`
                break;
            case 'dropdown':
                var f_initial = ``;
                var f_arr_selected = [];
                if ( finit ){
                    var parts= finit ; 
                    if (typeof parts == 'string') parts = finit.split(/[\s,]/gm);
                    for ( var i=0; i < parts.length ; i++){
                        parts[i] = parts[i].trim();
                        if (!parts[i])continue; 
                        f_arr_selected.push( parts[i] )
                        f_initial += `<span value="${parts[i]}">${parts[i]}</span>`
                    } 
                }
                var options = ``, it_val, it_display
                for( var i=0; Array.isArray(this.values) && i < this.values.length; i++){
                    it_val = this.values[i];
                    it_display = it_val.title || it_val.name || it_val.text
                    options += `<div class="option" ${attr("value", it_val.value )}>${ it_display }</div>`
                }
                var values      = `<div class="values">${options}</div>`
                var selected    =`<div class="selected">${f_initial}</div>`
                ui              =`<div class="select" value='${JSON.stringify(f_arr_selected)}' data-title='${fTtip}'>${selected}${values}</div>`
                break;
            case 'spinner':
                ui = `
                <div class="spinner" ${attr('min', this.min)} ${attr('max',this.max)} ${attr('step',this.step)}  >
                    <input ${attr('value',finit)}  >
                    <div class="controls"> 
                    <button type="button" class="button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg> 
                    </button>
        
                    <button type="button" class="button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    </div>
                </div>
                `
                break; 
            default: 
                ui = `<p>Select Field Type</p>`
                break;
        }
        
        
        var ui_wrap = `
            <div ${wrap_attr}>
                ${ ui_label }
                ${ ui }
            </div>
        `
        //For buttons - DO not do a wrap
        if ( is_button ){
            ui_wrap = `${ui}`
        }
        var html =   ui_wrap
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
    get_field_types(){
        return [
            { title : "String",         value : "string" },
            { title : "Text",           value : "text" },
            { title : "Number",         value : "number" },
            { title : "Button",         value : "button" },
            { title : "Submit",         value : "submit" },
            { title : "Checkbox",       value : "checkbox" },
            { title : "Switch",       value : "switch" },
            { title : "Color",          value : "color" },
            { title : "Date",           value : "date" },
            { title : "Date & Time",    value : "datetime" },
            { title : "Dropdown",       value : "dropdown" },
            { title : "Radio",          value : "radio" },
            { title : "Spinner",          value : "spinner" },
        ]
    }
    get_label_diplay_types(){
        return [
            { title : "None", value : "none" },
            { title : "Top", value : "top" },
            { title : "Bottom", value : "bottom" },
            { title : "Left", value : "left" },
            { title : "Right", value : "right" },
        ]
    }
}