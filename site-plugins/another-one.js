
// const TestBlock = require("./some-folder-in-site-plugins/filename-to-import");
module.exports = {
    title       : 'What@@@X',
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
