const TestBlock = require("./sample-folder/TestBlock");

module.exports = {
    title: 'Sample Plugin 1.0',
    description: 'Quick demonstration of how to write a JxtPlugin',

    /* this_plugin: name, title,description,uthor,url,status ,  type,  value */
    register: (core, { this_plugin } )=>{
      /*core.register_menu_link({
            name : "posts",title :"Posts", url : "/user/posts",  role :"admin", priority:5, 
        })*/
        
        core.plugin.add_action("startup",(core)=>{
            console.log("Started my server")
        })
        core.plugin.add_action("reload_plugins", (core)=>{
            console.log ("Plugin.sample.server has START+++++++++++++++");
        }, 10)

        core.plugin.add_action("reload_plugins", (core)=>{
            console.log ("Plugin.sample.server has START-----");
        }, -450)

        core.plugin.add_filter("filter_auth_token_name",(core, data )=>{ 
            return "fimple"
        }) 


        core.register_component(()=>{
            return {
                name : "Dystopia",
                template : `
                    <div>
                        <h1>My Dystopia Compnent {{ 4 * 54 }} 
                    </div>
                `,
                created(){
                    console.log ("Component dytopia hello")
                }
            }
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
        console.log ("Testing Registeration of ", TestBlock)
        //core.register_block(TestBlock, {})
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