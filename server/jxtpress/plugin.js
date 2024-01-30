import core from "./core"
import { createRequire } from 'module'
import crypto from 'crypto'
import db from "./db";


class Plugin{
    action_hooks = [];
    filter_hooks = [];  

    /**
     * Contains descriptive meta data about registered plugins
     */
    plugins = []; 
 

    past_cache_get_plugins  = null;
    cache_get_pluings       = null; 
    /**
     * Get descriptive meta data about all plugins
     * @returns {Array}
     */
    async get_plugins(){
        if ( !this.plugins) return [];
        var ids = [];
 

        //Collect all the id names
        this.plugins.forEach(it => ids.push(it.id));
        if(ids.length ==0){   return [] }
         

        
        //Caching 
        var obj = this; 
        var use_cache   = core.use_cache({ elapse: 2, obj , key_time : 'past_cache_get_plugins'});

        if (!use_cache ){  
            //Get all the plugins that are in the Database
            var sql = `SELECT id, status FROM ${db.name}.posts WHERE ${db.is('id',ids)}`;
            var ret = await db.query(sql, { run_filter: false });
            var record, p ;  
            //Loop the records, and for each, update the "plugins" status with what DB says
            for (var i=0; i < ret.length; i++){
                record = ret[i]; 
                for (var j=0; j < this.plugins.length; j++){
                    p = this.plugins[j];
                    if ( record.id == p.id ){
                        p.status =record.status;
                    }
                }
            }
        }
        return this.plugins
    }

