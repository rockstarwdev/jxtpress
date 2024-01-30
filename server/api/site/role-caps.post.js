import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Modify a set of capabilities that are assigned to role
 */
export default defineEventHandler( async (event) => {

    
    let user            = event.user;
    if ( user ) {
      //  query.user_id = user.id; 
    }
    if ( ! user )         return await core.res_denied(event,) ;
  
    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_account"})) {
      return await core.res_denied(event,{msg : "Must be admin to access this resource"})
    }
    // { name : role-name, add_caps :Array String cap names,   remove_caps : Array sting cap names }
    const role_config = await readBody(event)  
    if (!role_config ) return await core.res_error(event, { msg : "Role configuration is required"})

    var role_name = role_config.name ;
    if ( ! role_name ) return await core.res_error(event, { msg : "Role name not supplied"});


    var d = await core._get_capabilities();
    return { d : await apply_role_capability ( role_config ) }
  })

  /**
   * Add or remove capabilities to a role
   * @param {Object} role_config  { name : role-name, add_caps :Array String cap names,   remove_caps : Array sting cap names }
   * @returns 
   */
  async function apply_role_capability (role_config){
    if ( ! role_config )    return false ; 
    var role_name           = role_config.title || role_config.name;
    if ( ! role_name)       return false
    if ( ! role_config.remove_caps) role_config.remove_caps = []
    if ( ! role_config.add_caps) role_config.add_caps = []
    role_name               = role_name.toLowerCase()
    var role_id = role_name 
    if ( isNaN(role_id ) ) {
        var ret = await db.query(`SELECT id FROM ${db.name}.roles WHERE ${db.like('title', role_name)}`)
        if ( ret.length == 0 ) return false; 
        role_id = ret[0].id 
    }else {
        role_id = JSON.parse(role_id )
    }

    
    var tb_options = `${db.name}.options`
    var name0 = `rolecapadd_${role_id}%`
    var name1 = `rolecapremove_${role_id}%`

    var sql=`SELECT id, name, value FROM ${tb_options} WHERE \n`+
            `${db.like('name',name0)} OR ${db.like('name',name1)}`;
    var ret = await db.query(sql);



    //Initialize the options
    /** Points to { id, name, value } */
    var opt_rolecapadd = null, opt_rolecapremove = null; 
    for ( var i = 0 ; i < ret.length; i++){
        if (! ret[i].name ) continue ; 
        ret[i].name = ret[i].name.toLowerCase();
        if ( ret[i].name.startsWith("rolecapadd_")) opt_rolecapadd = ret[i];
        if ( ret[i].name.startsWith("rolecapremove_")) opt_rolecapremove = ret[i];
    }
    //check if they do not exist
    if ( ! opt_rolecapadd)      opt_rolecapadd = { name : `rolecapadd_${role_id}_arritem`, value : [] }
    else { 
        if (!opt_rolecapadd.value )opt_rolecapadd.value = [];
        else {
            try {
                opt_rolecapadd.value = JSON.parse(opt_rolecapadd.value );
            }catch(e) { opt_rolecapadd.value = []}
        }
    }
    if ( ! opt_rolecapremove)   opt_rolecapremove = { name : `rolecapremove_${role_id}_arritem`, value : [] }
    else {
        if (!opt_rolecapremove.value )opt_rolecapremove.value = [];
        else {
            try {
                opt_rolecapremove.value = JSON.parse(opt_rolecapremove.value );
            }catch(e) { opt_rolecapremove.value = []}
        }
    }


    var cap_lookup = {}, ori_cap_and_role =null; 
    var cap_name, index 

    /** Get the originally defined custom cap and its default roles if awailable */
    var _get_original = async (cap_name )=>{
        var out  = cap_lookup [ cap_name] || null;
        if ( ! out){
            var ret = await db.query(`SELECT name, value FROM ${db.name}.options WHERE ${db.like('name', 'capability_'+cap_name+ '%')}`)
            if ( ret.length > 0){
                out = cap_lookup[cap_name] = ret[0];
                try{ 
                    out.value = JSON.parse(ret[0].value );
                }catch(e){ 
                    out.value = [] }
            }
        } 
        return out
    }
    //Add cap to opt-add while removing from opt-remove
    for ( var i=0; i < role_config.add_caps.length; i++){
        cap_name = role_config.add_caps[i];

        //remove it from opt-remove
        index = opt_rolecapremove.value.indexOf(cap_name);
        if ( index != -1 ) opt_rolecapremove.value.splice(index,1);
        
        ori_cap_and_role = await _get_original(cap_name);
        if ( ori_cap_and_role) { //capability_<cap name>_%
            console.log ("01 ", ori_cap_and_role)
            if ( ori_cap_and_role.value.includes ( role_id) ){ 
                continue; 
            }  
        }
        
        if (! opt_rolecapadd.value.includes(cap_name )) opt_rolecapadd.value.push(cap_name)
    }    
    //Add cap to opt-remove while removing from opt-add
    for ( var i=0; i < role_config.remove_caps.length; i++){
        cap_name = role_config.remove_caps[i];
        //remove it from opt-remove
        index = opt_rolecapadd.value.indexOf(cap_name);
        if ( index != -1 ) opt_rolecapadd.value.splice(index,1);
        

        ori_cap_and_role = await _get_original(cap_name);
        if ( ori_cap_and_role) { //capability_<cap name>_%
            console.log ("00 Original delete", ori_cap_and_role , ori_cap_and_role.value.includes ( role_id), role_id, role_name )
            if (  ori_cap_and_role.value.includes ( role_id) ){ 
                //original capability includes this role, it weans be can remove it
               
            }  else {
                 continue; 
            }
        }

    
        if (! opt_rolecapremove.value.includes(cap_name )) opt_rolecapremove.value.push(cap_name)
    }    

    await db.update(`options`, [opt_rolecapadd, opt_rolecapremove])

    return true 
  }