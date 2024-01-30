
import plugin from './plugin'
import core from './core'
import db from './db' 
import email_module from './email'
import ecommerce from './ecommerce'
import db_tables from './db_tables'


class Users {

    /**
     * Given a user id and the role (String name or integer name) return an SQL statement that when executed will return
     * a row of all role ids that the user is approved for
     * @param {Object} options {user_id, role}
     * @returns SQL Select statement of all role id that user is approved for
     */
    sql_assigned_roles(options){
        var error = "{SQL_ASSIGNED_ROLES_ERROR}"
        if(!options) return error; 
        var user_id = options.user_id;
        var role_name=options.role ; 
        if ( !user_id || !role_name) return error; 


        var tbur = `${db.name}.user_roles `
        var tbrole= `${db.name}.roles`
        var sql_assigned_roles =`SELECT role_id FROM ${tbur} WHERE ${db.is('user_id',options.user_id)} AND ${db.is('status','approved')}`;
        var sql_get_matching_roles = `SELECT id FROM ${tbrole} WHERE id IN (${sql_assigned_roles}) ` + 
                        `AND (${db.is('title',role_name)} OR ${db.is('id',role_name)})`;
        return sql_get_matching_roles;
    }
    /**
     * Check if a user has a given role.  Provider a role name or id to be checked for the named user_id
     * @param {Object} options {user_id, role}
     * @returns 
     */
    async has_role(options){
        if(!options) return false; 
        var user_id = options.user_id;
        var role_name=options.role ; 
        if ( !user_id || !role_name) return false; 

        var sql = this.sql_assigned_roles(options)
        var ret = await db.query(sql)
        return ret.length > 0
    }
    /**
     * Retrieve a specific user by the options supplied
     * @param {Object} options {user_id|email, simple : Boolean - no metas and no avatar, columns : Array optional, limited: give as little info as possible }
     * @returns {Object}
     */
    async get_user ( options ) {
        if ( ! options ) return null; 
        if ( !options.user_id  && ! options.email) return null;

        var columns = options.columns || options.cols;

        var str_cols = "*"
        if ( Array.isArray(columns) && columns.length>0){
            var final_cols = [];
            for (var i=0; i < columns.length; i++){
                if ( db_tables.users.includes(columns[i]))final_cols.push( columns[i])
            }
            if ( final_cols.length > 0)str_cols = final_cols.join(", ")
        }


        var tb_roles      = `${db.name}.roles`;
        var tb_user_roles = `${db.name}.user_roles`;
        var tb_users      = `${db.name}.users`; 
        var tb_metas      = `${db.name}.user_metas`; 

        var where = [];
        if ( options.user_id )where.push ( db.is('id', options.user_id ))
        if ( options.email) where.push(db.like('email',options.email))

        var id =  options.user_id||options.id;
        var sql = `SELECT ${str_cols} FROM ${tb_users} WHERE  ${where.join(' AND ')}`
 
        var ret = await db.query(sql);
        if ( ret.length == 0 ) return null; 
        // {plugin Return a user after searching by id or email }
        var user = ret[0];
        if ( ! user ) return null; 
        delete user.password;
        delete user.salt ; 

        if ( !options.simple){ 
            
            var avatar = await this.get_meta({user_id : user.id , name : "avatar"});
            user.avatar = avatar ? avatar.value : null; 
            if ( ! options.limited){ 
                user.metas = await this.get_metas({ user_id : user.id })
            }
        }
        user = await plugin.run_filter( 'get_user', user  );
        return user;
    }
    /**
     * Update the user information and or any associated meta properties
     * @param {Object} user { id , ... metas } User information - note the user id is required
     */
    async update_user(user ) {
        if ( ! user ) return null; 
        if ( ! user.id ) return null 
        delete user.password;
        delete user.salt


        /* {plugin Remove a rule assignment from the user } */ 
        user = await plugin.run_filter( 'update_user', user  );

        //Perform the update
        await db.update('users', user )



        var metas = user.meta || user.metas;
        //if avatar key is set
        if ( user.avatar != undefined ) { 
            //Find the meta-property for avatar
            if ( ! metas ) metas = []     
            var m_avatar = metas.find(it => it.name =='avatar')
            //if not found create it and add to meta list
            if ( ! m_avatar ) {
                m_avatar = { user_id : user.id , name : 'avatar' , value : null }
                metas.push ( m_avatar )
            }
            //update it's value
            m_avatar.value = user.avatar 
        }

        if ( ! metas ) return; 
        if ( ! Array.isArray(metas)) metas = [ metas ]

        // Always ensure that meta user id matches the right user
        for ( var i=0; i < metas.length; i++) { 
            metas[i].user_id = user.id 
        }
        await this.update_metas( metas ) 

    }

    

