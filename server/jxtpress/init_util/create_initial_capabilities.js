export default  async (db, core) => {
 
    await core.create_capability([
        'manage_account',
        'manage_user',
        'manage_groups',
        'manage_roles',
        'manage_store',
        'manage_notes',
        'manage_users',
        'upload_media',
        'read_post',
        'delete_post',
        'modify_post',
        'manage_plugin',
        'manage_tags_categories'
    ])
    //Associate roles with specific actions
    core.add_capability_to_role({ role : "admin", cap: "manage_account"})
    core.add_capability_to_role({ role : "admin", cap: "manage_groups"})
    core.add_capability_to_role({ role : "admin", cap: "manage_roles"})
    core.add_capability_to_role({ role : "admin", cap: "manage_store"})
    core.add_capability_to_role({ role : "admin", cap: "manage_users"})
    core.add_capability_to_role({ role : "admin", cap: "read_post"})
    core.add_capability_to_role({ role : "admin", cap: "delete_post"})
    core.add_capability_to_role({ role : "admin", cap: "modify_post"})
    core.add_capability_to_role({ role : "admin", cap: "upload_media"})
    core.add_capability_to_role({ role : "admin", cap: "manage_plugin"}) 
    core.add_capability_to_role({ role : "admin", cap: "manage_tags_categories"}) 
     
    core.add_capability_to_role({ role : "user", cap: "read_post"})
     
    core.__adding_global_caps = false; 
}
