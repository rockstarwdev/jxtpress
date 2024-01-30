export default  (core) => {

    core.register_menu_link({ 
        name: "dashboard", title : "Dashboard" , url : "/user",  parent : null, 
        icon : null, capability : "read_post", priority : 0, icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
      `
    }) 

    core.register_menu_link({
      name : "site_settings_general", title : "Settings", url : "/user/site/settings", parent : "site_settings", 
      icon: null, capability : "manage_account", priority : 12, badge: 0
    })

    core.register_menu_link({
      name : "site_settings_options", title : "Options", url : "/user/site/options", parent : "site_settings", 
      icon: null, capability : "manage_account", priority : 12, badge: 0
    })
    core.register_menu_link({
        name : "site_settings_categories", title : "Tags & Categories", url : "/user/site/tags-categories", parent : "site_settings", 
        icon: null, capability : "manage_account", priority : 12, 
    })
    core.register_menu_link({
        name : "site_settings_roles", title : "Users & Roles", url : "/user/site/users-roles", parent : "site_settings", 
        icon: null, capability : "manage_account", priority : 12, badge: 5
    })
    core.register_menu_link({
        name : "site_settings", title : "Site Settings", url : "/user/site", parent : null, 
        icon: null, capability : "manage_account", priority : 20, icon : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
      `
    }) 
    core.register_menu_link({
        name : "site_plugins", title : "Plugins", url : "/user/plugins", parent : null, 
        capability : "manage_account", priority : 10, icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
      `
    })


    core.register_menu_link({
      name : "user_profile", title : "Profile", url : "/user/profile", parent : null, 
      icon: null, capability : "read_post", priority : 20, icon : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
    `
  }) 


  core.register_menu_link({
    name : "user_schedule", title : "Schedule", url : "/user/schedule", parent : null, 
    icon: null, capability : "manage_account", priority : 20, icon : 
    `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
</svg>

  `
}) 
}
