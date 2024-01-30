<template>
 <div class="page">
  <h1 class="md:flex flex">Users & Roles</h1>

  <s-table v-model="store.users" base_url="/user/site/users-roles"  :options="tb_users">
    <template #status="{row}">
      <span :class="['tag',row.status]">{{ row.status }}</span>
    </template>
    <template #action="{row}">
      <div>
        <button class="button flat primary" @click="hnd_edit_user(row)">edit</button>
      </div>
    </template>
  </s-table>

  <div class="manage-role-caps mb-5 mt-7">
    <s-button class="primary flat mr-2 inline-flex items-center" @click="hnd_create_role">
      <span class="mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
        stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </span>
      Create Role
    </s-button>
    <s-button class=" flat mr-2 inline-flex items-center" @click="hnd_create_capability">
      <span class="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
        stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
      </svg>  </span>
      Create Capability</s-button>

  </div>

  <s-table v-model="store.roles" :options="tb_roles">
    <template #action="{row}">
      <button class="button flat primary sm" @click="hnd_edit_role(row)">edit</button>
      <button class="button flat red sm" @click="hnd_remove_role(row)">remove</button>
    </template>
  </s-table>


  <div class="modal cap-editor" ref="modal_create_capability">
    <div class="wrapper">
      <div class="title"><h3>Create Capability</h3></div>
      <div class="content">

        <s-input v-model="capability_name"></s-input>
      </div>
      <div class="footer flex justify-end gap-2">
        <button class="modal-cancel" type="button">Cancel</button>
        <button class="modal-ok" type="button">Ok</button>
      </div>
    </div>
  </div>
  <div class="modal role-editor" ref="modal_role">
    <div class="wrapper"> 
        <div class="content md:w-550" v-if="active_role"> 
              <div calss="active-role-edit card">

                <div class="flex justify-between">
                  <h3>Role</h3>
                  <!-- <button type="button" class="button green flat mr-2" @click="hnd_edit_role(null)">
                    <span class="icon"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>
                  </button> -->
                </div>
                <div class="row flex">

                  <div class="w-1/4">
                    <div>Title</div>
                  </div>
                  <div class="w-3/4">
                    <s-input v-model="active_role.title" :title="`Role Id(${active_role.id})`"></s-input>
                  </div>
                </div>
                <div class="row flex">

                  <div class="w-1/4">
                    <div>Description</div>
                  </div>
                  <div class="w-3/4">
                    <s-textarea v-model="active_role.description"></s-textarea>
                  </div>
                </div>
                <div class="row flex">
                  <div class="w-1/4">
                    <div>Capabilities</div>
                  </div>
                  <div class="w-3/4 py-3 flex flex-wrap gap-1" :style="{maxHeight:'250px', overflow: 'auto'}">

                    <span v-for="cap in role_available_caps" @click="hnd_add_cap_to_role(cap, $event)"
                        class="mr-2 tag" :key="cap" 
                        :class="[is_cap_in_role (cap) ?'success' :'', is_cap_tobe_added(cap) ?'add-cap selected':'', is_cap_tobe_removed(cap)?'remove-cap selected': '' ]">
                      {{ cap  }}
                      <span @click="hnd_remove_cap_from_role(cap, $event)"  
                        class="ml-4 inline-block p-1 cursor-pointer button color-white hover:bg-red-500 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>

                      </span>
                    </span>

                  </div>
                </div>
            </div>
        </div>
        <footer class="footer flex justify-end gap-2">
            <button class=" modal-cancel">Cancel</button>
            <button class=" modal-ok success">Save</button>
        </footer>
    </div>
  </div><!--- end of modal for role editor -->
        

  <template v-if="active_user">
    <div class="active-user-edit card">
      <div class="flex justify-between">

        <h3>User</h3>
        <button type="button" class="button green flat mr-2 sm" @click="hnd_edit_user(null)">
          <span class="icon"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>
        </button>
      </div>
      <div class="row flex">
        <div class="w-1/4 p-2">Name</div>
        <div class="w-3/4 p-2"><span class="disable font-extrabold">{{ active_user.name || "Unamed"}}</span> <span><i
              class="ml-2 color-gray-400">{{ active_user.id }}</i></span></div>
      </div>
      <div class="row flex">
        <div class="w-1/4 p-2">Title</div>
        <div class="w-3/4 p-2"><span class="disable">{{ active_user.title || "No display name"}}</span></div>
      </div>
      <div class="row flex">
        <div class="w-1/4 p-2">Email</div>
        <div class="w-3/4 p-2"><span class="disable">{{ active_user.email || "No email"}}</span></div>
      </div>
      <div class="row flex">
        <div class="w-1/4 p-2">Status</div>
        <div class="w-3/4 p-2"><span class="tag"
            :class="active_user.status">{{ active_user.status || "No Status"}}</span></div>
      </div>
      <div class="row flex">
        <div class="w-1/4 p-2">Roles</div>
        <div class="w-3/4 p-2">
          <ul>
            <li class="px-2 py-1">
              <div>
                <button type="button" class="button primary flat" @click="hnd_add_role_to_user">Add</button>
              </div>
            </li>
            <li v-for="(role,ri) in store.user_roles" class="px-2 py-1 row-item" :key="ri+''+role.id">

              <div class="flex gap-2 items-start">
                <div class="w-1/3">
                  <s-select v-model="role.role_id" :values="store.roles" />
                  
                </div>
                <div class="w-1/3">
                  <s-select v-model="role.status" :values="status_types"> </s-select>
                </div>
                <div class="w-1/3 hidden">
                  <button type="button" class="button red flat mr-2"
                    @click="hnd_update_role_assignment('remove', role)">
                    <span class="icon close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                      </svg></span>
                  </button>
                  <button type="button" class="button green flat mr-2" @click="hnd_update_role_assignment('update')">
                    <span class="icon">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>

                    </span>
                  </button>

                </div>
              </div>

            </li>
          </ul>
        </div>
      </div>

      <div class="row flex">
        <div class="w-1/4 p-2">Metas</div>
        <div class="w-3/4 p-2">

          <ul>
            <li>
              <button type="button" class="button primary flat" @click="hnd_add_meta_to_user">Add</button>
            </li>
            <template v-if="!store.user_metas || (store.user_metas && store.user_metas.length==0)">
              <li class="font-italic color-gray-400"><i>No meta properties</i></li>
            </template>
            <li v-for="(m,mi) in store.user_metas" :key="'mi'+mi+m.id" class="flex gap-2 mb-3 row-item">
              <!-- <div class="w-1/4">
                <div>Name</div>
                <s-input v-model="m.name"></s-input>
              </div>
              <div class="w-2/4">
                <div>Value</div>
                <s-textarea v-model="m.value"></s-textarea>
              </div> -->
              <s-meta v-model="store.user_metas[mi]" class="flex-1"></s-meta>
              <div class="w-1/4 hidden">
                <div class="h-7"></div>
                <button type="button" class="button red flat mr-1 danger sm  " :class="[m.delete ? 'bg-red-600':'']" @click="hnd_update_meta('remove', m)">
                  <span class="icon close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg></span>
                </button>
                <button type="button" class="button green success flat mr-1 sm  " @click="hnd_update_meta('update')">
                  <span class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                      stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>

                  </span>
                </button>

              </div>
            </li>
          </ul>

        </div>
      </div>

    </div>

  </template>
