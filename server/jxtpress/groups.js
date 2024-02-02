import core from "./core"
import db from "./db"
import plugin from "./plugin"
import users from "./users"



class Groups {

    async _init (options){

    }
    /**
     * Given a user id, return all Groups that match
     * @param {Object} options {user_id - approved member , id - group}
     * @returns Array of Groups
     */
    async get(options){
        if ( ! options) return []; 
        var tb_groups = `${db.name}.groups`
        var tb_members = `${db.name}.group_members`
        var where = [];
    
        var sql_else = ``;
        if (options.id != undefined) where.push(db.is( "id", options.id )) 
        if (options.user_id != undefined) { //select all groups the user is approved for
            let user_status = db.esc( options.user_status || "approved" )
            where.push(
            `id IN (SELECT group_id FROM ${tb_members} WHERE user_id=${db.esc(options.user_id)} AND status=${user_status})`
            )

            sql_else =` OR (${db.is('created_by',options.user_id)} AND (id NOT IN (SELECT group_id FROM ${tb_members} WHERE ${db.is('user_id', options.user_id)} AND status LIKE 'denied') ))`
        } 
        if ( options.title ){
            where.push(db.is("title",options.title ))
        }
    
        if ( where.length ==0) return []

        var sql = `SELECT * , `+ 
        `(SELECT Count(id) FROM ${tb_members} WHERE group_id=T.id AND status LIKE "approved") as members ` + 
        ` FROM ${tb_groups} T WHERE (${where.join(" AND ")}) ${sql_else}`
        var ret = await db.query(sql);

        return ret 
    }
    async get_all_groups(){

        var tb_groups = `${db.name}.groups`
        return await db.query(`SELECT * FROM ${tb_groups} WHERE 1`)
    }
    /**
     * Given a group_id, return all members of the group
     * @param {Object} options {group_id}
     * @returns Array of users
     */
    async get_members(options) {
        if ( ! options) return []; 
        var tb_groups = `${db.name}.groups`
        var tb_members = `${db.name}.group_members`
        var tb_users = `${db.name}.users`
        var where = [];
    
 
        if (options.group_id != undefined) where.push(
            `id IN (SELECT user_id FROM ${tb_members} WHERE ${db.is('group_id',options.group_id)})` ) 


        if ( where.length ==0) return []

        var sql = `SELECT id, name, parent_id,title, status, ` +
        
        ` FROM ${tb_users} WHERE ${where.join(" AND ")} `
        var ret = await db.query(sql);
        console.log ("GET USERS", ret)
        return ret 
    }
    /**
     * Determine whether a given user_id is part of a given group_id 
     * @param {Object} options { group_id, user_id, status:<optional | "approved">}
     * @returns Boolean true if there is a matching records
     */
    async is_member(options ){
        if ( ! options) return []; 
        var tb_groups = `${db.name}.groups`
        var tb_members = `${db.name}.group_members`
        var tb_users = `${db.name}.users`
        var where = [];
    
        var user_id = options.user_id || null; 
        var group_id = options.group_id || null; 
        if ( ! user_id ) return false; 
        if ( group_id == null) return true; //group_id = public group
        
        var status = options.status || "approved"
        var ret = await db.query(`SELECT id FROM ${tb_members} WHERE`+
            ` ${db.is('group_id',group_id)} AND ${db.is('user_id', user_id)} AND ${db.is('status',status)} `)

        return ret.length > 0 
    }

    async modify_group (options){
        var auto_enrol_self = false;
        var user_id;
        if (  options.id == null || options.id == -1) {
            if (options.created_by){
                user_id = options.created_by
                auto_enrol_self = true; 
            }
        }
        var ret= await db.update(`groups`, options);
        if ( auto_enrol_self && user_id){
            if ( ret.id ) {
                this.modify_member({ user_id, group_id : ret.id , status :"approved", type : "admin"})
            }
        }
        return ret;
    }
    async modify_member (options){
        return await db.update(`group_members`, options);
    }
    

    /**
     * Given a user_id and group_id, remove the user from the group
     * @param {Object} options { group_id, user_id } 
     */
    async remove_member(options ){
        if ( ! options) return []; 
        var tb_groups = `${db.name}.groups`
        var tb_members = `${db.name}.group_members`
        var tb_users = `${db.name}.users`
        var where = [];
    
        var user_id = options.user_id || null; 
        var group_id = options.group_id || null; 
        if ( ! user_id ) return false; 
        if ( group_id == null) return; //group_id = public group
        

        var ret = await db.query(`DELETE FROM ${tb_members} WHERE ${db.is('group_id',group_id)} AND ${db.is('user_id', user_id)}   `)
        return ret.length > 0 
    }

    /**
     * Given a group_remove the group and all members
     * @param {Object} options { group_id|id } 
     */
    async remove_group(options ){
        if ( ! options)         return false; 
        var tb_groups   = `${db.name}.groups`
        var tb_members  = `${db.name}.group_members`
 
        var group_id = options.group_id || options.id || null;   
        if ( group_id == null)  return false; //group_id = public group
        
        await db.query(`DELETE FROM ${tb_members} WHERE ${db.is('group_id',group_id)} `)
        await db.query(`DELETE FROM ${tb_groups } WHERE ${db.is('id',group_id)} `)
        return true 
    }
}
let groups = new Groups()
export default groups 