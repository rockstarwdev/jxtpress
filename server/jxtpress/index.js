 
import  create_tables               from '~/server/jxtpress/init_util/create_tables' 
 import create_post_types           from './init_util/create_post_types';
import create_menu_links            from './init_util/create_menu_links'
import create_options       from './init_util/create_options'
import create_native_blocks         from './init_util/create_native_blocks'
import create_initial_capabilities  from './init_util/create_initial_capabilities';
import create_cron_jobs             from './init_util/create_cron_jobs';

import core         from "./core"
import db           from "./db"
import plugin       from "./plugin"
import groups       from './groups';
import pages        from './pages';
import users        from './users';
import email        from './email'
import ecommerce    from './ecommerce';
import likes        from './likes';
import comments     from './comments'

/**
 * { DocString 
 *  
 * } 
 */
export default async (nuxtApp) => {
    //Initialize pointers to key modules
    core.plugin     = plugin;
    core.db         = db;
    core.groups     = groups 
    core.pages      = pages
    core.users      = users
    core.email      = email 
    core.ecommerce  = ecommerce
    core.likes      = likes
    core.comments   = comments


    core.log (`Starting ${core.project} ${core.version}`)
    // {step Create clean version of environment variables }
    let jxt_env = { cwd : process.env.INIT_CWD }
    core.log("Importing Env Flags")
    var final_key_name = "", is_app 
    for( var key of Object.keys(process.env) ) {
        is_app = key.toLowerCase().startsWith("app_")
        if ( key.toLowerCase().startsWith("jxt_") || is_app  ) {
            final_key_name = key.substring(4)
            if ( is_app ) final_key_name = "APP_" + final_key_name
            jxt_env[ final_key_name ] = process.env[key] 
        }
    } 
    
    // {step Connect environment variable to core }
    core.env = jxt_env

    // {step Create Menu Links }
    create_post_types(core)

    // {step Create Menu Links}
    create_menu_links(core);
    core.log ("CWD: ", core.get_server_root() )


    // {step connect to database}
    try{  
        db.connect({ host : jxt_env.DB_HOST, user: jxt_env.DB_USER, 
        password: jxt_env.DB_PASSWORD, db_name:jxt_env.DB_NAME});
    }catch(e){
        core.error(e) 
    }


    // {step Make sure the database is created.  Then use sample query to validate is table are also valid.  On error set internal error flags}
    // {fieldCount: affectedRows:1, insertId:0, info,serverStatus,warningStatus}
    await db.query(`CREATE DATABASE IF NOT EXISTS ${db.name};`); 
    await create_tables(db, core )
    await create_options (db, core );
    await create_native_blocks(db, core )
    await create_initial_capabilities(db, core)

    //create server root directory
    await core.create_directory(core.get_server_root() + "/site-plugins")
    // {step Start plugins}
    await plugin.init({ })


    create_cron_jobs( db, core )
 
    //Must be the last thing to run otherwiseh core._is_ready will fail
    plugin.run_action("startup", "Invoked immediately upon server starting up.");

};