    /**
     * {DocString Invoked upon server startup.  Plugins supports import of individual files JS files located within
     * "site-plugins" folder.  Each JS files must export functions using "module.exports" 
     *  and export, at minimum, "register".
     *  
     *   
     * }
     * 
     * @param {Object} options 
     */
    async init(options){
        this.past_cache_get_plugins=null;
        core._clean()
        // {step Reset all actions & filters }
        this.action_hooks = [];
        this.filter_hooks = [];  
        this.plugins = []
        
        let server_root = core.get_server_root()
        var files = await core.get_dir_files("site-plugins");
 
        if (!Array.isArray(files)) return ;
        
        // {step get access to require object so be can unset previously loaded modules}
        //require.cache= { path: {id, path, exports, filename, loaded, children}}
        const require = createRequire(import.meta.url)
       
        // {step loop each plugin file and check for js files}
        for(var i=0; i < files.length; i++){ 
            // <FIRST!!> Unset and re-import the JS files 
            delete require.cache[files[i].path ] 

            // Then skip anything
            if ( files[i].is_directory) continue;
            if ( files[i].ext != "js") continue;
             
            var imported = await import(`${files[i].path}?update=${Date.now()}` );

            // {step each register pluin actions}
            if ( imported ){
                if (! imported.default){
                    core.log(`Imported ${files[i].path} but no default key`);
                    continue; 
                }
                if ( imported.default && typeof imported.default.register =='function'){
                    
                    try{  
                        //plugin id 
                        var p = { 
                            name: files[i].name,
                            title: imported.default.title || files[i].name ,
                            description: imported.default.description,
                            author :  imported.default.author,
                            url :  files[i].path.substring(core.env.cwd.length)  ,
                            status : imported.default.status || "active", 
                            type : "plugin", 
                            value : files[i].inode, exports : null
                        };
                        //Find db record of this plugin
                        var sql = `SELECT id FROM ${db.name}.posts WHERE url LIKE ${db.esc(p.url)} AND type LIKE "plugin"`
                        var ret = await db.query(sql)
                         
                        if ( ret.length ==0){//if no record, create it once
                            await db.update('posts', p);; 
                        }else { 
                            //if record, set the plugin id and update title, description, name
                            p.id = ret[0].id;   
                            await db.update('posts', { id : p.id, name : p.name, title:p.title, description: p.description})
                        }
                        p.exports = imported.default //point to the code the plugin file exported
                        this.plugins.push(p)

                        core.__is_ready = true;
                        await p.exports.register(core,{this_plugin: p, plugin : p  }); 
                    }catch(e){
                        core.error("register.error", e);
                    }
                }
            }
        } 

        this.run_action("reload_plugins", "All plugin scripts have been reloaded.  This typically runs upon server startup and upon manual trigger upon script changes.");

        core.log ("Starting Plugin Engine")
    }
    /**
     * Register an action Hook Object
     * @param {String} action_name Hook to execute on
     * @param {Function} fn Executable JS function that accepts "core"
     * @param {Number} priority Execution order lower numbers are ran first
     * @returns {Number} ID of the action being added
     */
    add_action(action_name, fn=null, priority=10){
        if ( ! fn ) return;  
        let d = { name: action_name, fn, priority,  type: "action" };
        this._after_add(d);
        this.action_hooks.push(d); 
        return d.id; 
    }
    /**
     * Update the status of Post.type=plugin such that each named plugin id or array of ids has status
     * set to export_name
     * @param {Number} plugin_id Id number for the plugin
     * @param {String} export_name Same as status: One of install, active, uninstall, or inactive
     */
    async update_plugin_status(plugin_id, export_name){
        if ( ! plugin_id) return false; 
        if ( !export_name) return false; 
        var plugin = this.plugins.find ( it =>{  
             return it.id == plugin_id
        })
        
        if ( !plugin ) return false; 

        var fn = plugin.exports ? plugin.exports [export_name] : null;  
        if ( typeof fn != 'function') return false; 

        await db.query(`UPDATE ${db.name}.posts SET status=${db.esc(export_name)} WHERE ${db.is('id',plugin_id)}`)
        await fn()
    }
    /**
     * Register a filter Hook Object
     * @param {String} action_name Hook to execute on
     * @param {Function} fn Executable JS function that accepts "data" and "core"
     * @param {Number} priority Execution order lower numbers are ran first
     * @returns {Number} ID of the action being added
     */
    add_filter(filter_name, fn=null, priority=10){
        if ( ! fn ) return; 
        let d = { name: filter_name, fn, priority,  type: "filter" };
        this._after_add(d);
        this.filter_hooks.push(d); 
        return d.id; 
    }
    /**
     * Unifies registered plugin Hook Object.  Associates action or filter with the id of most recently registered plugin and 
     * @param {Object} item Registered plugin Hook Object  {name,fn,priority, type:filter/action,plugin_id, }
     */
    _after_add(item){ 
        if ( ! item ) return; 
        let id = crypto.randomUUID();
        var latest_plugin = this.plugins[this.plugins.length-1];
        if (latest_plugin){
            item.plugin_id = latest_plugin.id;  

            if ( item.name && item.name.startsWith("export:") ) {
                var plugin_name_only =  latest_plugin.name.substring(0,latest_plugin.name.indexOf('.'))
                item.name = plugin_name_only + "." +item.name.substring(7) 
            }
        } 
        item.id = id; 
    }


