import mysql from 'mysql2';
import plugin from './plugin'
import core from './core'
import tables from "./db_tables"

class DB {
    name = ""
    _is_connected = false; 
    _pool = null
    promised_pool = null;

    connect (options) {
        // {step check if we need to immediately exit }
        var errors = [];
        if(!options) throw new Error("Options is null")
        if ( !options.host) errors.push("Host not provided")
        if ( !options.user) errors.push("User not provided")
        if ( !options.db_name) errors.push("DB Name not provided")
        if ( !options.password) errors.push("Password not provided");
        if ( errors.length>0){
            throw new Error (errors.join(";"));
        }
        this.name = options.db_name 
        try{ 
            // {step create pool of connections }
            this._pool = mysql.createPool({
                host: options.host,
                user: options.user, 
                password: options.password,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0, 
                //timezone:           "UTC", //utc is "invalid"
                dateStrings:        ["DATE", "DATETIME"], 
                multipleStatements: true
            })
            this._is_connected= true; 
        }catch(e){
            throw e
        } 
        // {step create a promised version of _pool }
        this.promised_pool = this._pool.promise()
    }
    santize(str){
        if ( ! str ) return str; 
        var t = typeof str 
        if ( ['boolean','number','object'].includes(t)) return str 
        //replace anything that is NOT in the bracket
        var re = /[^#\sA-Za-z0-9'-\/]/g;
        return str.replace(re,'');
    }
    esc(val, no_quotes=false) { 
        if(val == 'now()' || val == 'NOW()' || val == 'NOW'||val == 'now' ) return 'NOW()'
        var out = mysql.escape(val)
        if (no_quotes && typeof val == 'string'){
            out = out.substring(0,out.length-1).substring(1)
        }
        return out;
    }

    
    is(column_name, val, negate=false){
        if ((negate== "like" ||negate== "like-array") && Array.isArray(val) ){
            var arr = [];
            val.forEach( it => arr.push (`${column_name} LIKE ${this.esc(it)}` )  )
            return `(${arr.join(' OR ')})`
        }
        var operator="="
        var is_array = false; 
        if ( val == undefined) val = null; 
        if ( val == null) {
            operator = negate ? "IS NOT" : "IS"
        }
        if ( typeof val == 'string'){
            operator = negate ? "NOT LIKE" : "LIKE";
        }
        is_array = Array.isArray(val); 
        if ( is_array ){
            operator = negate ? "NOT IN" : "IN"
        }
        var esc_val = is_array ? `(${this.esc(val)})`:  this.esc(val); 
        return `${column_name} ${operator} ${esc_val }`
    }

    like(column_name, val ){
        if (Array.isArray(val) ){
            var arr = [];
            val.forEach( it => arr.push (`${column_name} LIKE ${this.esc(it)}` )  )

            if ( arr.length == 0) return ' (1) '
            return `(${arr.join(' OR ')})`
        }
  
        return `${column_name} LIKE ${this.esc(val) }`
    }

    arr(vals ){
        if (Array.isArray(vals) ){
            var arr = [];
            for ( var i=0; i < vals.length ; i++ ){
                arr.push (  this.esc(vals[i]) )
            }
            return ` ( ${arr.join(',')} ) `
        } else return " ('empty') " 
    }
    between_date ( column_name, arr_dates){ 
        if ( !arr_dates) throw new Error("Invalid date span")
        if ( !Array.isArray(arr_dates)) throw new Error("Invalid span type")
        if ( arr_dates.length < 2) throw new Error ("2 or more dates is required")

        var span = [ core.date_to_mysql(arr_dates[0]), core.date_to_mysql(arr_dates[1])]
        return ` (${column_name} >= '${span[0]}' AND ${column_name} <= '${span[1]}') `
    }
    /**
     * Use this utility function to add time base SQL conditions to variable "where" based on a target key ("tkey") found in the "options" parameter.
     * If the key does not exist, function exist.  Otherwise, based on the value in the key being an array or not, appropriate sql is generated and
     * added to "where" variable.
     * @param {String} tkey a key that exists within options - ie created, modified, encounter,start,end, etc
     * @param {Object} options an object with various key properties
     * @param {*} where an arrary holding the list of conditions for selecting database records 
     */
    add_temporal_condition = ( tkey, options, where )=>{
        if ( ! options[tkey]) return ;  
        if ( Array.isArray(options[tkey])){
            var tmp = options[tkey] ;
            if ( tmp.length >= 2){  
                where.push(`(${db.between_date(tkey, tmp )})`)
            }else {
                where.push(db.is(tkey,tmp[0]))
            }
        }else {
            where.push(db.is(tkey,options[tkey]))
        } 
    } 

    is_connected() { return this._is_connected }

    /**
     * Perform a database query
     * @param {String} sql The SQL command to execute
     * @param {Object} options Additional options to consider while executing the SQL
     * @returns {Array|Object}
     */
    async query(sql, options = {}){
        if ( this._table_not_setup ){
            core.log ( "FLAG<TABLE_NOT_SETUP> is true. Existing db.query call. Make call to \"/api/site/config/install to clear\"" );
            return null;
        }
        if ( !this.is_connected()) throw new Error("DQ.query: database is not connected")
        try{  
            //Returns: ResultSetHeader for anything but SELECT query
            //fields = Of { name, columnLength, columnType:Num, type:Num, flag, decimals, encoding }
            var [results, fields ] = await this.promised_pool.query(sql);
            if ( options.sql || options.show_sql) core.log("db.query", sql);

            var run_filter = true;
            if (options.run_filter != undefined) run_filter = options.run_filter
            if ( run_filter ){ 
                return await plugin.run_filter(  "query",results,  )
            }else {
                return results;
            }
        }catch(e){
            var msg = `"${e.sqlMessage}"\n==>"${e.sql}" code "${e.code}"\n` 
                + `Stack: ` +(new Error().stack);

            core.error (msg , e )
            throw e  
        }
    }
    /**
     * Given a desired page number and number of items to display on each page, return an SQL sniplet that can allow use to limit our
     * result set.  Use this SQL sniplet with the main SQL Query.  To geet the total amount of pages, invoke @pagination seperately
     * @param {Object} options { p : Page number, limit : items per page}
     * @returns {String} SQL fragment 
     */
    async page_limit(options) {
        if ( ! options ) return " " 
        options.p = JSON.parse (options.p || options.page || 1) 
        if ( ! options.limit ) {
            options.limit = await core.get_option({ name : "pagination_limit", flat: true })

        }
        options.limit       = JSON.parse (options.limit )
        
        var offset      = (options.p - 1) * options.limit
        return  ` LIMIT ${offset}, ${options.limit} ` //SQL Fragment
    }
    /**
     * Given the table and the where clause, return a count of the number of pages there are.  
     * @param {String} tb Name of table.  If not preceed with database name, database name will be auto set.  Include 
     * @param {String} where SQL where clause for counting the desired pages
     * @param {Number} limit Integer representing number of items within each page
     * @returns {Number} Total number of pages
     */
    async _page_total(tb,where, limit, table_alias="T") {
        if (typeof tb != 'string') return 0;
        if ( !where) return 0
        if (! tb.includes('.')) tb = this.name + "." + tb;
        let sql = `SELECT count(id) as num_rows FROM ${tb} ${table_alias} WHERE ${where}`
 
        limit = limit || await core.get_option({ name : "pagination_limit", flat: true })
        let rows = await this.query(sql, { ignore_pagination : true });
       
        var pages = rows[0].num_rows / limit
        if ( pages % 1 ) pages += 1; //if has decimals add 1 page
 
        return Number.parseInt  ( pages )
    }
    /**
     * With the provided Array or Object representing a MySQL query result set, set the pagination data within the first result.
     * This is useful for when when returning pagination to frontend.
     * @param {Array|Object} result_set The result MySQL Query Row
     * @param {Object} options { table , where : where expression, limit : number items per page, p : optional current page, table_alias : String ("T")}
     * @returns {result_set}
     */
    async pagination(result_set, options){
        if ( ! result_set) return result_set;

        var first_item = Array.isArray(result_set) ? result_set[0] : result_set;  
        if ( ! first_item ) return result_set; 

  

        var where_expr = options.where;
        var tb = options.tb || options.table 
        
        var limit = JSON.parse( options.limit || await core.get_option({ name : "pagination_limit", flat: true })  )
        
        if ( !where_expr) {
            return result_set
        }
        if ( !tb )  return result_set
        
        var pages =  await db._page_total(tb,where_expr, limit, options.table_alias)  
        
        var p = JSON.parse ( options.p || options.current||options.current_page||options.page || 1); 
        first_item.pagination = { pages, p , limit }
        return result_set
    }
    /**
     * Perform an update and or an insert depending on whether the data (Object or array of Object) each has and id property or note.
     * For updates, the function first check to see if contents of database table differents from the value being presenting for update 
     * and only performs updates for new data columns. If old and new value are the same, update is skipped entirely.  For insert,
     * each data is inserted into the database directly.
     * @param {String} table Table name without prefix
     * @param {Object|Array} data 
     * @param {Object} options 
     * @returns 
     */
    async update (table,data, options={} ){
        if ( !tables[table] ) {
            throw Error(`Table ${table} does not exist in core table list`);
        }

        if ( ! data ) return data;
        if ( data.then ){
             core.log("Update("+table+") received promised instead of data" )
             return null;
        }
        if ( Array.isArray(data) && data.length == 0 ) { 
            console.log ("Cannot save empty array")
            return data;
        }
        var tb = `${this.name}.${table}`
        var d = Array.isArray(data) ? data : [data]; 
 
        var is_metas = table.includes("metas")||table.includes("options")

        //{step seperate data into insert and update groups}
        var d_insert = []
        var d_update = [];
        var ids = [];
        var unique_query = [], Tab = tables[table];
        for(var i=0; i < d.length; i++){
            if (d[i].id === undefined){
                if ( options ){//check if the user only wants unique entries per table per account
                    if ( options.unique && Tab.includes('name')){
                        var has_account = Tab.includes('account_id');
                        unique_query.push(
                            has_account ?
                            `SELECT id FROM ${tb} WHERE name LIKE ${this.esc(d[i].name)} AND ${db.is('account_id',d[i].account_id )}`:
                            `SELECT id FROM ${tb} WHERE name LIKE ${this.esc(d[i].name)} AND ${db.is('account_id',null )}`
                        )
                    }
                }

                d_insert.push(d[i])
            }else {
                ids.push( this.esc( d[i].id));
                d_update.push(JSON.parse(JSON.stringify(d[i] ))) //copy the object so that when we change it later it wont affect caller
            }
        }
        if ( unique_query.length > 0){
            var sql = unique_query.join(";"); 
            var uret = await this.query(sql);
            var override =  true; 
            if ( options.override != undefined) override = options.override;

            for(var j=uret.length-1; j > -1; j--){
                if ( uret[j].length==0) continue; 
                var it = d_insert[j];
                var ut = Array.isArray(uret[j] ) ? uret[j][0] : uret[j];

                it.id = ut.id; //set the id number
                if ( override ) { 
                    d_update.push(it );     //add it to update
                    ids.push(this.esc(it .id))
                }
                d_insert.splice(j,1);           //remove it from insert 
            } 
        }
        var sql; 
        //{ step Do updates; pull down all matching instances, write SQL that only updates new columns }
        if(true){
            var current = [];
            if ( ids.length > 0){ 
                sql=`SELECT * FROM ${tb} WHERE id IN (${ids.join(',')});`
                current = await this.query(sql);
            } 
            sql=``;//reset SQL
            var has_query = false; 
            var set_statements = [];
            var curr, new_val, keys, key;
            for(var i =0; i < current.length; i++){
                curr = current[i];//get each existing record
                for(var j=0; j < d_update.length; j++){ 
                    new_val = d_update[j]; // and its new version 
                    if ( new_val.id == curr.id){  
                        keys = Object.keys(new_val);//
                        set_statements = [];
                        var timebased =['created','updated','start', 'modified']
                        for(var k=0; k < keys.length; k++){ //loop the fields of the new version
                            key = keys[k];                  //and skip keys that arent in the table or is "value"
                            if ( !tables[table].includes(key)) continue; 
                            
                            
                            if ( key == 'id')       continue; 
                            // Compare the hold value to the new value
                            if ( key !='value' && new_val[key] == curr[key]){//if equal then we do not need to change this column

                                delete new_val[key];//drop this key
                            } else {
                                //this column is different or should always be updated
                                var value = new_val[key];

                                if ( timebased.includes(key) ){
                                    if ( typeof value == 'string' && value.includes('T')) continue;
                                }
                                //for meta tables and when we are about to update value,
                                // see if the name of the field ends with secret and if so encrypt before saving
                                if ( is_metas && key == 'value') {
                                    var meta_name = new_val['name'] || curr['name'];
                                    if (meta_name && meta_name.endsWith('_secret')) {
                                        value = core.encrypt(value )
                                    }
                                }

                                if (typeof value =='object' && value != null ){
                                    value = JSON.stringify(value)
                                }
                                set_statements.push(`${key}=${this.esc(value)}`)
                            }
                        }//Done looping the keys
                        if ( set_statements.length > 0){ 
                            has_query = true; 
                            sql += `\nUPDATE ${tb} SET ${set_statements.join(',') } WHERE id=${new_val.id};` 
                        }
                    }//end of this version
                }
            }
            if ( has_query ) {  
                await this.query(sql); 
            }
        }//end updates

        //{step now run the insertion method}
        if ( true ) {
            //We now need to insert new records into the table
            var item,cols,values,keys,key,val;
            sql = "";
            for(var i=0; i < d_insert.length; i++){
                item = d_insert[i];
                cols = [];  values=[]
                keys = Object.keys(item);
                
                for(var j=0; j < keys.length; j++){
                    key = keys[j];
                    if ( ! tables[table].includes(key)) continue;  
                    cols.push( key );
                    val = item[key]; 
                    if ( typeof val =='object'){
                        if ( val != null){ 
                            val = JSON.stringify(val);
                        }
                    } 


                    //for meta tables and when we are about to insert a value,
                    // see if the name of the field ends with secret and if so encrypt before saving
                    if ( is_metas && key == 'value') {
                        var meta_name = item ['name'];
                        if (meta_name && meta_name.endsWith('_secret')) {
                            val = core.encrypt(val )
                        }
                    }

                    values.push(this.esc(val ) )
                } 
                if ( cols.length==0) continue; 
                sql += `INSERT INTO ${tb} (${cols.join(',')}) VALUES (${values.join(',')});\n`
            }
            if ( d_insert.length > 0){ //Only run query if there are something to run
                var ret = await db.query(sql); 
                if ( Array.isArray(ret)){ //ret is an ARRAY of { fieldCount, affectedRows,insertId,info,serverStatus,warningStatus }
                    for(var i =0; i < ret.length; i++){
                        d_insert[i].id = ret[i].insertId;
                        d_insert[i].__is_new = true;
                    } 
                }else {
                    d_insert[0].id = ret.insertId
                } 
            }
        } 
        return data; 
    }
 
    async remove(table, id){
        if ( !tables[table] ) throw Error(`Table ${table} does not exist in core table list`);
        if ( ! id ) return false;
        var tb = `${this.name}.${table}`
        await db.query(`DELETE FROM ${tb} WHERE ${db.is('id', id )}`)
        return true;
    }
}

let db = new DB()

export default db 