</div>
</template>

<script setup>
import util from "~/assets/js/util";
import { useMainStore } from "~/store";
 
 
let store = useMainStore()
let active_user = ref(null);
let active_role = ref(null);


useOnPageReady();
let tb_users = ref({
  columns : [{name: "id"}, {name : "parent"}, {name: "name"}, {name: "title"}, {name: "status"}]
})
let tb_roles = ref({
  columns : [{name: 'id'},{name : 'title', width: ''},
  /*{name :'description'} */]
})
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
definePageMeta({
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    async (to, from)=>{
      var store = useMainStore()
      await store.process_post(to, { native:true })
      store.load_users();
      store.load_roles()
    }
  ]
});
let modal_role = ref(null); 
onMounted(()=>{
  store.load_roles()
})

useHead({
  title: store.rendered_post.title ||"User & Roles" ,
  meta: [
    ... store.rendered_post.meta_seo
  ],
  bodyAttrs: {   },
  script: [  
    ... store.rendered_post.head_scripts
  ],
  link : [
    ... store.rendered_post.links 
  ],
  style : [
    ... store.rendered_post.head_style 
  ]
})

let status_types = ref([
  { title : "Pending", value : 'pending'}, 
  { title : "Approved", value : 'approved'},
  { title : "Denied", value : 'denied'},
  { title : "Inactive", value : 'inactive'},
])
let hnd_edit_user = (user)=>{
  store.user_roles = [] 
  store.user_metas = []
  active_user.value = JSON.parse(JSON.stringify( user))
  if (user == null) return; 
  store.load_user_roles({user_id : user.id })
  store.load_user_metas({user_id : user.id })
}



 let hnd_add_meta_to_user = ()=>{
  if ( !active_user.value) return; 

  store.user_metas.push({ user_id : active_user.value.id, name : "", value : "" })
 }
 let hnd_add_role_to_user = ()=>{
  if ( ! active_user.value) return; 
  store.user_roles.push({ role_id : null, user_id : active_user.value.id, status : null})
 }
 let hnd_update_role_assignment = (action,assigned_role)=>{
  if ( ! active_user.value ) return ;
  
  if  (action =='update'){
    useRequest({url: '/api/users/role-list',method: 'post', body: store.user_roles}).then(async ()=>{
      await store.load_user_roles({user_id : active_user.value.id })
    })
  }else {
    useRequest({url: '/api/users/role-list',method: 'delete', body: assigned_role }).then(async ()=>{
      await store.load_user_roles({user_id : active_user.value.id })
    })
  }
 }

 let hnd_update_meta = (action, meta)=>{
  if ( ! active_user.value ) return ;
  
  if  (action =='update'){
    useRequest({url: '/api/users/metas', method: 'post', body: store.user_metas }).then(async ()=>{
      await store.load_user_metas({user_id : active_user.value.id })
    })
  }else {
    if( ! meta.delete ) {
      meta.delete = true; 
      return; 
    }
    useRequest({url: '/api/users/metas',method: 'delete', body: meta }).then(async ()=>{
      await store.load_user_metas({user_id : active_user.value.id })
    })
  }

 }
 let hnd_create_role = (e)=>{ 
  hnd_edit_role ({ title : "", description : "", caps:  [] })
 }
 /**
  * Array of capability names that exist on the site.
  */
 let role_available_caps = ref(null) 
 /** Cross check if a capability name is found within active role */
 let is_cap_in_role =  computed(()=>{
  return (cap_name)=>{
    if ( ! active_role.value) return false;
 
    return active_role.value.caps.includes(cap_name)
  }
 })

 /** Create a temp holder for cap to add to active role */
 let hold_add_caps = ref ([]);
 /** Create a temp holder for caps to remove from active_role */
 let hold_remove_caps = ref([])

 /**
  * Start editing a capability
  * @param {Object} role role to set as active.  When passed null, we will save previously active role
  */
 let hnd_edit_role = async ( role ) =>{ 
      console.log ("Do edit role", role);
      var previous_role = active_role.value ;
      if ( previous_role){ 
          //Save the old active data
          useRequest({url: '/api/users/roles',method: 'post', body: previous_role }).then(async ()=>{
            store.load_roles()
          });
          
          var role_config = { name : previous_role.title ,
            add_caps : hold_add_caps.value,
            remove_caps : hold_remove_caps.value 
          }

          await useRequest({url: '/api/site/role-caps',method: 'post', body: role_config }) 
          active_role.value = null; 
          hold_add_caps.value = []
          hold_remove_caps.value = []
      }// end of previous_role 

      var res_caps = (await useRequest({ url: "/api/site/capabilities" })).d 
      if ( res_caps ) role_available_caps.value = res_caps.map( it => it.name )


      
      if (role&& role.id ) { //Get the last version of the roles data
        var res = await useRequest({url: "/api/users/roles" });
        if ( res.d ) {
          for ( var i=0;i < res.d.length; i++){
            if ( res.d[i].id == role.id ) {
              role = res.d[i];  break; 
            }
          }
        }
      }

      active_role.value = JSON.parse(JSON.stringify(role)) 

      if (role == null) return; //Exit since  role passed in is null and which triggers save

      //start editing a new active roles
      hold_add_caps.value = []
      hold_remove_caps.value = []
      util.open_modal({id : modal_role.value }).then(res=>{
        if ( res.action != 'ok') { 
          active_role.value = null; 
           return 
        }
        hnd_edit_role ( null);
      })
 }



 let is_cap_tobe_added = computed(()=>{
  return (cap)=>{
    if ( ! active_role.value ) return false; 
    if ( !hold_add_caps.value) return false; 
    return hold_add_caps.value.includes( cap ) 
  }
 })

 let is_cap_tobe_removed = computed(()=>{
  return (cap)=>{
    if ( ! active_role.value ) return false; 
    if ( !hold_remove_caps.value) return false; 
    return hold_remove_caps.value.includes( cap ) 
  }
 })
 let hnd_add_cap_to_role = (cap, event)=>{
    event.stopPropagation()
    var cur_index=-1;
    var cur = hold_add_caps.value.find( (it,index )=> { 
      cur_index = index;
      return it == cap 
    });
    if ( ! cur ) {
      if ( active_role.value.caps.includes(cap)) return; 
      hold_add_caps.value.push( cap );
    }else {
      hold_add_caps.value.splice( cur_index, 1 );
    }
    
    var index=-1;
    var other = hold_remove_caps.value
    for(var i=0; i < other.length; i++){
      if ( other[i] == cap) {
        index=i;
      }
    }
    if ( index != -1 ) other.splice(index, 1);
 }

 let hnd_remove_cap_from_role = (cap, event)=>{
    event.stopPropagation()
    var cur_index=-1
    var cur = hold_remove_caps.value.find( (it,index) =>{ 
      cur_index = index; 
      return  it == cap 
    });
    if ( ! cur )  { 
      if (! active_role.value.caps.includes(cap)) return; 
      hold_remove_caps.value.push( cap );
    }else {
      hold_remove_caps.value.splice(cur_index, 1)
    }
    
    
    var index=-1;
    var other = hold_add_caps.value
    for(var i=0; i < other.length; i++){
      if ( other[i] == cap) {
        index=i;
      }
    }
    if ( index != -1 ) other.splice(index, 1);
 }
 let hnd_remove_role = role =>{

    util.open_modal({
      content : `<div>Are you sure you want to delete Role "${role.title}"?</div>
        <foot class="footer flex justify-end">
          <button class="modal-cancel">Cancel</button>
          <button class="modal-ok danger">Delete</button>
          </foot>
      `
    }).then (res=>{
      if ( res.action != 'ok' ) {  
        return; 
      }
      useRequest({user:'/api/users/roles',method: 'delete', body: role }).
      then(async ()=>{
        store.load_roles()
      });

    })

 }

 let modal_create_capability = ref(null)
 let capability_name = ref("")
let hnd_create_capability = ()=>{
  capability_name.value = ""
  util.open_modal({
      id : modal_create_capability.value 
  }).then( ret =>{
    if ( ret.action != 'ok') return ;

    var name = capability_name.value.toLowerCase().trim().replace(/\s/gm,'_')
    useRequest({url: '/api/site/options', method: 'post', 
      body: {
        name : `capability_${name}_arritem`,
        value : [] 
      }
  
    })
     
  })
}


</script>
<style scoped>

.tag.selected {
  border-color: var(--gray-900); 
}

.tag.selected.add-cap {
  border-color: var(--green-500);
  box-shadow: 0 0 1px 1px var(--gray-500);
}

.tag.selected.remove-cap {
  border-color: var(--red-500);
  box-shadow: 0 0 1px 1px var(--red-500);
}
</style>