    /**
     * Get the account the user is associated with
     * @param {Object|Number} options Given a user id or an object { user_id } return the user's account id
     * @returns {Number} account_id
     */
    async get_user_account(options){
        if ( ! options) return null; 
        var user_id = options.user_id ? options.user_id : options;
        var is_num = !isNaN(user_id)
        if  (! is_num) return; 
        var tb_user = `${db.name}.users`
        var tb_acc = `${db.name}.accounts`
        
        var ret = await db.query(`SELECT account_id FROM ${tb_user} WHERE ${db.is('id', user_id)}`);
        if ( ret.length ==0) return null; 

        return ret[0].account_id;
    }

    /**
     * 
     * @param {Object} options { account_id, parent_id, status, meta}
     * @returns 
     */
    async get_users (options) {

        if ( ! options ) return null; 
        if ( !options.user_id  && ! options.email) return null;

        var tb_users = `${db.name}.users`; 

        var where = [];
        if ( options.account_id) where.push( db.is('account_id', options.account_id));
        if ( options.parent_id) where.push( db.is('parent_id', options.parent_id));
        if ( options.status) where.push( Array.isArray(options.status) ? db.like('status', options.status): db.is('status', options.status));
        if ( options.role) {
            var tb_roles = `${db.name}.roles`;
            var tb_user_roles = `${db.name}.user_roles`;
            var role_list = Array.isArray(options.role) ? options.role : [options.role];
            var select_role_ids = `(SELECT id FROM ${tb_roles} WHERE ${db.like('title', role_list)})`
            var select_user_ids = `(SELECT user_id FROM ${tb_user_roles} WHERE role_id IN ${select_role_ids})`
            where.push(`id IN ${select_user_ids}`);
        }
        if( options.metas ) { 
            var tb_metas = `${db.name}.user_metas`; 
            var select_user_id = `(SELECT user_id FROM ${tb_metas} WHERE ${db.like('name', options.metas)})`
            where.push(`id IN ${select_user_id}`)
        }
        if ( where.length == 0) where.push(" 1 ") 
        var where_expr = where.join(" AND ")

        var sql = `SELECT id, account_id, parent_id, name, title, email, status FROM ${tb_users} T WHERE ${where_expr} ${await db.page_limit(options)}`
   
        var ret = await db.query(sql); 
         
        db.pagination(ret, {table : tb_users, where,  limit : options.limit, p : options.p, table_alias: "T"  })
        
        /* {plugin Remove a rule assignment from the user } */ 
        ret = await plugin.run_filter( 'get_users', ret  );

        return ret;
    }
    /**
     * Given a user id return all roles available associated with the.  This does not mean the user is necessarily approved,
     * rather the link to the user exist
     * @param {Object} options { user_id }
     */
    async get_user_roles(options){
        var tb_user_roles = `${db.name}.user_roles`
        var tb_roles = `${db.name}.roles`
        var where = ` ${db.is('user_id',options.user_id)}`
        var sub_were = `(SELECT title FROM ${tb_roles} WHERE id=T.role_id) as role_title`
        var sql = `SELECT *, ${sub_were}  FROM ${tb_user_roles} T WHERE ${where} ${await db.page_limit(options)}`
        
        options.table_alias = "T"
        var ret =  await db.query(sql);
        await db.pagination(ret, options)

        plugin.run_filter('get_user_roles', ret)
        return ret; 
    }
    async update_roles(options){

         await db.update('roles',options)
         plugin.run_action('update_roles', options);
         return true;
    }
    async remove_roles(options){
        if ( ! options ) return false;

        var where = [];
        if ( Array.isArray(options)){
            for(var i=0; i < options.length; i++){
                if ( options[i].id){  where.push(db.is('id', options[i].id)); continue; }
                if ( options[i].account_id && options[i].title ){
                    where.push (
                       '('+ db.is('account_id', options[i].account_id) + ' AND ' + db.is('title', options[i].title) + ')'
                    )
                    continue; 
                }
            }
        }else {
            if ( options.id) where.push(db.is('id', options.id))
            if ( options.account_id && options.title ){
                where.push (
                    '('+ db.is('account_id', options[i].account_id) + ' AND ' + db.is('title', options[i].title) + ')'
                ) 
            }
        }
        if ( where.length == 0) return; 
        var tb = `${db.name}.roles`
        var sql= `DELETE FROM ${tb} WHERE ${where.join(' OR ')}`

        await db.query(sql);
        plugin.run_action('delete_role',options);
    }
    /**
     * Given either an account_id or user_id, retrieve all roles
     * @param {Object} options {user_id }
     * @returns {Array}
     */
    async get_roles(options){
        if ( ! options )            return  []
        if ( ! options.user_id )    return [] 

        var u_sql = ``, tb_user_roles = `${db.name}.user_roles`
        u_sql = `(SELECT role_id FROM ${tb_user_roles} WHERE ${db.is('user_id',options.user_id)})`
 
        
        var tb_roles = `${db.name}.roles`  
        var sql = `SELECT * FROM ${tb_roles} T WHERE id IN (${u_sql}) ${await db.page_limit(options)}`
 
        var ret =  await db.query(sql);
        options.table_alias = "T"
        ret = await db.pagination(ret, options) 
        if ( options.flat ) {
            ret = ret.map (role => role.title )
        }
        return ret; 
    }
    /**
     * Update a or group of user role assignments
     * @param {Object} options Object or array object {user_id, role_id, status}
     * @returns {Object|Array}
     */
    async update_assigned_roles ( options) {
        if ( ! options) return null; 
        var arr = Array.isArray( options) ? options : [ options ];
        var where = []
        for(var i=0; i < arr.length; i++){
            where.push("(" +  db.is('user_id', arr[i].user_id) + " AND " + db.is('role_id',arr[i].role_id) +")")
        }
        if ( where.length == 0) return options;
        var tb = `${db.name}.user_roles`
        var sql = `SELECT id, user_id, role_id FROM ${tb} WHERE ${where.join(' OR ')}`
        var ret = await db.query(sql);
        var ait , rit;

        //Use loop to ensure that pre-existing user_id/role_id combination are never repeated more than once
        for (var i=0; i < arr.length; i++){
            ait = ( arr[i] )
            for(var j=0; j < ret.length; j++){
                rit = ret[j];
                if ( rit.user_id == ait.user_id && rit.role_id == ait.role_id){
                    ait.id = rit.id; break; 
                }
            }
        }

        /* {plugin Remove a rule assignment from the user } */
        plugin.run_action('update_assigned_roles',arr)

        return await db.update('user_roles',arr)
    }
    /**
     * Given a combination of user_id and role_id or a an id to the preceding, delete any matching records from the
     * user role assignment table
     * @param {Object|Array} options { id or user_id and role_id} remove any matching records
     * @returns {Object}
     */
    async remove_assigned_roles ( options) {
        if ( ! options) return null; 
        var arr = Array.isArray( options) ? options : [ options ];
        var where = []
        for(var i=0; i < arr.length; i++){
            if ( arr[i].id ) {
                where.push(db.is('id',arr[i].id))
            }else { 
                where.push("(" +  db.is('user_id', arr[i].user_id) + " AND " + db.is('role_id',arr[i].role_id) +")")
            }
        }
        if ( where.length == 0) return options;
        var tb = `${db.name}.user_roles`
        var sql = `DELETE FROM ${tb} WHERE ${where.join(' OR ')}`
        var ret = await db.query(sql);
        
        /* {plugin Remove a rule assignment from the user } */
        plugin.run_action('remove_assigned_roles',arr)
        return true
    }
    /**
     * Retrieve a specific meta property for a given user by the option name provided
     * @param {Object} options {user_id, name, flat }
     * @returns {Object }
     */
    async get_meta (options ){

        if ( ! options) return null; 
        if ( ! options.user_id ) return null; 
        if ( ! options.name ) return null; 
        var sql = `SELECT * FROM ${db.name}.user_metas WHERE user_id=${db.esc(options.user_id)} AND name LIKE ${db.esc(options.name)}`
        var ret = await db.query(sql);
        if (ret.length==0) return null; 
        var meta =  ret[0];
        meta = await plugin.run_filter( 'get_meta', meta  );
        if ( options.flat ) meta = meta.value 
        return meta;
    }
    /**
     * Get all metas for a given set of user(s)
     * @param {Object} options { user_id : integer or array of integers, fields : optional list of metas to target and return }
     * @return {Array}
     */
    async get_metas (options) {
        var tb = `${db.name}.user_metas`

        var where =  [ db.is('user_id', options.user_id) ]
        if (Array.isArray(options.fields) && options.fields.length>0 ){
            where.push( `(name IN ${db.arr(options.fields)})`)
        }
        var sql = `SELECT * FROM ${tb} WHERE ${where.join(" AND ")}`

        var ret = await db.query(sql);
        
        return await plugin.run_filter( 'get_meta', ret  );
    }
    /**
     * Create or update an individual or array of user meta properties.  Note: if passing in array, please make sure the
     * that the Array of user-metas belong exclusively to the same user-id. 
     * @param {mixed} options Array or Object
     * @returns {mixed}
     */
    async update_metas ( options) {
        if ( ! options) return null; 
        var arr = Array.isArray( options) ? options : [ options ];
        var where = []
        // use this variable to determine if the set of arr metas to update belong to just 1 user_id
        // and if so additional logic can be performed
        var user_ids = [];
        for(var i=0; i < arr.length; i++){
            //if the meta has a user id and the user-id is not already in the id-list, add it to the ids 
            if ( arr[i].user_id && !user_ids.find(it=> it == arr[i].user_id )) user_ids.push(arr[i].user_id )
            if ( arr[i].user_id && arr[i].name) { 
                where.push("(" +  db.is('user_id', arr[i].user_id) + " AND " + db.is('name',arr[i].name) +")")
            }else if ( arr[i].id ) {
                where.push(`${db.is('id', arr[i].id) }`)
            }
        }

        if ( where.length == 0) return options;
        var tbumetas = `${db.name}.user_metas`
        var tbumetas = `${db.name}.user_metas`
        var sql = `SELECT id, user_id, name  FROM ${tbumetas} WHERE ${where.join(' OR ')}`
        
        var ret = await db.query(sql);
        var meta_toupdate , existing_meta;
        var looped_ret_already = false; 
        //Use loop to ensure that pre-existing user_id/name combination are never repeated more than once
        for (var i=0; i < arr.length; i++){
            meta_toupdate = ( arr[i] )
            for(var j=0; j < ret.length; j++){
                existing_meta = ret[j];
                if ( ! looped_ret_already ) {
                    if ( existing_meta.user_id && !user_ids.find(it=> it == existing_meta.user_id)) user_ids.push(existing_meta.user_id)
                }
                if ( existing_meta.user_id == meta_toupdate.user_id && existing_meta.name == meta_toupdate.name){
                    meta_toupdate.id = existing_meta.id; break; 
                }else if (existing_meta.id == meta_toupdate.id ) {
                    meta_toupdate.id = existing_meta.id; break; 
                }
            }
            looped_ret_already = true; 
        }
        /* {plugin Remove a rule assignment from the user } */
        plugin.run_action('update_metas',arr)
        var updated_metas = await db.update('user_metas',arr)

        // if all the arr properties belong to a single user, then perform additional logic
        if ( user_ids.length == 1 ) {
            await this.sync_user_to_customer({ user_id : user_ids[0], create : true })
        } 

        return updated_metas;
    }

