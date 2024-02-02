
import fs from "node:fs/promises"
import jsonwebtoken from "jsonwebtoken"; 
import plugin from "./plugin";
import crypto from "crypto"
import db from "./db"
import { createReadStream } from 'fs'
import rrule from 'rrule'

import axios from "axios";

const ms_to_min = 1 / 60000
/**
 * On Dates: JxtPress relies on UTC storeage of dates.  This means all dates are stored as timestamps and dates
 * instantated on server will be auto converted to the server's local time.  When dates are returned to frontend or
 * server invoker, it is stored in UTC String and when instatied on JS frontend should yields dates local to the user,
 * regardless of each user's timezone location.
 */
class Core {
    db = null; 
    env = null;
    name = "JxtPress" 
    version = "1.5.0a"
    is_dev  = process.env.NODE_ENV == 'development'
    is_prod = process.env.NODE_ENV == 'production'

    __adding_global_caps = true;

    /**
     * Holds an array of object { is_global, name : String, 
                roles : Array (roles names, lowercase)
                accounts : Array (id account)
     */
    _capabilities = [];
    _post_types = []; 
    _menu_links = [];
    _blocks =   [] 
    _components = []
    __is_ready = false; 


    plugin     = null;
    db         = null;
    groups     = null  
    pages      = null 
    users      = null
    email      = null 
    ecommerce  = null
    /**
     * Perform conversion of offset timezone (options.date) to UTC standard.   
     * @param {String|Number|Object} option { date: the to convert , offset : current timezone of date value } 
     * @returns 
     */
    to_utc( options ){
        let { date : date_to_convert , offset } = options 
        if ( ! date_to_convert ) throw new Error("Unable to perform conversion - date to convert is null or missing" )
        if ( ! options.offset) throw new Error("Unable to complete conversion - offset is missing or null")
        var type = typeof date_to_convert 
        var d = ['string','number'].includes(type) ? new Date(date_to_convert) : date_to_convert 
        

        var cur_offset = d.getTimezoneOffset()
        if ( cur_offset == offset ) return d //return the current object; there is no need to convert
  
        //Deal with dates in milliseconds for most accuracy
        var utc = d.getTime() + ( cur_offset * 60000);
        var d_with_offset = new Date(utc + (3600000*offset));
        
        return d_with_offset 
    }
    /**
     * Given a date that originates from the server, convert the server date to the user's local timezone.  Internally, @core.convert_to_utc is used
     * @param {String|Number|Object} options { date : the user's time , offset: ignored }
     * @returns {Date} newly converted date
     */
    to_user_time( options ) { 
        var now = new Date()
        return this.to_utc({ date : options.date , offset : now.getTimezoneOffset() })
    }
    /**
     * Given a date that originatesfrom the user or external to the server, convert the external date to the 
     * server's local timezone
     * @param {String|Number|Object} options { date : the server time, offset : the user's offset }
     * @returns {Date} newly converted date
     */
    to_server_time(options ) {
        return this.to_utc( options ) 
    }
    capitalize (str){
        if ( ! str ) return str
        return str.replace(/_/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
    }
    log (...arg){
        console.log ("Jxt:>", ...arg);
    }
    error (...arg){
        console.log ("Jxt:Err>", ...arg);
    }
    random_str(length=20){
        return crypto.randomBytes(length).toString("hex")
    }
    /**
     * Perform a one way encryption
     * @param {String} data Value to hash
     * @param {String} salt salting value
     * @returns 
     */
    hash ( data, salt ) {
        var hash = crypto.createHmac('sha512', salt);
        hash.update(data);
        return hash.digest('hex'); 
    }
    /**
     * Create an encrypted value
     * @param {String} data Data to encrypt using 'aes-256-cbc' and the application environment secret and secret IV
     * @returns {String} Encrypted version of data
     */
    encrypt ( data ) {
        var secret_key = this.env.APP_SECRET || null; 
        var secret_iv = this.env.APP_SECRET_IV
        var ecnryption_method  = `aes-256-cbc`
        
        const key = crypto
                    .createHash('sha512')
                    .update(secret_key)
                    .digest('hex')
                    .substring(0, 32) 
        const encryptionIV = crypto
                    .createHash('sha512')
                    .update(secret_iv)
                    .digest('hex')
                    .substring(0, 16)
        
        const cipher = crypto.createCipheriv(ecnryption_method, key, encryptionIV)
        
        var e_data = cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
        return Buffer.from( e_data ).toString('base64') // Encrypts data and converts to hex and base64
    }

    /**
     * De-encrypt a value that was previously encrypted
     * @param {String} encrypted_data Data to decrypt using 'aes-256-cbc' and the application environment secret and IV
     * @returns {String} Plan text value
     */
    decrypt ( encrypted_data ) {
        var secret_key = this.env.APP_SECRET || null; 
        var secret_iv = this.env.APP_SECRET_IV
        var ecnryption_method  = `aes-256-cbc`
        
        const key = crypto
                    .createHash('sha512')
                    .update(secret_key)
                    .digest('hex')
                    .substring(0, 32) 
        const encryptionIV = crypto
                    .createHash('sha512')
                    .update(secret_iv)
                    .digest('hex')
                    .substring(0, 16)
        
        const cipher = crypto.createCipheriv(ecnryption_method, key, encryptionIV)
        
        const buff = Buffer.from(encrypted_data, 'base64')
        const decipher = crypto.createDecipheriv(ecnryption_method, key, encryptionIV)
        var e_subdata =  decipher.update(buff.toString('utf8'), 'hex', 'utf8') + decipher.final('utf8')
        return  e_subdata // Decrypts data and converts to utf8

    }
    
    /**
     * Use this function to reduce the frequency of code being ran.  Given an object "options.obj" that holds the last time the cache
     * was ran (or if first time, will initialize the variable automatically), determine whether or not a code block should be ran by
     * returning true or false if the given elapse time has pasted or not.  If the elapse time has pasted, "options.obj.key_time" will be
     * reset to current time (now).  Example var use_cache = core.use_cache({ obj: some_obj, key_time : "key_in_some_obj" , elapse: "n_max_minutes"})
     * @param {Object} options {    obj        : Object holding data-ie field name,
     *                              key_time    : String pointing to obj field storing last time cache was run, 
     *                              elapse      : Amount of time in minutes between cache 
     *                          }
     * @returns {Boolean} True: developer should use previously calculated value, false: developer should re-calulate value
     */
    use_cache ( options) {
        var time_key        = options.key_time|| options.time_key || options.key_name 
        var obj             = options.obj 
        if ( ! time_key ){
            console.trace("do_cache - time_key is required")
            return false; //no caching - recalculate value
        }
        if ( typeof obj != 'object' || obj == null){
            console.trace("do_cache - obj is required for caching")
            return false; //no caching - recalculate value
        }
        var every_x_minutes = options.elapse;
        if ( !every_x_minutes ) every_x_minutes= 3
        let use_cache         = true

        var now = Date.now()
        if ( obj[time_key] == undefined || obj[time_key] == null || obj[time_key] <= 0){
            obj[time_key]         = now 
            use_cache   = false;
        } 

        var msec            = 1000, minutes=60
        var dif             = now - obj[time_key]
        var threshold       = msec * minutes * every_x_minutes;
        if ( dif >= threshold) {    //reset 
            obj[time_key]   = now;
            use_cache       = false; 
        }  
        return use_cache
    }


    /**
     * Get Servers working directory
     * @returns {String}
     */
    get_server_root(){
        if ( ! this.env) return null; 
        return this.env.cwd
    }
    chk (options, field, def=undefined){
        if ( ! options) return def 
        var value = options[field];
        if ( value === undefined && def !== undefined) value = def; 
        return value ; 
    }
    is_numeric (val) { 
        return !isNaN(val) 
    }
    type_number (data ) {
        return Number.parseFloat(data )
    }
    type_string ( data ){
        var t = typeof data ;
        if ( t == 'string') return data
        else { 
            if ( typeof data == 'function') return null 
            return JSON.stringify(data)
        }
    }
    type_date  (data) {
        if ( !data ) return null 
        var dt =null; 
        if ( data && data.getTime) return data 
        if ( typeof data == 'number') dt = new Date(data )
        else { 
            data = this.type_cast(data)
            dt = new Date(data);
        } 
        return dt  
    }
    /**
     * Ensures that a JSON string is return as JSON, while string, object, and numbers are returned
     * as numbers and boolean. 
     * @param {mixed } data 
     * @param {Boolean } do_decrypt Indicate if the data is encrypted and we should decrypt before returning
     * @returns {mixed }
     */
    type_cast(data, do_decrypt = false ) {
        if ( data == null || data == undefined) return null; 
        var t = typeof data;  
        
        if ( data =='true') return true;
        else if (t =='string' && data.trim() =='') return data 
        else if (t =='string' && t.startsWith('#')) return data 
        else if ( Array.isArray(data)) return data; 
        else if (t == 'object' ) return data 
        else if ( data =='false') return false 
        else if ( t == 'number'|| t == 'boolean' ) return data 
        else if ( t == 'string' &&  (data.charAt(0) == '['|| data.charAt(0) == '{')){ 
            try {
                data = JSON.parse(data) 
            }catch(e){}
        }else if (!isNaN(data)){ 
            data = Number.parseFloat(data) 
        } 

        if ( do_decrypt ) {
            data = this.decrypt(data)
        }
        return data 
    }
    type_bool(data){
        var type = typeof data 
        
        if ( type == 'string') {
            var t = data.toString();
            return ['yes','1','true','active'].includes(t)
        }else if ( type == 'number'){
            return data > 0
        }else {
            return data != null 
        }
    }
    /**
     * Given a string name ( ie "some_variable_string") check to see if it ends with a type specifier
     * @param {String} name name for an option or meta property
     */
    get_type_specifier(name){
        if ( ! name ) return null; 
        name = name.toLowerCase()
        var types = ['_text','_string','_number',  '_datetime','_date','_bool','_arrobj','_arritem', '_color', '_lookup']
        var index=-1;
        var type_name = null; 
        for(var i=0; i < types.length; i++){
            if ( name.endsWith( types[i ])) {
                index = i;
                type_name = types[i].substring(1);
                break; 
            }
        }
        return type_name
    }
    /**
     * Returns the name of a meta or option without the type specifier
     * @param {String} str String representing a meta or option name
     * @param {String|Undefined} type_name the value of any type specified contained within the string name;  If not supplied, function will auto inquire
     * @returns {Array} return the name of a meta or option name without the type specifier
     */
    get_name_only (str , prefix=undefined , type_name =undefined){
        if ( ! str ) return null; 
        if ( type_name === undefined ){ 
            type_name = this.get_type_specifier(str)
        } 
        if ( type_name ) {
            str = str.substring(0, str.indexOf(type_name)-1);
        } 
        if ( typeof prefix == 'string' ) {
            str = str.substring(prefix.length);
        }
        return str 
    }
    /**
     * Get a clean cookie by internvally invoking getCookie and cleaning the cookie before returning
     * @param {H3Event} event Route Event
     * @param {String} name name of the cookie to retrieve
     * @param {mixed} inital_value When null
     * @returns {mixed}
     */
    get_cookie ( event, name, init_util=null){
        var cookie = getCookie(event,name); 
        if ( cookie == 'undefined' || cookie === undefined) cookie = init_util; 

        if (typeof cookie == 'string' && (cookie.charAt(0) =='[' || cookie.charAt(0) == '{')){
            cookie = JSON.parse(cookie)
        } 
        return cookie
    }
    /**
     * Return all registered capabilities and site option capabilities on the site.  Function then pull in 
     * custom capablities from options table that starts with "capability_" and finally will associate, if any, "rolecap<add|remove>_<role name>"
     * with existing capabilities list.
     *  
     * @returns {Array} Array of { is_global , name, roles:Array role names, accounts: depreciated }
     */
    async _get_capabilities(){
        try{ 
        var tboption = `${db.name}.options`
        var custom_capabilities = [];
        var prefix = `capability_`
        var ret_custom_caps = await db.query(`SELECT name, value FROM ${tboption} WHERE name LIKE '${prefix}%'`);
        var type_name, opt_name, opt_value;  

        var cust_cap;
         
        
        for ( var i=0; i < ret_custom_caps.length; i++){
            cust_cap = ret_custom_caps[i]; // { id , name, value }
            type_name = this.get_type_specifier( cust_cap.name )
            opt_name = this.get_name_only(cust_cap.name )
            if ( ! opt_name) {  
                continue; 
            }

            opt_name    = opt_name.substring(prefix.length); //get the name portion only,
            opt_value   = await this.type_cast( cust_cap.value )   
            if ( ! opt_name )  {    
                continue; 
            } 
 
            var roles = [];//Roles associated with this capabilities
            if ( Array.isArray( opt_value )) {//If values is an array, add any string or id
                for(var j=0; j < opt_value.length; j++){ 
                    if ( isNaN(  opt_value[j] )  ) { 
                        var temp = opt_value[j]
                        var temp_role = await db.query( `SELECT id FROM ${db.name}.roles WHERE ${db.like('title', temp)} `)
                        if ( temp_role.length >  0)    roles.push( temp_role[0].id )
                    }else {
                        //add the role id
                        roles.push( opt_value[j] )
                    }
                }
                
            }
            custom_capabilities.push({
                is_global : false,              //
                name :  opt_name,  roles  ,     //list of roles the capability is tied to
                accounts : [],                  //array of account ids to register this capability to
            }) 
        } 


        //Array   =     { name, is_global ,  accounts }
        var final_caps =   [ ...this._capabilities , ... custom_capabilities ] 
 
        //See if there are extended role capabilities to add/remove from a given role
        var prefix0 = `rolecapadd_`, prefix1 =`rolecapremove_`
        var n0 = `${prefix0}%`
        var n1 = `${prefix1}%`
        var sql=`SELECT name,value FROM ${tboption} WHERE ${db.is('name',n0)} OR ${db.is('name',n1)}`
        var ext_rolecaps =await db.query(sql), opt, opt_type,role_name, is_add   
         

        let find_and_update_cap = (opt_capname, role_id, do_add )=>{
            //console.log (do_add ? "Add":"Remove", opt_capname, " from ", role_id)
            let cap  = null  
            //find the capability
            cap = final_caps.find(it =>{
                var cap_name = it.name 
                if ( ! cap_name ) {  console.error("Yo, wtf", it ); return ;   } 
                cap_name = cap_name.toLowerCase();
                return cap_name == opt_capname
            })
            //
            if ( cap && Array.isArray(  cap.roles )) {
                if ( do_add){ 
                    if (! cap.roles.includes(role_id )){ 
                        cap.roles.push( role_id )
                    }
                }else {
                    var index = cap.roles.indexOf(role_id);
                    if ( index != -1 )cap.roles.splice(index,1)
                }
            } 
        }
        for ( var i=0; i < ext_rolecaps.length; i++){
            opt = ext_rolecaps[i];  // array of { name, value }
            try {
                opt.value = JSON.parse(opt.value);
            }catch(e){    opt.value = []  }

            opt_type = this.get_type_specifier(opt.name)
            if ( opt.name.startsWith(prefix0)){
                is_add = true; 
                role_name = opt.name.substring(prefix0.length)
            }else {
                is_add = false; 
                role_name = opt.name.substring(prefix1.length)
            }
            if ( opt_type ) {
                role_name = role_name.substring(0, role_name.indexOf(opt_type)-1 )
            }
            role_name = role_name.toLowerCase()
            var role_id = role_name
 
            if ( isNaN(role_id)) {//if not a number, convert to a number

                var t0 =await db.query(`SELECT id FROM ${db.name}.roles WHERE ${db.like('title', role_name)}`)
                if (t0.length== 0) continue; 
                role_id = t0[0].id ; 
            }else {
                role_id = JSON.parse(role_id)
            }
 
            //opt.value = Array of caps to be added/removed from final capabilities
            var opt_capname
 
            //Loop the capabilities wound within opt { name: (rolecap<add|remove>), value : Array caps } 
            for(var j=0; j < opt.value.length; j++){ //loop each capability name to be added
                opt_capname = opt.value[j];
                if ( is_add ) { 
                    find_and_update_cap(opt_capname,role_id, true )
                }else {
                    find_and_update_cap(opt_capname,role_id, false )
                }
            } 
 
            
        }
        
        return final_caps 
    }catch(e){
        core.error("get_capabilities error - " + e.message,e);
        return []
    }
    }
    /**
     * Create capabilit(ies)
     * @param {Array|Object} caps An array of string or single string of capability names, ie ["cap_a","cap_b"] or "cap_a"
     */
    async create_capability(caps){
        if ( ! Array.isArray(caps))caps = [ caps ]

        //do not initialize "all_caps" usering _get_capabilities
        //because we want the raw cabilities object the modified version
        var all_caps = this._capabilities   ;    
        var cap_name;  
        for( var i=0; i < caps.length; i++){
            cap_name = caps[i];
            if ( typeof cap_name != 'string') continue; 
            if (all_caps.find(it=> it.name == cap_name)) continue;
            all_caps.push({
                is_global : this.__adding_global_caps,
                name : cap_name, //name of the capability
                roles : [],       //list of roles the capability is tied to
                accounts : [],   //array of account ids to register this capability to
            })
        }
    }
    /**
     * Add a capability to a role
     * @param {Object} options {role : String name of capability, cap : capability string name, account: <optional></optional>id or adds }
     */
    async add_capability_to_role(options){
        if ( ! options) return false; 
        if ( ! options.cap || ! options.role ) return false; 

        //Find the capability that was previously registered
        //it = { is_global, name, roles, account}
        var cap_name = options.cap;
        var it = (await this._get_capabilities()).find(it => it.name == cap_name)
        if ( ! it ) return false; 

        var role = options.role
        if ( typeof role == 'string') {
            role = options.role.toLowerCase().trim()
            var ret = await db.query(`SELECT id FROM ${db.name}.roles WHERE ${db.like('title',role)}`);
            if ( ret.length == 0) return false; 
            role = ret[0].id ; 
        }
        //Associate the role to the capability
        if ( !it.roles.includes(role )){
            it.roles.push( role  );
        }
     
        //Optionally, if account is specified, add the account ids to the capability also
        if ( options.account ) {
            it.accounts.push ( ... options.account );
        }
    }
    /**
     * Determine if a specified role can perform the associated action named in
     * options.cap;  We use role (integer) as each, within roles table, is tied to an account id
     * @param {Object} options { role : Array of role names or ids (preferred), cap : capability name }
     * @returns { Boolean} 
     */
    async can_role (options){
        if ( ! options ) return false; 

        var cap_name    = options.cap; 
        if ( !cap_name) {  
            return false; 
        }
        cap_name = cap_name.toLowerCase()

        var cap         = (await this._get_capabilities()).find(it=> it.name == cap_name); 
        if (! cap)      {
             
            return false;// { is_global, name, roles, accounts }
        }
        var role_list = options.role;
        if ( ! role_list ) role_list = []
        if ( !Array.isArray(role_list))    role_list = [ role_list ]

        var lkupid = [];
        for(var i=0; i < role_list.length; i++){//translate name to role id
            role_name  = role_list[i]
            if ( isNaN(role_name)) lkupid.push(role_name);
        }
        if ( lkupid.length>0){
            lkupid = await db.query(`SELECT id FROM ${db.name}.roles WHERE ${db.like('title',lkupid)}`)
            lkupid.forEach( R => role_list.push(R.id ));
        }
        


        var at_least_one = false, role_name 
        for(var i=0; i < role_list.length; i++){
            role_name  = role_list[i]
            if ( ! role_name ) continue; 
            if ( role_name.toLowerCase ) role_name = role_name.toLowerCase()
            if ( cap.roles.includes(role_name)) {
                at_least_one = true; 
            }
            if ( at_least_one) {   
                return true;
            }
        } 
        return  false 
    }
    /**
     * Note - every user has the ability to read_post.  
     * @param {Object} options {user_id, cap}
     * @returns {Boolean}
     */
    async can_user(options){
        if ( ! options ) return false; 
        var user_id = options.user||options.user_id; 
        if ( ! user_id || ! options.cap ) { 
            return false; 
        }
        //Get the users list of approved roles
        var tb_user_roles = `${db.name}.user_roles`;
        var expr = ` ${db.is('user_id', user_id)} and status='approved'`
        var t1 =  `${db.name}.roles`;
        var sql     = `SELECT role_id, (SELECT title FROM ${t1} WHERE id=UR.role_id) as name FROM ${tb_user_roles} UR WHERE ${expr }`
        var ret     = await db.query(sql); 
        var roles   = ret.map(it => it.name );   //Array of role names
        
        if ( roles.length == 0) {
            //Everyone has the ability to read posts
            if ( options.cap == 'read_post') return true; 
        }
         
        //Determine of that role has the queried capability
        return await this.can_role({ role : roles, cap : options.cap })
    }
    /**
     * Get all capabilities the role is in
     * @param {Object} options { role : Role ID number or role name }
     * @returns {Array} Array of string capabilities
     */
    async get_role_capabilities (options){
        if ( ! options ) return []; 

        var caps = [];  //The output to return

        var role_id = options.role
        //Using the options.role(id number) and title for the role and store in var
        if ( isNaN(options.role)) { 
            var tb_roles = `${db.name}.roles`;
            var sql = `SELECT id FROM ${tb_roles} WHERE ${db.is('id', options.role)}`
            var acc_ret = await db.query(sql) 
            if ( acc_ret.length==0) return [] 
            role_id = acc_ret[0].id;
        }else {
            role_id = JSON.parse(role_id )
        }
  
        var all_caps = await this._get_capabilities()

        // Loop each capability
        var it=null;//{ is_global, name, roles : Array role names, account}
        for(var i=0; i< all_caps.length; i++){ 
            it = all_caps[i];
            //if the capability is global or if the account type matches, 
            if (  (it.roles && it.roles.includes(role_id))  ){
                caps.push( it.name )//add to output if role name also matches
            }
        }

        return caps
    }

    
    /**
     * {DocString get properties of a file.  Essentially checks whether or not a file or directory exists.  Returns an object.  For errors , check if errno key exist.}
     * @param {String} fullpath 
     * @returns {dev,mode,nlink,gid,rdev,blksize,ino,size,blocks:atimeMs,mtimeMs,ctimeMs,birthtimeMs,atime,mtime,ctime}
     or { errno: negative, code:'ENOENT', path, syscall}
     */
    async get_file_stat(fullpath){
        if ( !fullpath)return false;
        // {dev,mode,nlink,gid,rdev,blksize,ino,size,blocks:atimeMs,mtimeMs,ctimeMs,birthtimeMs,atime,mtime,ctime}
        // or { errno: negative, code:'ENOENT', path, syscall}
        try{ 
            var ret= await fs.stat(fullpath); 
            return ret;
        }catch(e){
            core.error("get_file_stat error " + e.message, e)
            return e;
        }
    }
    async rename_file(old_path, new_path){ 
        return await fs.rename(old_path, new_path )
    }
    async remove_file(path){
        return await fs.unlink(path);
    }
    async is_directory(fullpath ){
        var stat = await this.get_file_stat(fullpath);
        if (stat.errno) {  
            //stat = { errno, code, syscall, path} 
            return false;
        }
        return true;
    }
    /**
     * Retrieve the file contents for the file path provided
     * @param {String} fullpath absolute path to the file to be read
     * @returns { String } Content of the file
     */
    async get_file_content(fullpath){
            return new Promise( (resolve,reject)=>{
                try {
                    let output = ""
                    const reader = createReadStream(fullpath, { encoding:"utf8", })
                    //listening to reading
                    reader.on("data", (data) => { 
                        output += data  
                    }); 
                    //listen for reading completion
                    reader.on("end", () => { 
                        resolve(output); 
                    }); 
                    //listen to errors
                    reader.on("error", (error)=>{ 
                        throw Error(  "Stream read error",   error.message  ); 
                    });  

                }catch(error){
                    reject(error )
                }
            })
        
 
    }
    /**
     * Create or update the content of the named file path
     * @param {String} fullpath absolute system path
     * @param {String} content New content for the file
     */
    async set_file_content ( fullpath , content ){
        console.log (content,  fullpath, "Set File Contents ")

        return new Promise( (resolve,reject)=>{
    
            fs.writeFile( fullpath, content , (err) => { 
                if(err) { 
                    reject(err )
                    return 
                }
                    
                resolve(true )
                core.log("Updated file", fullpath)
            }); 
        })
    }
    async create_directory(fullpath){
        return await fs.mkdir(fullpath, { recursive: true })
    }
    throw ( msg) {
        throw new Error(msg )
    }
    /**
     * Return complete all files contained within a directory
     * @param {String} relative_dir_path the name of folder (ie "site-plugins") or multple folders seperated by "/" (ie "jxtpress/native-blocks")
     * @returns {Array } {path:includes extension,name:includes ext, is_file,is_directory,inode, size, is_socket}
     */
    async get_dir_files(relative_dir_path){
        // {step validate that input path does exist and does not start with forward slash}
        if ( !relative_dir_path) this.throw("Directory not provided");
        if (relative_dir_path.startsWith("/")) this.throw("Director must not start with \"/\"");
        var root = this.get_server_root()
        var seperator = "/";
        if ( root.endsWith("/") || relative_dir_path.startsWith("/"))seperator="";
        var fullpath = root +seperator+ relative_dir_path;

        // {step check that folder exist}
        var stat = await this.get_file_stat(fullpath);
        if (stat.errno) {  
            console.error("get_dir_files", "cannot find", fullpath)
            //stat = { errno, code, syscall, path} 
            return null;
        }
        
        // {step grab the complete path name of each file in the folder}
        var files = await fs.readdir(fullpath);
        var out = [];
        for(var i=0; i < files.length; i++){
            seperator = "/";
            if (  relative_dir_path.endsWith("/") || files[i].startsWith("/"))seperator="";

            var subpath = `${root}/${relative_dir_path}${seperator}`
            var path = `${subpath}${files[i]}`
            var index =files[i].lastIndexOf(".");
            var ext = "UNK";
            
            var name = path.replace(subpath,''); 
            var url =  path.replace(root ,'') 
            if ( url.startsWith("/public/"))url = url.replace("/public",'')
            if ( url.startsWith("/private/"))url = url.replace("/private",'')
            var index_of_period = name.lastIndexOf(".");
            if ( index_of_period != -1){
                ext = name.substring(index_of_period+1)
            }

            var stat = await this.get_file_stat(path)
            out.push({
                path ,is_file : stat.isFile() , is_directory : stat.isDirectory(),url, 
                is_socket :stat.isSocket(), inode : stat.ino,ext, name, size : stat.size, mimetype : stat.mimetype ,
                accessed : stat.atimeMs, modified : stat.mtimeMs, created: stat.birthtimeMs
            })
        }
        return out ; 
    }
    /**
     * Create a Token representation of the object payload provided
     * @param {Object} payload object to be signed
     * @returns {String|Null}
     */
    jwt_create(payload){
        if  ( typeof payload != 'object')return null
        let token = jsonwebtoken.sign(payload, this.env.JWT_SECRET);
        return token;
    }
    jwt_verify(token){
        if (! token) return null; 
        const payload = jsonwebtoken.verify(token, this.env.JWT_SECRET);
        return payload
    }

    async verify_user(event){
        var cookies = event.jxtpress.cookies //|| await parseCookies(event);
        var headers = event.jxtpress.headers //await getHeaders(event)
        if (! cookies ) {
          core.error("verify_user - cookies are null");
          return null; 
        }
 
        var token = cookies['jxt-token'] || headers['jxt-token']// getHeaders(event)['jxt-token'] ;
        if ( !token || token == 'null') { 
              return null;  
        } 
        var user_obj = await this.users.verify(token )  
        if ( ! user_obj ) console.lg ("__;", token )
        return user_obj
    }

    /**
     * Register a Vue component 
     * @param {Function } component_function A function that defines and returns the component
     */
    register_component (  component_function) {
       
        if ( typeof component_function != 'function') throw new Error ("Register component requires  component definition be housed within a function")
        let comp_obj = component_function(); 
        let name = comp_obj.name
        if ( ! name ) throw new Error ("Unable to register component without a name");
        this._components.push({
            name,  fn : component_function.toString() 
        })
    }
    /**
     * Remove a component from registration list
     * @param {String} name name of component to unregister
     */
    unregister_component(name){
        if ( ! name ) return null ; 
        if ( ! this_components ) return null; 
        var i = 0; 
        for ( i=0; i < this._components.length; i ++){
            //Remove it
            if ( this._components[i].name == name ) {
                this._components.splice(i,1);
                break; 
            }
        }
    }
    /**
     * 
     * @returns {Array} Array of { name, fn }
     */
    get_components(){
        return this._components.map(comp => ({ ... comp }) )
    }

    register_block(blockClass, options = {}){
        if ( ! blockClass) return null; 
        let is_class = (v) =>  typeof v === 'function' && /^\s*class\s+/.test(v.toString());
        if ( ! is_class(blockClass) ) {
            console.log ("register_block Failed to register block as it is not a class");
            return ; 
        } 
        var reg_block = {
            name        : blockClass.name ,
            is_inspector: blockClass.name.toLowerCase().startsWith("inspector"),
            Class       : blockClass.toString(),
            priority    : 10,
            native      : false,
            status      : "active",
            _reference   : blockClass 
        }
        if ( options.plugin_id ) reg_block.plugin_id = options.plugin_id;
        if ( options.priority ) reg_block.priority = options.priority
        if ( !this.__is_ready) reg_block.native = true;
  
        this._blocks.push( reg_block )
    }
    /**
     * Update Block.
     * @param {Object} block { name, status, priority, code, role }
     */
    update_block(block){
        if ( !block) return false;
        if ( ! block.name ) return false; 
        var current = this._blocks.find(it => it.name == block.name);
        if ( !current) return false; 
        Object.keys(block).forEach(field=> current[field] = block[field]) 
        current.status = "active"  

        return true
    }
    remove_block(block_name){ 
        if ( !block_name) return false; 
        var current = this._blocks.find(it => it.name == block_name);
        if ( !current) return false; 
        current.status = "delete"  
    }

    /**
     * {DocString Get all block class Definitions that have been registered on the site }
     * @param {Object} options {user_id, type}
     * @returns {Array} When type(block name) is provided, then an Block Class is returned to user
     */
    async get_blocks(options) {
        var out = []; 
        var it = null, can_modify_posts

        //for each post type, filter out active and if provided post types that are restricted by user type
        for(var i =0; i < this._blocks.length; i++){ 
            it = this._blocks[i];
            //skip inactive roles
            if ( options && options.status && options.status == 'all') { //do nothing
            }else { 
                if ( options && options.status  ){ 
                    if ( options.status != it.status) continue;
                }else { 
                    if( it.status != "active")    continue;  
                }
            }
            
            //if user_id is provided, match user the user has role
            if ( options && options.user_id  ) { 
                var cap = it.capability|| it.cap || "modify_post"
                var can_modify_posts = await this.can_user({user_id : options.user_id, cap}); 
                if ( options.user_id && ! can_modify_posts) continue; 
            }

            if ( options.type != undefined && options.type.toLowerCase() == it.name.toLowerCase()){
               return it._reference; //THe none string version of the Block that awas registered
            }
            out.push( it )
        }
        if ( options.type != undefined){ //if user wanted a specific block type and we are at this point, then return null
            return null; 
        }
        out = out.sort((a,b)=>{
            var A = a.priority || 0
            var B = b.priority || 0
            return A - B
        })
        /** {plugin Site post types are about to be retrieved.  Data passed in the set of post types that match the caller's requirements} */
        return await plugin.run_filter('get_blocks', out);
    }








 
    /**
     * Register Post Types.
     * @param {Object} post_type { name, title , title_plural, description, priority, include_admin_menu, role, capability: the permission level for who can view and create this post type within the admin pages }
     */
    register_post_type(post_type) {
        if ( !post_type) return false;
        if ( ! post_type.name ) return false; 
        var current = this._post_types.find(it => it.name == post_type.name);
        if ( current ) {
            this.update_post_type(post_type)
            return true; 
        }
        post_type.priority = post_type.priority||0
        post_type.status = "active"  

        if ( !this.__is_ready){
            post_type.native = true;
        }
        /*if ( post_type.show_admin){

            var native = ['post','page','media'].includes(post_type.name);

            var url = native ? "/user/"+post_type.name : `/user/post-type?type=${post_type.name}`
            this.register_menu_link({
                name : post_type.name, title : post_type.title, parent : post_type.parent_link || null, 
                role : post_type.role, priority :post_type.priority || 25 , 
                icon : post_type.icon || post_type.image , is_post_type : true, 
                url 
            })
        } */
        //Register the post type
        this._post_types.push(post_type);  
    }
    /**
     * Register Post Types.
     * @param {Object} post_type { name, title , title_plural, description, priority, show_admin, role }
     */
    update_post_type(post_type){
        if ( !post_type) return false;
        if ( ! post_type.name ) return false; 
        var current = this.get_post_types().find(it => it.name == post_type.name);
        if ( !current) return false; 
        Object.keys(post_type).forEach(field=> current[field] = post_type[field]) 
        current.status = "active"  

        return true
    }
    remove_post_type(post_type_name){ 
        if ( !post_type_name) return false; 
        var current = this.get_post_types().find(it => it.name == post_type_name);
        if ( !current) return false; 
        current.status = "delete"  
    }
    _clean(){
        for (var i=this._menu_links.length-1; i>-1; i--){
            if ( !this._menu_links[i].native){
                this._menu_links.splice(i,1); 
            }
        }
        
        for (var i=this._post_types.length-1; i>-1; i--){
            if ( !this._post_types[i].native){
                this._post_types.splice(i,1);
            }
        }
        for (var i=this._blocks.length-1; i>-1; i--){
            if ( !this._blocks[i].native){
                this._blocks.splice(i,1);
            }
        }

    }
    
    /**
     * {DocString Get all post types that exists on site }$
     * @param {Object} options {user_id}
     * @returns {Array} Array of { name, title, title_plural, descripton, priority:Integer, 
     *              capability: String, status: String, icon: String, native:Boolean,  }
     */
    async get_post_types(options) {
        var out = []; 
        var it = null

        //Get all custom post types from the DB and store it into cpt array
        var $tbopt = `${db.name}.options`
        var cpts = [];
        var prefix = `posttype_`
        var arr_opts = await db.query(`SELECT name, value FROM ${$tbopt} WHERE ${db.like('name', prefix+'%')}`);
        var opt, cust_type, prop, cust_name, datatype
        for(var i=0; i < arr_opts.length; i++){//loop the array option { name , value}
            opt = arr_opts[i];
            try { opt.value = JSON.parse(opt.value) }catch(e){ opt.value= [] }
            if ( ! Array.isArray(opt.value )) continue;

            datatype = this.get_type_specifier(opt.name) ;
            cust_name = opt.name.substring(prefix.length); 

            var idx = cust_name.indexOf( datatype ) ;
            if ( idx != -1)  cust_name = cust_name.substring(0, idx - 1) 
            
            //New CPT being created
            cust_type = { name : cust_name, is_custom : true, native : false   }
            for ( var j=0; j < opt.value.length; j++){
                prop = opt.value[j]; 
                if ( ! prop.name ) continue; 
                if ( prop.name =='name') continue; 
                cust_type[prop.name] = await this.type_cast(prop.value )
            } 
            if ( !cust_type.icon ) {
                cust_type.icon = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                    </svg>
                `.trim()
            }

            cpts.push( cust_type )
        }
        
        
        var arr = [ ... this._post_types, ... cpts ]
        //for each post type, filter out active and if provided post types that are restricted by user type
        for(var i =0; i < arr.length; i++){ 
            it = arr [i];
            //skip inactive roles
            if ( options && options.status && options.status == 'all') {
                //do nothing
            }else { 
                if ( options && options.status  ){ 
                    if ( options.status != it.status) continue;
                }else { 
                    if( it.status != "active") {  
                        if ( it.is_custom ) console.log(it.name, "not active")
                        continue;  
                    }
                }
            }
            //if user_id is provided, match user the user has role
            if ( options ) { 
                var can_do = await this.can_user({user_id : options.user_id, cap: it.capability});  
                if ( options.user_id && ! can_do) { 
                    continue;  
                }
            }
            out.push( it ) 
        }
        out = out.sort((a,b)=>{
            var A = a.priority||0
            var B = b.priority||0
            return A - B
        })
        /** {plugin Site post types are about to be retrieved.  Data passed in the set of post types that match the caller's requirements} */
        return await plugin.run_filter('get_post_types', out);
    }

    /**
     * Return all Post types that are marked native
     * @param {Object} options { user_id } 
     * @returns 
     */
    async get_custom_post_types(options){
        var posttypes = await this.get_post_types(options);
        return posttypes.filter ( pt => ! pt.native )
    }
    /**
     * {DocString Register an Admin Menu Link }
     * @param {Object} menu_link Link to register { name,title, url, parent, icon, role, priority, badge }
     * @returns {Boolean}
     */
    register_menu_link(menu_link){
        if ( !menu_link) return false;
        if ( ! menu_link.name ) return false; 
        var current = this._menu_links.find(it => it.name == menu_link.name);
        if ( current ) {
            this.update_menu_link(menu_link)
            return true; 
        }
        if ( menu_link.badge == undefined) menu_link.badge = null; 
        menu_link.priority = menu_link.priority||0
        menu_link.status = "active"  
        if ( !this.__is_ready){
            menu_link.native = true;
        }else{

            console.log ("<<<<<<<<<<<<<<<<<<>> NONE Native ", menu_link.name, menu_link.title)
        }
        //Register the post type
        this._menu_links.push(menu_link); 
    }
    /**
     * Register Post Types.
     * @param {Object} menu_link { name, title , priority, show_admin, role, badge }
     */
    update_menu_link(menu_link){
        if ( !menu_link) return false;
        if ( ! menu_link.name ) return false; 
        var current = this._menu_links.find(it => it.name == menu_link.name);
        if ( !current) return false; 
        Object.keys(menu_link).forEach(field=> current[field] = menu_link[field]) 
        current.status = "active"  

        return true
    }

    remove_menu_link(name){ 
        if ( !name) return false; 
        var current = this._menu_links.find(it => it.name == name);
        if ( !current) return false; 
        current.status = "delete"  
    }
    /**
     * {DocString All all active menu strings}
     * @param {Object} options ordered Array of { name, title, is_custom, url, parent, capability, priority,icon,is_current,badge,status }
     * @returns 
     */
    async get_menu_links(options={}){
        var out = []; 
        var ordered = true;
        if ( options.ordered != undefined) ordered = options.ordered
        var it = null, can_do_it

        //for each menu item, filter out active and if provided menu items that are restricted by user type
        for(var i =0; i < this._menu_links.length; i++){ 
            if ( typeof  this._menu_links[i] == 'function') continue; 

            it = JSON.parse( JSON.stringify( this._menu_links[i]));
            if ( options.current_page == it.url ){
               it.is_current = true;
            }else {
                it.is_current = false; 
            }
            //skip inactive roles
            if ( options && options.status && options.status == 'all') {
                //do nothing
            }else { 
                if ( options && options.status  ){ 
                    if ( options.status != it.status) continue;
                }else { 
                    if( it.status != "active")    continue;  
                }
            }
            //if user_id is provided, match user the user has role
            if ( options ) { 
                var cap = it.capability||it.cap|| "manage_account";
                var can_do_it = await this.can_user({user_id : options.user_id, cap }); 
                if ( options.user_id && ! can_do_it) continue; 
            }
            out.push( it )
        }

        var posttypes = await this.get_post_types(options )
        



        for(var i=0; i < posttypes.length; i++){
            if ( typeof posttypes[i] == 'function')continue; 
            
            it = JSON.parse(JSON.stringify( posttypes[i]) );
            it.title = it.title_plural || it.title
            if ( options && options.status =='all'){
            }else {
                if ( options.status ) 
                    if ( options.status != it.status ) {console.log("x0012ll", it.name);continue; }
                else {
                   if (  options.status != 'active'  ){console.log("x00882ll", it.name);continue; }
                }
                
            } 
            if ( it.show_admin){ 
                if ( options && it.capability ) {  
                    var user_can = await this.can_user({ user_id : options.user_id, cap: it.capability }) 
                    if ( options.user_id && ! user_can) {  
                        continue; 
                    }
                }
                it.url = `/user/posts/${it.name}`
                out.push( it )    
            } 
        }
        out = out.sort((a,b)=>{
            var A = a.priority||0
            var B = b.priority||0
            return A - B
        })

        //{step add each menu item into root vs children depending on if it has a parent or not}
        var root = [] , children = []
        for(var i = 0 ; i< out.length; i++){
            if ( out[i].parent ) {
                children.push(out[i])
            }else {
                root.push(out[i])
            }
        }
        // {step re-intergrade menu items such that children are immediately next to their parents }
        var final_out = [], it_root,it_child;

        if ( ordered ){ 
            for(var i =0; i < root.length; i++){
                it_root = root[i];
                final_out.push(it_root);

                for (var j=0; j < children.length; j++){
                    it_child = children[j];
                    if ( it_root.name == it_child.parent ){
                        final_out.push(it_child); 
                        continue; 
                    }
                }
            }
        }else {
            final_out = out; 
        }
        /** {plugin Site post types are about to be retrieved.  Data passed in the set of post types that match the caller's requirements} */
        return await plugin.run_filter('get_menu_links', final_out);
 
    }
    /**
     * Get an option value
     * @param {Object} options {name, value : Default value to give(null), flat: Boolean }
     * @returns {Object}
     */
    async get_option(options){
        if ( ! options) return null; 
        
        var name = options.name; 
        if ( typeof options == 'string') name = options;
        if ( ! name ) return null; 
        var default_value = options.value || null; 

        //Get the Option using the name and 
        var sql = `SELECT * FROM ${db.name}.options WHERE ${db.like('name', name)} `; 
       
        var ret = await db.query(sql);
        var opt = ret[0] || { name, value : default_value } ; 
        if ( typeof opt.value == "string"){
            if (opt.value.charAt(0)== '[' || opt.value.charAt(0)== '{'){
                try{
                    opt.value = JSON.parse(opt.value);
                }catch(e){ }
            }
        }
        /* {plugin Get a website or account specific option } */
        var out =  await plugin.run_filter('get_option',opt);
        
        if ( out ) {
            out.value = await this.type_cast(  out.value , opt.name && opt.name.endsWith('_secret'))
            if ( options.flat ){ 
                out = out.value ;
            }
        } 
        return out; 
    }

    /**
     * Return multiple options at once.  By default, all are returned.
     * @param {Object} options {optional:[ like : when name  like]}
     * @returns {Array}
     */
    async get_options(options){
        if ( ! options) return null; 

        //Get the Option using the name and 
        var cond_str = []
        if ( options.name_like || options.like){
            var val =  options.name_like || options.like 
            if ( Array.isArray(val)){
                cond_str.push(db.like('name', val))
            }else { 
                cond_str.push(`name LIKE "%${ db.esc(val,true) }%"`)
            }
        }
        if ( options.name ) {//match exact name or names
            var val = options.name 
            if ( Array.isArray(val )) {
                var t = [];
                for ( var i=0; i < val.length; i++){
                    t.push ( `name LIKE ${db.esc(val[i])}`)
                }
                cond_str.push(` (${t.join(' OR ')}) `)
            }else {
                cond_str.push(`name LIKE ${db.esc(val)}`)
            }
        }

        if ( cond_str.length==0){
            cond_str = '1';
        }else {
            cond_str = cond_str.join("AND")
        }

        
        var sql = `SELECT * FROM ${db.name}.options WHERE ` +
                  ` ${cond_str}`; 

        var ret = await db.query(sql); 
        for( var i =0; i <ret.length;i++){
            ret[i].value = await this.type_cast(ret[i].value, ret[i].name && ret[i].name.endsWith('_secret'))
        }
        /* {plugin Get a website or account specific option } */
        var out =  await plugin.run_filter('get_options',ret);

        return out; 
    }



    /**
     * Perform an Update
     * @param {Object} options An object { name, value} or an array of objects to update
     */
    async update_option(options){
   
 
        var names = [], arr_opts;
        if ( !Array.isArray(options)){
            names = [options.name]
            arr_opts = [options ]
        }else {
            names = options.map(opt => opt.name)
            arr_opts = options
        }

        var sql = `SELECT id, name FROM ${db.name}.options WHERE ${db.like('name', names)} `; 
         
        var ret = await db.query(sql);
        //Copy over id into this property
        for( var j=0; j< arr_opts.length; j++){ 
            for ( var m=0; m < ret.length; m++){
                if ( arr_opts[j].name == ret[m].name) {
                    arr_opts[j].id = ret[m].id;
                }
            }
        } 
        
        /* {plugin Create or update an individual or set of options } */
        options = await plugin.run_filter( 'update_option', arr_opts )
        await db.update ( 'options', arr_opts )
        return options
    }


    /**
     * Remove an option value
     * @param {Object} options {name, :null default }
     * @returns {Object}
     */
    async remove_option(options){
        if ( ! options) return null; 
        var name = options.name; 
        if ( ! name ) return null; 
        var default_value = options.value || null; 

        //Get the Option using the name and 

        var sql = `DELETE FROM ${db.name}.options WHERE ` +
                  `${db.like('name', name)} `; 
       
         await db.query(sql);
 
        /* {plugin Get a website or account specific option } */
        var out =  await plugin.run_filter('remove_option',options);
        return out; 
    }



    /**
     * Return multiple tags at once.  
     * @param { Object } options { title, id ,parent_id  }
     * @returns { Array }
     */
    async get_categories(options){
        if ( ! options) return null; 
        
        var where = [];
        if ( options.title )        where.push(db.like('title', options.title ))
        if ( options.id )           where.push(db.is('id', options.id ))
        if ( options.slug )         where.push(db.is('slug', options.slug ))
        if ( options.parent_id )    where.push(db.is('parent_id', options.parent_id ))
        if ( options.created_by )   where.push(db.is('created_by', options.created_by ))
        if ( where.length==0)       where.push ( " 1 ");

        var tb_categories   = `${db.name}.categories`
        var tb_posts        = `${db.name}.posts`
        var sql             = `SELECT *, (SELECT COUNT(*) FROM ${tb_posts} WHERE category_id=T.id) ` + 
                              ` as count FROM ${tb_categories} T WHERE ${where.join("AND")}`; 

        var ret = await db.query(sql);  

        /* {plugin Get website categories } */
        var out =  await plugin.run_filter('get_categories',ret); 
        return out; 
    }


    /**
     * Return multiple tags at once.  
     * @param { Object } options { title, id   }
     * @returns { Array }
     */
    async get_tags(options){
        if ( ! options) return null; 
        
        var where = [];
        if ( options.title )    where.push(db.like('title', options.title ))
        if ( options.id )    where.push(db.is('id', options.id ))
        if ( where.length==0) where.push ( " 1 ");

        var tb_tags = `${db.name}.tags`
        var tb_posttags = `${db.name}.post_tags`
        var sql = `SELECT *, (SELECT COUNT(*) FROM ${tb_posttags} WHERE tag_id=T.id) as count FROM ${tb_tags} T WHERE ${where.join("AND")}`; 

        var ret = await db.query(sql);  

        /* {plugin Get website tags } */
        var out =  await plugin.run_filter('get_tags',ret); 
        return out; 
    }
    /**
     * Delete a tag by it's id
     * @param {Object} options { id } 
     */
    async remove_tag ( options){
        if ( ! options ) return false;
        var where = [];
        if ( options.id ) where.push( db.is('id', options.id ))
        if ( where.length == 0 ) return null; 
        var tb_tags = `${db.name}.tags`
        var tb_posttags = `${db.name}.post_tags`

        var where_expr = ` ${where.join("AND")} `
        var sql = `DELETE FROM ${tb_posttags} WHERE tag_id IN (SELECT id FROM ${tb_tags} WHERE ${where_expr} );\n`;
        sql += `DELETE FROM ${tb_tags} WHERE ${where_expr};`
        
        await db.query(sql) 
    }
    /**
     * Tag fields
     * @param {Object} tag {  . . .}
     * @returns 
     */
    async update_tag(tag ){
        return await db.update('tags', tag);
    }

    /**
     * Modify the value for a category
     * @param {Object} category Category
     * @returns 
     */
    async update_categories(category ){
        return await db.update('categories', category);
    }

    /**
     * Delete a tag by it's id
     * @param {Object} options { id } 
     */
    async remove_category ( options){
        if ( ! options ) return false;
        var where = [];
        if ( options.id ) where.push( db.is('id', options.id ))
        if ( where.length == 0 ) return null; 


        var tb_categories   = `${db.name}.categories`
        var where_expr      = ` ${where.join("AND")} `
        var sql = `DELETE FROM ${tb_categories} WHERE ${where_expr};`
        await db.query(sql) 
    }


    /**
     * Perform remote HTTP Request 
     * @param {Object} options { url, method, data, config }
     * @returns { Object } { headers, d }
     */
    async fetch (options ){
        if ( ! options ) return null; 
        //var base_url    = options.base_url || undefined;
        //var headers     = options.headers || {  } 
        //let oapi  = axios.create({ baseUrl: base_url, headers  });

        var url     = options.url ; 
        if ( ! url ) return { headers : null, d : null }
        var method  = options.method || "get";
        var data    = options.data || null 
        var config  = options.config || {}
        method      = method.toLowerCase()
        let res     = null;
        try{ 
            if ( method=='get' )    res = await axios.get(url, config )
            if ( method=='post' )   res = await axios.post(url, data , config  )
            if ( method=='put' )    res = await axios.put(url, data , config )
            if ( method=='delete' ) res = await axios.delete(url, data , config )

            return {
                headers : res.headers ,
                d : res.data 
            }
        }catch(e){
            this.error("core.fetch error " + e.message, e )
            throw e 
        }
    }


    /**
     * Given a block id and an array or object for a block(s), recursively search to locate the block instance that is specified
     * in the argument
     * @param {Object} options {block_id, blocks }
     */
    async get_block_instance  (options){
        var block_id = options.block_id ; 
        var blocks = options.blocks ;
        if ( ! blocks || ! block_id ) {  
            return null; 
        }

        var arr = Array.isArray ? blocks : [ blocks ];
        var target_block = null, it = null; 
        for ( var i=0; i < arr.length; i++){
            it = arr[i]; 
            if ( it == null) continue; 
            if ( it.id == block_id ) {
                target_block = it;
                break;
            } 
            if ( it.children && it.children.length > 0 ){
                var ret = await this.get_block_instance ({ block_id , blocks : it.children })
                if ( ret ) return ret; 
            }
        }

        return target_block;
    }



    /**
     * Given a post id(representing housing the form block) and the block instance id of a form block, retrieve all fields that exists within the post and the form block specified
     * @param {Object} options { form_id : target form, post_id : post holding the form, blocks : optional - an array of blocks to search form_id }
     * @returns {Object} an object where each key is the name of the field pointing to object { field_id, field_name, type, is_required, validation }
     */
    async get_form_fields  ( options ){
        if ( ! options ) return null; 
        //see if blocks was passed in by default
        var blocks = options.blocks; 

        //If not passed in as array, see if a post-id was supplied for use to search for the block
        if ( ! blocks ) {
            var post_id = options.post_id ; 
            var post    = await this.pages.get_post({ id : post_id})
            if ( ! post ) return null; 
            if ( !post.value || (post.value && post.value.length==0))return null
            blocks = post.value; 
        }
        
        var fields = {}
        var form_id = options.form_id ; 
        //Get all fields that are specifically part of the block
        var form_instance_data =  await this.get_block_instance({ block_id : form_id , blocks   }) 
        if ( ! form_instance_data ) return null

        

        /**
         * Loop all the blocks recursively to locate all form fields
         * @param {Array|Object} arr An array of block instance data or a block instance data
         * @returns 
         */
        var get_fields = async (arr)=>{
            if ( ! arr ) return; 
            arr = Array.isArray(arr) ? arr : [ arr ]
            if ( arr.length==0) return; 
            var it = null, field_name  , it_type;
            for(var i=0; i < arr.length; i++){
                it = arr[i];
                it_type = it.type.toLowerCase()
                if (it_type != 'formfield') { 
                    if ( it_type == 'form'){ 
                        fields.__meta = {

                            block_id : it.id, 
                            ... it.data 
                        } 
                    }
                    if ( Array.isArray(it.children)) await get_fields(it.children) 
                } 
            
                if (!it.data) continue; 
                field_name = it.data.field_name;
                if ( ! field_name ) continue ;
                fields[ field_name ] = {
                    field_name  ,
                    field_id    : it.id, 
                    type        : it.data.field_type ,
                    is_required : it.data.is_required,
                    validation  : it.data.validation,
                    values      : it.data.values ,
                    label       : it.data.label 
                }
                if ( Array.isArray(it.children)) await get_fields(it.children) 
            }
        }
        await get_fields( form_instance_data   )

        
        return fields 
    }


    /**
     * Recursively get all block types that match the specified block type as a black array
     * @param {Object} options { block_type : block type to search, blocks :Required - the array of blocks to search within }
     * @returns {Array} An array of block that are of the same type within "options.blocks"
     */
    async get_block_instance_types  ( options ) {
        var block_type  = options.block_type ||options.type ; 
        var blocks      = options.blocks;  
        var out         = []
        
        if ( !blocks  ) return out; 
        blocks = Array.isArray(blocks) ? blocks : [blocks ]
        if ( !block_type ) return out;
        block_type = block_type.toLowerCase()
        
        /**
         * Loop all the blocks recursively to locate all form fields
         * @param {Array|Object} arr An array of block instance data or a block instance data
         * @returns 
         */
        var search = async (arr)=>{
            if ( ! arr ) return; 
            arr = Array.isArray(arr) ? arr : [ arr ]
            if ( arr.length==0) return; 
            var it = null, type_name  
            for(var i=0; i < arr.length; i++){
                it = arr[i];
                if ( Array.isArray(it.children)) await search(it.children)  
                if (it.type.toLowerCase() != block_type) continue;   
                
                out.push( it ) ;
            }
        } 
        await search( blocks   ) 
        return out  
    }

    async get_group(options){
        var tb_group  =`${db.name}.groups`;
        var where = [];
        if ( options.id ) where.push(`${db.is('id', options.id)}`)
        var title = options.title || options.name ;
        if ( title ) where.push(`${db.like('title', title )}`)
        
        var ret = await db.query(`SELECT * FROM ${tb_group} WHERE ${where.join(' OR ')}`)
        return ret; 
    }


         
    /**
     * Perform a recursive call to resolve the value of the string expression with the context of the data passed.
     * @param {String} expr An expression to resolve
     * @param {Object} data That to use while resolving the expression
     * @param {Object} options { original - initial express passed on first call,} 
     * @returns {mixed} The value
     */
    async get_resolve (expr, data, options = {}) {
            try{
                if ( options.original   ===undefined) options.original = expr
                var this_debug = false; 
                
                var ret_error = (x)=>{
                    if (options.tagless ) return "[empty]"
                    return x
                }
                let re_fn_args = /([\w.]+)\s*\(\s*([\w.$;& ,]+)\)/gm;   //used to check for " fn_name ( some.arg.value )"
                var has_function = re_fn_args.exec(  expr );
                if ( has_function ){
                    var fn_name = has_function[1]
                    var fn_arg  = has_function[2];
                    if ( ! fn_name || ! fn_arg ) return ret_error ( `<span>Fn Expr Error - ${expr}</span>` )
                    fn_name = fn_name.trim() ;
                    fn_arg = fn_arg.trim().split(/,/gm);
                    for(var i=fn_arg.length-1; i > -1; i--){
                        if ( ! fn_arg[i] ) fn_arg.splice(i,1);
                    } 
                    if ( fn_arg.length ==0) return "";
                    for(var i=0; i < fn_arg.length; i++){
                        fn_arg[i] = fn_arg[i].trim()
                        if ( !isNaN(fn_arg[i])) fn_arg[i] = parseFloat(fn_arg[i])
                    }
                
                    var expr_val = await this.get_resolve( fn_arg[0], data );
                    fn_arg[0] = expr_val 
                    var expr_val_type = typeof expr_val;
                    //At this point, fn_args[0] - evaluated value, 1 ... n  
                    try{ 
                        var months = ['January','February','March', 'April',
                                      'May','June','July','August','September',
                                      'October','November','December']
                        let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
                        switch(fn_name){
                            case 'substring':
                                if (expr_val_type == 'string'){ 
                                    var i0 = parseInt(fn_arg[1])
                                    var i1 = parseInt(fn_arg[2]);
                                    return expr_val.substring(i0, i1)
                                } else  return ret_error ("<empty class='substring'></empty>")
                            case 'capitalize': 
                                if ( expr_val_type == 'string') return this.capitalize(expr_val);
                                else return expr_val 
                            case 'to_upper_case':
                            case 'uppercase':
                                if ( expr_val_type == 'string') return expr_val.toUpperCase();
                                else return expr_val 
                            case 'to_lower_case':
                            case 'lowercase':
                                    if ( expr_val_type == 'string') return expr_val.toLowerCase();
                                    else return expr_val 
                            case 'length':
                                if ( expr_val_type=='string' && Array.isArray(expr_val) ) return expr_val.length;
                                else return 0
                            case 'date':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){
                                    return `${months[dt.getMonth()]} ${dt.getDate() }, ${dt.getFullYear()}`
                                }else  return dt; 
                            case 'date_year':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){
                                    return dt.getFullYear()
                                }else  return dt; 
                            case 'date_month':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){
                                    return months[dt.getMonth()]
                                }else  return dt;
                            case 'date_date':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){
                                    return dt.getDate()
                                }else  return dt;
                            case 'date_day':
                                    var dt = fn_arg[0];
                                    if (dt instanceof Date){
                                        return days[dt.getDay()]
                                    }else  return dt;
                            case 'hour':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){ 
                                    var hh = dt.getHours(), mm = dt.getMinutes(), am_pm ='AM'
                                    if ( hh > 11){
                                        am_pm = 'PM';
                                        hh =  hh - 12;
                                    }
                                    return `${hh}:${mm} ${am_pm}`
                                }else  return dt;  
                            case 'hour_am_pm':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){ 
                                    var hh = dt.getHours(), am_pm ='AM'
                                    if ( hh > 11)   am_pm = 'PM'; 
                                    return am_pm
                                }else  return dt;  
                            case 'hour_hours':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){ 
                                    var hh = dt.getHours() 
                                    if ( hh > 11){ 
                                        hh =  hh - 12;
                                    }
                                    return hh
                                }else  return dt; 
                            case 'hour_minutes':
                                var dt = fn_arg[0];
                                if (dt instanceof Date){ 
                                    var mm = dt.getMinutes()
                                    return mm
                                }else  return dt;

                            default: //catch all branch; ideally, fn_name should be 'plugin_name.function_name'.  If so it will be call any registered filter hooks
                                /** {plugin Run an exported function.  Format is:  'plugin_name.function_name'.  Within plugins, export using 'export:function_name' } */
                                fn_arg = await plugin.run_filter(fn_name,  fn_arg )
                                return fn_arg  
                        }
                    }catch( i001) { throw new Error("during interprettable function \"<b>"+fn_name+"\"</b - >" + i001.message)}
                    return expr_val
                }

                var kr = `expr="${options.original}"`
 

                if ( ! expr ) return ret_error( `<i class="null-expression" ${kr}>null</i>` ); 
                if ( data === null || data === undefined) return `<i class="null-data" ${kr}>null</i>`
                expr = expr.replaceAll(/&nbsp;/gm,' ')
                var parts = expr.split(/\./gm);
                if ( parts.length == 0) return ret_error( `<i class="no-tokens" ${kr}>null</i>` ); 

                //Get the first two keys we are working with & then remove them from list
                var key0 = parts[0];
                var key1 = parts[1];
                if ( key0 ) key0 = key0.trim();
                if ( key1 ) key1 = key1.trim()  
                for ( var i=0; i < 2; i++) parts.splice(0,1); 
                if ( key0 == undefined ) return ret_error( `<i class="font-extrabold color-indigo-600 undefined"  ${kr}>null</i>` ); 

                // Get the first value
                var dot0 = data[ key0 ];//one first pass of "post.created", key0=post, and dot0 is post object 
                if ( dot0 === null ) return  ret_error( `<i class="color-red-500 first-value-null" ${kr}>null</i>` )
                //----------------------------------------------------------------------
                // Special Keys - OPTIONS
                // Check if dot0 is site keyword, if so solve in this branch and return
                //-----------------------------------------------------------------------
               
                if(dot0 === undefined && key0 == 'site' ) { 
 
                    var val; 
                    if ( key1 == 'site_title'|| key1=='title'){
                        val = await this.get_option({ name : "site_title" })
                        if ( val) return val.value
                        return null ; 
                    }else {
                        if ( ! data.post || (data.post && !data.post.user_is_admin)){
                            return ret_error("--restricted-variable")
                        }else {
                            val = await this.get_option({name : key1});
                            if ( val ) return val.value; 
                            return null; 
                        }
                    } 
                }
    
                //example: post.metas.some_key =>  [ <objects>,<objects>,...] key0=some_key
                if ( Array.isArray(data) ) {
                    var key_to_search = key1 || key0;   //note: key1 will typically be undefined
                    var it = null, output = undefined; 
                    //Check if objects, and try to match the name { id, name, value, ...}
                    for ( var j=0; j < data.length; j++){
                        it = data[j];
                        if ( typeof it == 'object'){ 
                            if ( it.name == key_to_search) { 
                                output = it;
                                break; 
                            }else if ( it.id == key_to_search ){ 
                                output = it;
                                break; 
                            } 
                        } 
                    }
                    //if nothing is found yet, perhaps key_to_search is an index: post.metas.34
                    if ( output === undefined ) {
                        try { key_to_search=JSON.parse(key_to_search); }catch(e){}
                        output = dot0[key_to_search ]
                    }
                    //if output was an object(ie {id,name,value}), by default return .value else whole object
                    if ( typeof output == 'object'){
                        output = output.value || output 
                    }
                    
                    //NOTE: key1 - at this stage should be undefined
                    // so if it is not undefined and output is an object, continue to search
                    if ( key1 !== undefined && typeof output == 'object'){
                        return this.get_resolve(parts.join("."), output, options )
                    }
                    return output;
                }
                //Check if dot0 points to nothing
                if (dot0 === undefined) { 
                    return ret_error( `*<i class="color-red-500"  ${kr}>*${key0}</i>*` )
                }
            
                //See if dot0 is a number, string, or boolean, if so return it
                var type_d0 = typeof dot0;
                var scalar_types = ['number','string','boolean']
                if ( scalar_types.includes(type_d0)) {
                    return dot0;
                }
                //At this point we expect dot0 to be an object, if not print error
                if ( type_d0 != 'object')return ret_error( `<i class="color-red-500 unexpected"  ${kr}>unexpected</i>` )
                if ( ! key1 ) return ret_error( `<i class="invalid-secondary color-gray-500"  ${kr}>invalid ${key1}</i>` )

                var dot1 = dot0[key1];
                if ( dot1 === null) return null 
                var type_d1 = typeof dot1;  //key1 should be "created", if original express was "post.created"
                
                if ( dot1 instanceof Date ){ 
                    return dot1 //return the date object itself
                } else if ( scalar_types.includes(type_d1)) return dot1 ;

                //are there tokens remaining
                if ( parts.length > 0){
                    return this.get_resolve(parts.join("."), dot1, options)
                }else { 
                    return ret_error( `<i class="color-red-600 not-found"  ${kr}>${key0}.${key1}</i> ` )
                }
            }catch(xie){ this.throw('(From core.get_resolve '+xie.message+')')}
    }//END of get

    /**
     * Handy for each loop that allows for promises
     * @param {Array} arr  
     * @param { Function } iteration_fn Function that accepts each item within arr
     */
    async for_each( arr, iteration_fn){
        if ( ! Array.isArray(arr)) return ;
        var item = null; 
        var promises = [],pending 
        for( var i=0; i < arr.length;i++){
            item = arr[i]; //the eration item
            ((it, index)=>{
                pending = iteration_fn(it, index )
                promises.push( pending )
            })(item, i )
        }
        await Promise.all( promises )
    }

        /**
     * Convert stripe meta properties from { key :value } to Array of Object { name, value }
     * @param {Object} metadata Stripe meta properties
     * @returns {Array} Array of { name, value }
     */
    to_metas (metadata){
            if ( ! metadata) return  []
            var keys = Object.keys(metadata);
            var out = [] 
            for (var i=0; i < keys.length; i++){
                out.push ({
                    name :  keys[i],
                    value : metadata[keys[i]]
                })
            }
            return out  ; 
    }
    /**
     * 
     * @param {Array} arr_of_meta_data Array of { name, value } to Object { name0 : value0, name1 : value1 }
     */
    to_object(arr_of_meta_data){
        if ( ! arr_of_meta_data ) return null; 
        var out = {}, it 
        for ( var i=0; i < arr_of_meta_data.length; i++){
            it = arr_of_meta_data[i];
            out[it.name] = it.value 
        }
        return out 
    }
    /**
     * 
     * @param {Number} num 
     * @param {Number } places 
     * @returns 
     */
    round (num, places=2){
        return parseFloat( parseFloat(num).toFixed(places))
    }


    /**
     * Simplies and centralize the handling of a route in which the user does not have adequate permission for.
     * @param {HTTP Event} event The HTTP Event being handled
     * @param {Object} options Data response to return back to user
     * @returns {Object} "redirect" field will be set to enable front end to force redirect
     */
    async res_denied(event, options={}){
        options.redirect=options.redirect || "/login"
        options.d = null; 
        setResponseStatus(event, 302)
        return options 
    }
    /**
     * Automatically set response status to request error prior to sending server response to user.
     * @param {HTTP Event} event H3 HTTP Event
     * @param {Object} options { msg  ,d }
     * @returns {Object} the options passed in
     */
    async res_error(event, options={}){ 
        setResponseStatus(event, 400)
        return options 
    }
    /**
     * For any number less than 10, prefix a 0 before it
     * @param {Number} value a number to padd with zero
     * @returns {String} String number with 1 zero prefixed to it
     */
    lz (value){
        return String(value).padStart(2,0)
    }

    /**
    * Add a certain amount of minutes to a date object
    * @param {Date} date JS Date object
    * @param {Number} minutes Number of minutes (positive or negative) to add to date
    * @returns {Date}
    */
    add_minutes(date, minutes){
        if ( ! date ) throw new Error("A Date object is expected")
        if ( ! date.getTime) throw new Error ("Date instance required")
        return new Date(date.getTime() + minutes*60000);
    }

    get_minute_diff(start,end){
        if ( ! start || ! end ) return 0 
        if ( !start.getTime || ! end.getTime ) throw new Error("Expected start and end time to be date objects")

        var diff_ms = end.getTime() - start.getTime(); // This will give difference in milliseconds
        var diff_min = Math.round(diff_ms * ms_to_min);
        return diff_min
    }
    /**
     * Given a string in either text format, numeric timestamp, or a Date object return
     * it's eqivalent value as a MYSQL formated date 
     * @param {String|Number|Date} input Convert any valid date representation (string, timestamp value, or date object) into a MYSQL understandable date string
     * @returns {String} The MYSQL date representation
     */
    date_to_mysql ( input ){
        if ( ! input ) return null 
        let dt = null; 
        if ( input.getHours ) dt = input
        else if (this.is_numeric(input)) { 
            dt = new Date( Number.parseInt(input) ) 
        }else if ( typeof input == 'string') dt = new Date(input)
        else throw new Error("unable to interpret the date value of <"+input +">")

        
        var dt_time = dt.getTime()
        if(isNaN( dt_time )) { 
            throw new Error("Invalid date produced for input - " + input)
        }
        
        let mm = this.lz(dt.getMonth()+1)
        let dd = this.lz(dt.getDate())
        let yy = this.lz(dt.getFullYear())

        let HH = this.lz(dt.getHours())
        let MM = this.lz(dt.getMinutes())

        return `${yy}-${mm}-${dd} ${HH}:${MM}`
    }

    /**
     * Generate all instance between start[0] and start[1] for the provided post 
     * @param {Object} options { post : Object to source instances from , start :Array of period to bound occurrrences for }
     * @returns {Array } Objects
     */
    async generate_occurrences( options ) {
        
 
        let { datetime, RRule, RRuleSet, rrulestr } = rrule 

        //Guard
        var out =  [] 
        if ( ! options ) return out ; 
        let { post , start } = options  
        
        if ( ! Array.isArray(start)) throw new Error ('Generate occurrences expects array indicating start and end period' )
        if ( ! post) throw new Error('Unable to generate occurrences for null event source')
        if ( ! post.aux || (post.aux && !post.aux.toLowerCase )) return out 
        
        var post_rrule_str = post.aux.toLowerCase()
        if (! post_rrule_str.startsWith('freq')) return out 
  

        var Start=``;
        if ( post.start ) { 
            let t = typeof post.start == 'string' ?  new Date(post.start) :  post.start   
            var m= this.lz(t.getMonth()+1)
            var y= this.lz(t.getFullYear())
            var d= this.lz(t.getDate())
            var HH=this.lz(t.getHours())
            var MM=this.lz(t.getMinutes())

            let d0 = `${y}${m}${d}T${HH}${MM}00Z`
            Start=`DTSTART:${d0}`.trim()
        }
        var Expr =post_rrule_str.toUpperCase().trim()
        
        var index = Expr.lastIndexOf(';');
        if ( index == Expr.length-1)Expr = Expr.substring(0,Expr.length-1)

        var full_expr = `${Start}\nRRULE:${Expr}`.trim() 

        let rule = null; 
        try { 
            rule = RRule.fromString(full_expr)
            //var rule_in_english = rule.toText();
        }catch(e){
            throw new Error('Rule Instantion error ' + e.message + ' during {'+full_expr+'}') 
        }

 
        //console.log ("Generate patterns for me please", rule.toText() ) 
        if ( ! start[0] || !start[1]) throw new Error("Either start or end date span is null during generate occurrences")

        let date_instances = rule.between(this.type_date(start[0]), this.type_date(start[1]) ), d_inst =null, d_inst_id
        let inst_event = null, end_date 

        var src_metas = post.metas || null
        if ( ! src_metas ) {
            src_metas = await this.pages.get_metas({ post_id  : post.id })
        }
        let copy_metas = ()=>{
            var cpm = []
            if (!src_metas) return cpm 
            if ( src_metas.length == 0) return cpm 
            for(var i=0;i < src_metas.length; i++){
                cpm.push ({
                    name : src_metas[i].name ,
                    value : src_metas[i].value 
                })
            }
            return cpm
        }
        for ( var i =0;  i < date_instances.length; i ++){
            d_inst = date_instances[i]  //Is an Array of date instances 
            d_inst_id = 'occurrence:'+post.id +':'+  d_inst.toISOString(); 
            end_date =null; 
            if ( post.end ) { 
                end_date = this.add_minutes(
                    d_inst,  this.get_minute_diff(post.start,post.end)
                ) 
            }
            inst_event = {
                ... post,  
                //Override these
                parent_id : post.id ,   
                start : d_inst, //the start date
                end : end_date, //the end date,
                value : d_inst_id,
                metas : copy_metas(),
                aux : null  ,
                is_occurrence : true
            }
            //Delete these data point to avoid confusion when this instance is
            //eventually saved
            delete inst_event.id;  
            delete inst_event.created 
            delete inst_event.updated 
            delete inst_event.published
            delete inst_event.modified
            out.push(inst_event)
            
        }//End of rrule list of dates
        
        return out
    }

    create_RRule (expr) {

    }
    /**
     * Returns object representing safe (non-sensitive) information about the site
     */
    async get_site_info(){
        var out = {}
        /**
         * Specific an array option names to retrieve from the database.  Can be useful to add/remove options before 
         * database query is ran.
         */
        var options_to_return = await plugin.run_filter("before_get_site_info",["site_title"]) 
        /**
         * Add or remove site options to invoker
         */
        var rets =  await plugin.run_filter ("get_site_info", await this.get_options({
            like :options_to_return
        }))
        if ( ! rets) rets = [];

        var opt; 
        for ( var i=0; i < rets.length; i++){
            opt = rets[i]; 
            out[ opt.name ] = opt.value 
        }
 
        return out 
    }
}

let core = new Core()

export default core 