    async run_action (name,data=null, options ){
        if ( data )data = JSON.parse(JSON.stringify(data));
        return this._run(name, data, { type : "action", ... options} )
    }
    async run_filter (name, data, options){  
        return await this._run(name, data, { type : "filter", ... options} )
    }
    //NOTE:  never make a DB query within run!
    async _run(command, data, options  ){
        let hook_list = options.type =='action' ? 
                    this.action_hooks :this.filter_hooks;
 
        // {step Filter hooks that match command and then sort each priority low to high}
        var hooks = hook_list.filter(it => {
            return it.name == command
        }).sort((a,b)=>{ 
            return a.priority - b.priority
        })
        
        var cur_plugins = await this.get_plugins()// 
        let is_active = (plugin_id)=>{ 
            if ( ! plugin_id ) return false; 
            var it = cur_plugins.find( it => it.id == plugin_id);
            return it.status == 'active';
        }
         
        // {step Loop each hook and run the executable function}
        var hook;
        var ret = data, temp;
        for(var i=0; i < hooks.length; i++){ 
            hook = hooks[i]; 
            
            if ( typeof hook.fn != 'function') continue; //skip non-executable methods
            if ( ! is_active(hook.plugin_id)) { 
                console.log (hook,"is inactive")
                continue; //skip inactive plugins
            }
 
            // {step each for actions do async for filter do sync execution}
            if ( options.type =='action' ){
                try { 
                    hook.fn(core, data ); //no waiting
                }catch(e){
                    core.error("action error", e,hook.plugin_id)
                }
            }else {
                
                try{  
                    console.log ("about to run it ", hook, hook.fn )
                    temp = await hook.fn(core, ret);
                    if ( temp !== undefined){ //check if something was actually returned
                        ret = temp; //update ret to be the value of temp
                    }
                }catch(e){
                    core.error("filter error ",e,hook.plugin_id )
                }
            }
        }
        // {step Actions do not return anything but filters return a value }
        if ( options.type =='action' ){ 
            return; 
        }else {
            return ret; 
        }
    }
    /**
     * Given a path (relative to server root), return the source code for the Plugin
     * @param {Object} options { path : relative path to Root Server ie "/site-plugins/sample.js" }
     */
    async get_source(options){
        if ( ! options ) return null; 
        if ( ! options.path ) return null; 
        var server_path = core.get_server_root();
        var full_path = server_path + options.path.replace(/\.\./gm, "") ;
        
        /* dev,mode,nlink,uid,gid,rdev,blksize,no,size,blocks,atimeMs,mtimeMs,ctimeMs,birthtimeMs*/
        var stat = await core.get_file_stat(full_path)
        if ( stat.errno)     throw new Error(full_path + " does not exist")
        
        var out =   await core.get_file_content(full_path) 
        
        return out 
    }
    async set_source ( options ) {
        if ( ! options ) return null; 
        if ( ! options.path ) return null; 
        if ( options.value == undefined) return null;


        var server_path = core.get_server_root();
        var full_path = server_path + options.path.replace(/\.\./gm, "") ;

        return await core.set_file_content(full_path, options.value )
    }
    /**
     * Given a path to a plugin file, delete said plugin from server
     * @param {Object} options {path }
     */
    async remove_plugin(options){
        if ( ! options ) return null; 
        if ( ! options.path ) return null; 


        var server_path = core.get_server_root();
        var full_path = server_path + options.path.replace(/\.\./gm, "") ;
        return await core.remove_file( full_path )
    }
    /**
     * Create blank plugin from template
     * @returns {String} String blank template of a plugin
     */
    async get_new_content(){
        return `
// const TestBlock = require("./some-folder-in-site-plugins/filename-to-import");
module.exports = {
    title       : 'Name your plugin',
    description : 'Describe your plugin',
        
    /* this_plugin: name, title, description, author, url, status, type,  value */
    register: (core, { this_plugin } )=>{
        /*core.register_menu_link({
            name : "posts",title :"Posts", url : "/user/posts",  role :"admin", priority:5, 
        })*/
                
        core.plugin.add_action("startup",(core)=>{
                 
        })
        core.plugin.add_filter("filter_auth_token_name",(core, data )=>{ 
            return "fimple"
        }) 
        
        core.plugin.add_filter("get:/endpoints/sample/test",(core, data )=>{
                console.log ("You called the Fnnn endpoint ", data )
                return [ 1, 7.5, 12]
        })
        core.plugin.add_filter("export:dostuff", (core,data)=>{
                console.log ("You invoked exported plugin function do stuff")
                return [
                    { title :"Good XFiles", value :"okay", description:"Whatever"}
                ]
        })
        core.plugin.add_filter("export:xxx", (core,data)=>{ 
                return [
                    75,18,102
                ]
        })
        core.plugin.add_action('cron_q1min', ( core, data )=>{     
            console.log ("   -   Running sample.plugin chron job ");
        })
            
    },
    install :(core)=>{
        console.log ("simple:plugin installed")
    },
    inactive :(core)=>{
        console.log ("simple:plugin inactived")
    },
    active :(core)=>{
        console.log ("simple:plugin actived")
    },
    uninstall :(core)=>{
        console.log ("simple:plugin uninstalled")
    }
}
`
    }
}

let plugin = new Plugin()
 
export default plugin 