    async remove_metas ( options) {
        if ( ! options) return null; 
        var arr = Array.isArray( options) ? options : [ options ];
        var where = []
        for(var i=0; i < arr.length; i++){
            if ( arr[i].id ) {
                where.push(db.is('id', arr[i].id ))
            }else { 
                where.push("(" +  db.is('user_id', arr[i].user_id) + " AND " + db.is('name',arr[i].name) +")")
            }
        }

        if ( where.length == 0) return options;
        var tb = `${db.name}.user_metas`
        var sql = `DELETE FROM ${tb} WHERE ${where.join(' OR ')}`
        console.log ("DELETEING ", sql)
        await db.query(sql);
   
        /* {plugin Remove a user meta for a specific user } */
        plugin.run_action('remove_metas',arr) 
    }
    async register ( user) {
        if ( ! user ) return null; 
        if ( ! user.email) core.throw("Email was not provided")
        if ( ! user.name) core.throw ("User must have a name")
        
        //{step Check if a user with the same email address already exist. }
        var sql = `SELECT id FROM ${db.name}.users WHERE email LIKE ${db.esc(user.email)} OR name LIKE ${db.esc(user.name)}`;
        var ret = await db.query(sql);
        if ( ret.length > 0) core.throw("Email or Username provided are currently registered")

        //{step initialize user's salt, encrypt password }
        user.salt = core.random_str(64);
        user.password = core.hash(user.password, user.salt);
        
        /*{plugin  Runs prior to adding user record to database. Utilize for modify user object data fields}*/
        user = await plugin.run_filter("before_register_user", user )
        await db.update("users", user);
     
        delete user.password;
        delete user.salt;
        /*{plugin User was registered and data is saved in DB } */
        plugin.run_action("register_user", user);
   
        return user;
    }
    async login ( user ) {
        if ( ! user ) return null; 
        if ( ! user.password) core.throw("Password was not provided")
        if ( ! user.name) core.throw ("User must have a name")

        // {step Find the user and get the user that is trying to login, but exit with null if we cannot find}
        var sql = `SELECT * FROM ${db.name}.users WHERE name LIKE ${db.esc(user.name)}`;
        var ret = await db.query(sql);
        if (ret.length==0) return null; 

        // {step Has the login creditential and compare with what we have saved in order to check if the right user}
        var registered_user = ret[0];

        var hashed_password = core.hash(user.password, registered_user.salt);
        var password_match = hashed_password == registered_user.password ; 

        delete registered_user.password;
        delete registered_user.salt;

        //From here forward, work with the registered_user object instead of what was passed in
        //{step if passwords dont match, run action and exit}
        if (!password_match){ 
            /*{plugin Someone tried to login using the provided user data but had incorrect password } */
            plugin.run_action("login_failed", registered_user);
            return null; 
        } 
        /*{plugin User successfully login in } */
        plugin.run_action("login_success", registered_user); 
        return registered_user;
    }
    /**
     * Provided a valid token, return the user it represents
     * @param {String} token Verify that the supplied token is valid
     * @return {Object} Null or the underlining user
     */
    async verify(token){
        if (!token) return null; 

        return await core.jwt_verify(token)
    }
    async forgot_password ( options ) {
        if ( ! options) return null; 
        let { email } = options;
        if ( ! email ) return null; 

        let tb_users = `${db.name}.users`
        let tb_umetas = `${db.name}.user_metas`

        var sel_user = `SELECT id, name, status FROM ${tb_users} WHERE ${db.like('email', email)}`
        var ret = await db.query(sel_user );
        var user = ret[0];
        if ( ! user ) return null;

        let site_name = await core.get_option({ name : "site_title", flat : true })
        var reset_token = core.random_str(12) + Date.now().toString().substring(9);
        this.update_metas({ user_id : user.id , 
            name : "password_reset_token" ,
            value : reset_token , 
        })

        let site_base_url = await core.get_option({ name : "site_base_url", flat:true }) 
        let link = `${site_base_url}/reset-password?t=${reset_token}&email=${email}`
        email_module.send({
            to : [ email ], 
            subject : `${site_name} - Password Reset`,
            html : 
            `<p>Thank you for requesting password reset.</p>` +
            `<p>Please click below link to reset your ${site_name} password.</p>`+
            `<div> <div style="max-width:440px; min-width:300px; margin: 0 auto;">${link}</div>   </div>`
        })
        return user 
    }
    /**
     * The user is requesting to set a new password.  To complete the action, the user must have either a reset_token
     * or a provide the old password.
     * @param {Object} options { new_password : new passworld, reset_token : optional, old_password: optional, user_id : required when old_password provided }
     */
    async reset_password ( options ) {
        if ( ! options ) core.throw ("No options supplied"); 
        if ( ! options.new_password ) core.throw("New Password was not provided"); 
        let { reset_token, old_password, user_id, email, new_password  } = options;

        let tb_users = `${db.name}.users`
        let tb_umetas = `${db.name}.user_metas` 

        var can_change_password = false; 
        var user_salt = null; 
        if ( reset_token  ) { //verify that this is correct
            var where = ` ${db.like('name', 'password_reset_token')} AND ${db.like('value', reset_token)}`
            var sel_user_id = await db.query(`SELECT user_id FROM ${tb_umetas} WHERE ${where}`)
            if ( sel_user_id.length > 0 ){
                user_id = sel_user_id[0].user_id; 
                can_change_password = true;  


                var sel_salt = await db.query(`SELECT salt,password FROM ${tb_users} WHERE ${db.is('id',user_id)}`);
                if ( sel_salt.length==0) core.throw("Was able to find reset token, but unable to locate the user "+user_id );  
                
                user_salt = sel_salt[0].salt;   
            }
        } else if (user_id && old_password ) { //verify that this is correct
            
            var sel_salt = await db.query(`SELECT salt,password FROM ${tb_users} WHERE ${db.is('id',user_id)}`);
            if ( sel_salt.length==0) core.throw ("User ID not found");  
            
            user_salt = sel_salt[0].salt; 

            var hashed_password = core.hash(old_password, user_salt);
            var password_match = hashed_password == sel_salt[0].password ; 
            if ( ! password_match ) {
                core.throw ("User old password did not match");
                
            }
            can_change_password = true;//at this point everyting checks out
        }else {
            core.throw("Unable to change password") 
        }
        if ( ! can_change_password ) {
            core.throw ("You cannot change password") 
        }

        var new_hashed_password  = core.hash(new_password, user_salt); 
        await db.update('users', { id  : user_id , password : new_hashed_password   })
        console.log ("Successfully set new password ")
        return true 
    }



