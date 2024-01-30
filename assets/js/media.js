import el2 from "./el2"
 
import util from "./util";


let el = (... args )=>{
    var out = el2(... args );
    if ( out ){
        out.removeAttribute("fn")
        out.querySelectorAll("[fn]").forEach(node =>{
            node.removeAttribute("fn")
        })
    } 
    return out 
}

export default class Media {
    root = null //Root element
    l_pane = null;
    r_pane = null;
    nav_folder_bar = null;//Will sit within r content pane
    logo_holder =null
    properties_pane = null; 
 
    files = null; 
    selected = [];  //Array of all files that are selected
    current_directory = null; 
    parent_directory = null; 

    constructor(){
        var MH                  = '500px'
         
        this.nav_folder_bar     = el('div',{classes: ['p-1','folder-bar', 'h-10', 'flex' , 'gap-3']})
        this.folder_contents    = el('div', {classes:['p-1','folder-contents', 'flex', 'flex-wrap', 'gap-2', 'items-start'], style:{maxHeight: "480px", overflow:"auto"}})

        var self                = this; 
        this.logo_holder = el('div',{classes:["mb-4", "flex",'justify-between', 'items-center']},
            [
                el('h2',{innerText:"Media", classes:["p-3"]}),
                el('button',{ classes: ['button', 'primary','flat','px-4', 'items-center'],
                    innerHTML:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>`,
                    onClick : ()=>{
                        var el_file     = document.createElement("input");
                        var name        = "jxt_file"
                        el_file.type    = 'file' ; el_file.name = name; el_file.id=name 

                        let on_files_selected = ()=>{
                            if ( el_file.files.length == 0 ) return ; 
                            var form = new FormData()
                            var field_name = el_file.getAttribute('name') || "jxt_file"
                            var file_obj = null;
                            for(var i=0; i < el_file.files.length; i++){
                              file_obj = el_file.files[i] // {lastModified:Timestamp, lastModifiedDate, name, size, type:"image/pnng"}
                              form.append(field_name, file_obj, file_obj.name);
                            }
                            form.append("folder", self.current_directory)

                            let remove_field = ()=>{
                                el_file.remove();

                            }
                            useRequest( {url: "/api/posts/uploads", method:"post", body: form}).then(e=>{
                              console.log(e);
                              remove_field()
                              setTimeout(()=>{
                                self.fetch_folder(self.current_directory,self.parent_directory)
                              }, 50)
                              
                            }).catch((err)=>{
                              console.error(err)
                              remove_field()
                            })
                        }
                        el_file.addEventListener('click',(e)=>e.stopPropagation())
                        el_file.addEventListener('change', on_files_selected)
                        document.body.appendChild(el_file)
                        setTimeout(()=>{
                            el_file.click()
                        },100)
                    }
                })
            ]
        )
        this.properties_pane = el('div',{classes: ['properties']})
        
        this.l_pane = el('aside',{classes: ['shortcuts', 'w-1/3', 'p-2'], style:{ maxHeight:MH, maxWidth: '240px',     borderRight: "1px solid var(--gray-200)"}}, [ this.logo_holder, this.properties_pane ])
        this.r_pane = el('main',{classes: ['pl-2', 'w-2/3', 'flex','flex-col', 'flex-1'], style:{ maxHeight:MH}}, [this.nav_folder_bar, this.folder_contents])

        this.root = el('article',{classes: ['JxtMediaRoot', 'flex', 'gap-2', 'flex-1'], style:{minHeight:'320px', minWidth: '420px', overflow: 'auto'}}, [this.l_pane, this.r_pane] )
    } 
    /**
     * 
     * @param {String} folder_url Initial folder to view
     * @param {String} parent_folder_url nullable parent folder that was previously clicked/viewed
     * @returns 
     */
    async fetch_folder(folder_url, parent_folder_url=null){
        if ( ! folder_url ) return; 
        this.current_directory = folder_url;
        this.parent_directory = parent_folder_url;
        folder_url = folder_url.trim()
        var ret = await useRequest({ url: `/api/posts/uploads?folder=${folder_url}` })
        this.files = ret.d
        var f=null; //{ id , is_directory, status, title, url } 
        var self = this; 
        this.folder_contents.innerHTML = '';


        this.nav_folder_bar.innerHTML = '';
        var re_integrated_url=""
        var folder_parts = folder_url.split("/")
        if ( folder_url == "/") folder_parts.splice(1,1);
        
        folder_parts.forEach(folder =>{ 
            var folder_title = folder == "" ? "/" : folder;
            re_integrated_url += folder_title == "/" ? folder_title : ( re_integrated_url.endsWith("/") ? folder_title: "/"+folder_title);
            var bt = el('button',{ classes:['button','ripple','is-dark', 'bg-gray-100','hover:bg-primary-300','p-2'], value: re_integrated_url,
                            onClick : (e)=>{
                                self.fetch_folder(e.target.getAttribute('value'))
                            },
                            innerText:folder_title})
            this.nav_folder_bar.appendChild( bt )
        })

        // when the file is clicked on fetch a directory (if file was directory) else open up the file editor
        let on_click_file =(e)=>{
            var target = e.currentTarget;
            var index = target.getAttribute('index');
            var f = self.files[index];
            if (!f) return; 
            if ( f.is_directory ) {
                self.fetch_folder(f.url, !f.is_parent ? folder_url : null );
            }else {
                let el_name = el('string',{classes:['row'], value: f.title , label: "Media Name"}, )
                let el_desc = el('text',{classes:['row'], value: f.description , label: "Description", style:{minHeight: '150px'}},)
                let el_cancel = el('button', { type : 'button', 
                    onClick:(e)=>{
                        e.stopPropagation();
                        e.preventDefault()
                        self.properties_pane.innerHTML =''
                    },
                    classes:['button','flat','red', 'ripple','is-dark'],innerText : "Close"})
                let el_delete = el('button',{innerText: 'delete',classes:['button','flat','red'],
                    onClick:async (e)=>{
                        let remove_classes =()=>{
                            el_delete.classList.remove('bg-red-500','confirm', 'color-gray-900')
                            el_delete.style.color=''
                        }
                        if (! el_delete.classList.contains('confirm')){
                            el_delete.classList.add('bg-red-500','confirm','color-gray-900')
                            el_delete.style.color='#000000'
                            util.click_outside(el_delete,()=>{
                                remove_classes()
                            })
                        }else {
                            try{

                                //Actually do deletion
                                await useRequest({url: '/api/posts', method: 'delete', body : { id : f.id}})
                                self.properties_pane.innerHTML =''
                            }catch(e){
                                console.error(e)
                            }
                            self.fetch_folder(folder_url, parent_folder_url)
                            remove_classes()
                        }
                    }
                })

                let el_save = el('button', { type : 'button', 
                    onClick : async ( e ) =>{
                        var title = el_name.querySelector("input").value;
                        var description = el_desc.querySelector("textarea").value; 
                        var new_f = { title, id: f.id , description }
                        await useRequest( {url: "/api/posts", method: "post", body: new_f})
                        f.description = description
                        
                        self.fetch_folder(folder_url, parent_folder_url)
                    },
                    classes:['button','flat','green', 'ripple','is-dark'],innerText : "Save"})
                this.properties_pane.innerHTML =''
                this.properties_pane.appendChild(
                    
                    el('div',{},[
                        el('h2', {innerText : "Properties", classes : ['mb-4', "text-md"]}),
                        el_name, el_desc,
                        el('div',{classes:['color-gray-400',"px-3", "mb-2"],innerHTML : f.url}),
                         
                        el('div',{classes:['flex','gap-2']}, [el_delete,  el_cancel , el_save])
                    ])
                )
            } 
        }
        let on_click_select = (e)=>{
            e.stopPropagation();
            var chkbox = e.target; 
            var target = e.currentTarget.closest('.file');
            if ( ! target) return;
            var index = target.getAttribute('index');
            var f = self.files[index];
            if (!f) return; 
            if ( !f.is_directory ) {
                var found_idex=-1;
                var found = self.selected.find( (it,i) => {
                    var ret= it.id == f.id 
                    if (ret) found_idex = i
                    return ret
                });
 
                if ( chkbox.checked){//we show make sure it is in selected list
                    if ( !found) self.selected.push( f );//only add if not already
                } else {
                    //we should remove it from selected list
                    if ( found ) self.selected.splice(found_idex,1);
                } 
            } 
        }
        
        var images = ['png','jpeg','jpg','gif','webp', 'ico'];
        
        if ( parent_folder_url ){ 
            this.files.splice(0,0, {
                id : null, title : "...", is_directory : true, url : parent_folder_url, is_parent : true 
            })
        }
        
        for ( var i=0; i < this.files.length; i++){
            f = this.files[i];
            var img = null;  
            if ( f.url  ){
                var url = f.url.toLowerCase();
                var is_one_of =false; 
                for ( var j=0; j < images.length; j++){
                    if ( url.endsWith(images[j])){
                        is_one_of = true; 
                        break;
                    }
                }
                if(is_one_of) img = el('img', { classes:['w-full','h-full'],attrs:{src : f.url },})
            }
            if ( f.is_directory){
                var svg = document.createElement('div');
                svg.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="block w-14 h-14 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>`
                img = svg.children[0];
                
            }
            var subtitle = f.title;
            var maxlen = 15;
            if ( subtitle.length > maxlen){
                subtitle = subtitle.substring(0,maxlen)
            }
            if ( img == null)img = undefined
            var gfx = el('div', {classes: ['Icon']}, img )
            var f_in_selected = self.selected.find(it => it.id == f.id || it.url == f.url) 
            var f_is_selected = f_in_selected ? true : false;
            if ( ! f.is_directory && f_is_selected){ 
                console.log ("\tFile", f.id , f.url, f_in_selected, f_is_selected)
            }
            if ( f_in_selected ){
                for(var k of Object.keys(f) ){
                    f_in_selected[k] = f[k]
                } 
            }

            var chkbox = (!f.is_directory) ? el('input',{
                    type:'checkbox',classes:['absolute'],style:{top:'10px',right: '10px'},
                    attrs: {type: 'checkbox'},
                    onClick :  on_click_select, value : f_is_selected
                }) : null 
                
            if ( chkbox )  { 
                chkbox = chkbox.querySelector("input");
                chkbox.classList.remove("w-full")
            }
            f.el = el('div',{ classes:['file','relative'],
                    attrs: { index :  i, url : f.url  }, 
                    onClick : on_click_file
            }, gfx,  
                el('div',{classes:['title', f.is_directory ? 'font-semibold':''], 
                innerText : subtitle,  attrs: { "data-title": "Id " + f.id }}),

                chkbox
            );

            this.folder_contents.appendChild( f.el ) 
        }
        
        return this.files; 
    }
    async open( options) {
        if ( ! options) return null; 
        options.folder = options.folder 
        
        if ( ! options.folder ) {
            var default_folder = "/"
            var res = await useRequest({ url : "/api/users/current" });
            if ( res && res.d ) {
                default_folder = `/uploads/${res.d.name}`
            }

            options.folder = default_folder
        }


        var self = this; 
        var pre_selected_files = options.files|| options.selected ;
        
        if ( !Array.isArray(pre_selected_files))pre_selected_files = [pre_selected_files]
 
        if (pre_selected_files){
            var is_num , val , selected_it = null; 
            for(var i=0; i < pre_selected_files.length; i++){
                val = pre_selected_files[i];
                if (val == null) continue; 
                console.log ("Loop Check selection", val)
                is_num = !isNaN(val)
                
                if ( is_num && val != null){ 
                    selected_it = { id : Number.parseFloat(val)}
                }else {
                    if ( typeof val =='object' && val.id)  selected_it = val
                    else if ( typeof val == 'string'){
                        var index = val.lastIndexOf("id=");
                        if ( index !=-1){
                            var val = Number.parseFloat ( val.substring(index+3) ) 
                            selected_it = { id : val }
                        }
                    }
                }
                if ( selected_it && selected_it.url) selected_it.url = selected_it.url.replaceAll("//",'/')  
                if ( selected_it == null)continue; 
                this.selected.push( selected_it )
            }
        }
        
        options.get_data = ()=>{
            return self.selected.map(it=> { 
                if ( ! it ) return null; 
                var out = { 
                    id : it.id, created_by : it.created_by||null, group_id : it.group_id, title : it.title, 
                    url : it.url ? it.url + '?id='+it.id : it.url, type: it.type 
                }

                return out 
            }) ;
        }
        this.fetch_folder(  options.folder ) 
        return this.root 
    }
}