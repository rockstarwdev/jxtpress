export default class  {
 
    constructor(instance, { cp, chk} ){  
        if ( instance  )  { 
            this.language = chk(instance.data,'language', 'javascript')
            this.code= chk (instance.data,'code', '') 
            this.description = chk(instance.data,'description','');
            this.max_height = chk(instance.data,'max_height',"280px")
            this.show_language = chk(instance.data,'show_language',true )
            this.code_label = chk(instance.data,'code_label', "" )
        }
        cp ( instance,this ); 
    }
    assets (  ){
        let callable = function fn (element){
            try {  
                    Prism.highlightAll()  
            }catch(e_prism){
                console.error(e_prism)
                setTimeout(()=> fn(element), 120)
            }
        }
        return [
            { tag: "link", rel:"stylesheet", id :"prismcss",
                href:"https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/themes/prism-tomorrow.min.css" , 
                crossorigin:"anonymous", referrerpolicy:"no-referrer" },
            {
                tag:"script", id : "prismjs",
                src:"https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/prism.min.js",
                crossorigin:"anonymous", referrerpolicy:"no-referrer"
            },
            {
                tag : "callable", fn : fn_jt, fn_str : `(${callable.toString()})()`
            }
        ] 
    }
    /**
     * Provide interface for creating rendered view of the block during edit mode.  
     * @param {Function} el Render function that simplies how we create functions
     * @returns {HTMLElement}
     */
    edit ({  el, set, get, query, util, cls  }) { 
        var code_placeholder = "# here = code"
        return el ( 'div' , { classes : [ ] }, 
               
                el('div',{classes: ["code-wrapper","relative", ... cls()], },
                    !this.show_language ? null : 
                    el('span',{classes:["code-language", "chltlbl" , "absolute" ,"block" ,"top-right" ]},this.language),
                    !this.code_label ? null : 
                    el('span',{classes:["code-label", "chltlbl", "absolute" ,"block" ,"top-left" ]},this.code_label),
                    
                    
                    el('pre',{ style: {maxHeight : get("max_height"), overflow: "auto" }}, el('code',{
                        classes: ['language-'+this.language ]
                    }, this.code || code_placeholder ))
                ),
                el('inspector', {},[
                    el('row',{text: "Language"  },  
                        el('dropdown',{   
                            value :get('language'), classes : ['language',

                            ],
                            values : this.get_languages(),
                            onChange(e){
                                set({language : e.detail.value }) 
                            } 
                        })
                    ),
                    el('div',{classes:['flex','gap-2']},  
                        el('row',{ text: "Max Height"   },  
                            el('duplex',{     
                                value :get('max_height'), 
                                onChange(e){
                                    var max_height = e.detail.value 
                                    var code_wrapper = query(".code-wrapper")
                                    code_wrapper.style.maxHeight=max_height
                                    set({ max_height })
                                } 
                            })
                        ),
                        
                        el('checkbox',{
                                label : "Show Language",
                                value : get("show_language"),
                                onChange(e){
                                    var show_language = e.target.checked 
                                    console.log ("SHow language=", show_language)
                                    set({show_language})
                                    util.trigger('blur',e.target)  
                                }
                        })
                        
                    ),
                    el('row',{label: "Code Label"},  
                        el('string',{   
                            placeholder : "Code Label",  
                            value :get('code_label'), classes : ['code-label'], 
                            onChange(e){
                                set({code_label : e.target.value })
                            } 
                        })
                    ),
                    el('row',{label: "Code"},  
                        el('text',{   
                            placeholder : code_placeholder, 
                            style: {minHeight: '240px'},
                            value :get('code'), classes : ['code'], 
                            onChange(e){
                                set({code : e.target.value })
                            } 
                        })
                    ),
                ]) 
            
        )
    }
    render (core, { id, classes, s , inner_html, iattrs } ){ 
        var tag = "div" ; 
        var language_html = "";
        var label_html = ""
        if (this.show_language){
            language_html=`<span class="code-language chltlbl absolute block top-right">${this.language}</span>`
        }
        if (this.code_label){
            label_html=`<span class="code-label chltlbl absolute block top-left">${this.code_label}</span>`
        }
        var content =`<pre  @attrs style="max-height: ${this.max_height}"><code class="language-${this.language}">${this.code }</code></pre>`
        var html =  `<${tag} ${classes("codehighlighter-block relative")} ${id()}  ${iattrs()}>`+
        `${language_html} ${label_html} ${content}</${tag}>`
        return {
            html 
        }
    }

    get_languages(){ 
        return [
            {title : "arduino, ino",value : "arduino"},
            {title : "armasm, arm",value :"arm"},
            {title : "avrasm",value :"avrasm"},
            {title : "actionscript, as",value :"actionscript"},
            {title : "apache, apacheconf",value :"apache"},
            {title : "applescript, osascript",value :"osascript"},
            {title : "bash, sh, zsh",value :"bash"},
            {title : "basic",value :"basic"},
            {title : "csharp, cs",value :"csharp"},
            {title : "c, h",value :"c"},
            {title : "cmake, cmake.in",value :"cmake"},
            {title : "cobol, standard-cobol",value :"cobol"},
            {title : "clojure, clj",value :"clojure"},
            {title : "curl",value :"curl"},
            {title : "d",value :"d"},
            {title : "dart",value :"dart"},
            {title : "dns, zone, bind",value :"zone"},
            {title : "dos, bat, cmd",value :"dos"},
            {title : "dust, dst",value :"dust"},
            {title : "godot, gdscript",value :"godot"},
            {title : "go, golang",value :"go"},
            {title : "golo, gololang",value :"gololang"},
            {title : "graphql",value :"graphql"},
            {title : "groovy",value :"groovy"},
            {title : "xml, html, xhtml, rss, atom, xjb, xsd, xsl, plist, svg",value :"xml"},
            {title : "haml",value :"haml"},
            {title : "haskell, hs",value :"xxhaskell"},
            {title : "json",value :"json"},
            {title : "java, jsp",value :"xjavax"},
            {title : "javascript, js, jsx",value :"javascript"},
            {title : "lisp",value :"lisp"},
            {title : "lua",value :"lua"},
            {title : "makefile, mk, mak, make",value :"makefile"},
            {title : "matlab",value :"matlab"},
            {title : "nginx, nginxconf",value :"nginx"},
            {title : "perl, pl, pm",value :"perl"},
            {title : "python, py, gyp",value :"py"},
            {title : "rust, rs",value :"rust"},
            {title : "sql",value :"sql"},
            {title : "yml, yaml",value :"yaml"},
            
        ]
    }
    drop ( instance ) {
        return true 
    }
    style(render){
        return ` 


            :not(pre)>code[class*="language-"], pre[class*="language-"] {
                background: #0d0b0b !important;
                border-radius: 3px;
            }
            span.chltlbl  {
                opacity: 1;
                background-color: var(--indigo-500);
                padding: 0.5em 0.75em;
                border-radius: 3px;
                font-size: 0.65em;
                user-select: none;
                color: var(--white);
                font-weight: 900;
                transition: opacity 180ms ease;
                user-select: none;
            }
            div:hover > .chltlbl {
                opacity: 0.45;
                transition: opacity 180ms ease;
            }

            .codehighlighter-block span.chltlbl:hover {
                opacity: 1.0;
            }

            
        `
    }
    script (render){

    }
}