    /**
     * See if the named property is within user_obj.metas and if not search the database and return the flat value 
     * @param {Object} options { user_obj : User Object we want to search within for the meta property, name: meta property  }
     * @returns {mixed}
     */
    get_meta_or_query = async ( options )=>{
        
        let user_obj        = options.user_obj  
        let meta_name        = options.name 
        if ( ! user_obj ) return null; 
        if ( ! meta_name) return null; 
        if ( ! user_obj.id) return null; 
        let do_query = false,value 
        if ( ! user_obj.metas) {
            do_query = true; 
        }else { 
            var meta = user_obj.metas.find(it => it.name == meta_name );
            if ( ! meta ) { 
                do_query = true;
            }else {
                value = meta.value 
            }
        }
        if ( do_query ) {
            value = await this.get_meta({ user_id : user_obj.id , name : meta_name , flat : true })
        }
        return value 
    }

    /**
     * Get the user
     * @param {Object} options { user_id } Given a user id return a formated user object that we can pass to third party api
     * @return {Object} Returns the third party formated represetnation of a customer. Also options.user will be set to the user that was pulled from DB
     */
    async get_user_to_customer(options){
        if ( ! options) return null; 
        // pull down the user 
        // pull down select meta properties
        var user_id = options.user_id 
        var tbuser = `${db.name}.users`, tbmetas = `${db.name}.user_metas`
        var fields = [ 'first_name','last_name','dob','address1','address2','city','postal_code','state','account_note']

        //try to reuse data if it is already set, otherwise then query
        var user    = options.user ;
        if ( ! user ) {
            user = await db.query(  `SELECT eid,id,name,email FROM ${tbuser} WHERE ${db.is('id', user_id )}` )
            if (user.length== 0) return null;
            user = user[0];
        }
        if ( ! user ) return null;
        
        var stripe_customer = null 
        let metadata = {}
        if ( user.id )  {    // when user id exist do this    
            var metas   = await this.get_metas({ user_id , fields }) || [] 
            user.metas = metas ; 
            let user_obj = user; 
            options.user = user ; 

            var f_name = await this.get_meta_or_query ({ user_obj , name : 'first_name'  }) || user.name 
            var l_name = await this.get_meta_or_query ({ user_obj , name : 'last_name'  }) || user.name 
            var name = l_name + ", " + f_name
            
            stripe_customer = {
                name , description : await this.get_meta_or_query({ user_obj,name : 'account_note'}),
                email : user_obj.email, 
                address : {
                    city : await this.get_meta_or_query({ user_obj, name : 'city' }),
                    line1 : await this.get_meta_or_query({ user_obj, name : "address1"}),
                    line2 : await this.get_meta_or_query({ user_obj, name : "address2"}),
                    postal_code : await this.get_meta_or_query({ user_obj, name : "postal_code"}),
                    state : await this.get_meta_or_query({ user_obj, name : "state"}),
                },
                metadata ,
                phone : await this.get_meta_or_query({ user_obj, name : "phone"})
            }
        } else { //when no user ID - we are trying to do one-time customer creation for a user who does not have an account
            //think - annomyous shower, donation ie
            stripe_customer = user; 
            options.user = user; 
        }
        return stripe_customer 
    }
    /**
     * Send the user value states and other information to third party API.  This method is invoked automatically after each invokation of
     * @User.update_metas 
     * @param {Object} options {user_id, create : Boolean - when true, will create the customer if not already }
     */
    async sync_user_to_customer(options){
        let stripe_customer = await this.get_user_to_customer(options )
        if ( ! stripe_customer ) return null; 
        if ( ! options.user ) return null; 
        var is_customer = options.user.eid ? true : false ; 
        
        let api_response    = null; 
        let stripe          = null; 
        var action_type     = "";
        if ( !is_customer  ) {
            if ( options.create ) { 
                try {  
                    stripe = await ecommerce.get_stripe()
                    api_response = await stripe.customers.create(  stripe_customer  ); 
                    if ( options.user.id ) { // is options.user included a id - then save the eid to that user
                        //otherwise - we can safely assume the option.user is an anoymous user
                        await this.update_user({ id : options.user.id , eid : api_response.id })
                    }
                }catch(err){ this.hnd_api_error(err,"sync_user_to_strip:create")}
            } 
        } else {
            //always do update when the user is already a customer
            try {  
                action_type = "update"
                stripe = await ecommerce.get_stripe()
                api_response = await stripe.customers.update( options.user.eid, stripe_customer  ); 
            }catch(err){ this.hnd_api_error(err,"sync_user_to_strip:uddate")}
        }
    }
    /**
     * Update different aspect of the user's store settings such as payments
     * @param {Object} options { user_id, 
     *  payment_method_id : add payment method to user ,
     *  remove_payment_method_id : remove payment method from user
     * }
     */
    async update_account (options){
        var user = await this.get_user({ user_id : options.user_id, columns :['eid'], simple: true})
        if ( ! user ) core.throw("Unable to save card information without customer ID for user("+ options.user_id+")") 

        let stripe = await ecommerce.get_stripe()

        if ( options.payment_method_id ) {  //attach a payment method to the user
            //the payment_method.id == options.payment_method_id
            const payment_method = await stripe.paymentMethods.attach (  options.payment_method_id , {  
                customer  : user.eid  
            });
        }
        if ( options.remove_payment_method_id ) {
            const paymentMethod = await stripe.paymentMethods.detach( options.remove_payment_method_id );
        }   
    }
    /**
     * For a given user, return all known payment methods on file
     * @param {Object} options { user_id  }
     */
    async get_payment_methods (options){
        var user = await this.get_user({ user_id : options.user_id, columns :['eid'], simple: true})
        if ( ! user ) core.throw("Unable to locate the specified user - " +options.user_id )
        if ( ! user.eid ) return null 
        var stripe = await  ecommerce.get_stripe()
        const list = await stripe.paymentMethods.list({
            type: 'card', limit: 10,
            customer: user.eid ,
        });
        //TODO : need to loop list.data to create an abbreviated representation to the user on ethe profile page
        //      so the user will have an option to remove it if they want
        var payment_methods = [], method;
        console.log ("List.data.length payment methods", list.data.length)
        for ( var i=0; i < list.data.length; i++){
            method = list.data[i]
            payment_methods.push ({ //save details of the customers payment method
                id : method.id , 
                brand : method.card.brand , 
                exp_month : method.card.exp_month , 
                exp_year : method.card.exp_year , 
                funding : method.card.funding,  
                last4 : method.card.last4, 
                type : method.type , 
                created : new Date( method.created * 1000 ), 
                customer_id : method.customer, 
            })

        }
        console.log ( payment_methods, "Payment methods" )
        return payment_methods
    }
    hnd_api_error(err, during_function){
        core.error(`use.api.exception(${during_function}) - stripe error`, err.type, "=>", err.message,err )
    }
}

const users = new Users()

export default users ;