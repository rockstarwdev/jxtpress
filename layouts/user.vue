<template>
    <div class="layout-user w-full flex" :class="[b_expand_sidebar?'expanded':'collapsed']"> 
      <div class="layout-wrapper flex flex-auto min-w-0">
        <div class="menu-links flex-col flex-auto sticky top-0 overflow-hidden h-screen shrink-0 z-1 shadow-5 muiltr-1fehr9c">
          
          <div class="flex flex-auto flex-col overflow-hidden h-full z-100 ">
              <header  class="sidebar-header flex flex-row items-center justify-center shrink-0 h-10 md:h-72 px-4 py-2 mb-6 mt-3">
                <!--<button class="toggle w-10 h-10" @click="hnd_toggle_sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>-->
                 <span class="font-extrabold text-2xl">{{ store.dashboard_title  }} </span>
              </header>
  
              <div class="user" v-if="user"> 
                <div class="flex flex-col items-center justify-center mb-10">
                   <nuxt-link to="/user/profile">
                     <div class="display-image avatar text-32 font-bold w-14 h-14 mb-2 ">
                   
                      
                      <img v-if="user.avatar" :src="user.avatar" class="w-full h-full rounded-full bg-gray-600">
                    
                    </div>
                  </nuxt-link>
                  <div class="display-name  font-extrabold text-lg">{{  user.title || user.name }}</div>
                  <div class="display-email">{{  user.email }}</div>
                </div>
              </div>
              <div class="menu-bundle-wrap flex flex-1 flex-col min-h-0 px-4 ">
                <template v-for="(bundle,bi) in menu_links" :key="'bundle-id-'+bi">
                  
                  <component :is="has_children(bundle) ? 'div' :NuxtLink" 
                        :id="first_link(bundle).name" class="menu-link ripple" 
                        :to="first_link(bundle).url" 
                  :class="[ link_status(first_link(bundle)), !first_link(bundle).icon ? 'no-icon':''] " > 
                    <span v-if="icon_type(first_link(bundle)) == 'svg'" class="icon mr-2" v-html="first_link(bundle).icon">
                    
                    </span>
                    <span v-if="icon_type(first_link(bundle)) == 'img'" class="icon mr-2" >
                      <img style="width:24px;height:24px" :src="first_link(bundle).icon">
                    </span>
                    
                    <div class="flex-auto flex justify-between">
                      <span>{{ first_link(bundle).title }}</span>
                      <span class="badge" v-if="first_link(bundle).badge">{{ first_link(bundle).badge  }}</span>
                      <span class="icon expander" v-if="has_children(bundle)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>

                      </span>
                    </div>
                  </component>


                  <ul class="menu-bundle" :id="'children-' +first_link(bundle).name">
                    
                  <template v-for="menu_link in child_links(bundle)" :key="menu_link.name">
                    <li class="menu-link no-icon ripple">
                      <nuxt-link :id="menu_link.name" :to="menu_link.url" class="flex flex-auto justify-between"
                       :class="[menu_link.is_current? 'is-current': '']" >
                        <span> {{ menu_link.title }}</span>
                        
                        <span class="badge bg-red-500 color-white" v-if="menu_link.badge"> {{ menu_link.badge }}</span>
                      </nuxt-link> 
                    </li>
                  </template>
                </ul>
                </template>
              <div class="versioning flex justify-center mt-9 color-gray-500">
                <span class="font-sm text-sm font-thin">Versioning</span>
              </div>
              </div>
            </div>
            
        </div><!-- End of menu-links root-->
        <div class="overlay z-10" @click="b_expand_sidebar=false"></div>
        <main class="content flex flex-col flex-auto min-h-full min-w-0 relative z-5">
            <header class="px-6 mb-3">
              <button class="toggle w-10 h-10" @click="hnd_toggle_sidebar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </header>
            <div class="px-6 embeded">
              <div class="container mx-auto">

                <slot></slot>
              </div>
            </div>
        </main><!--End of Content Root-->

           
      </div>
    </div>
</template>

<script setup>
 
import { useMainStore } from "~/store"

let NuxtLink = defineNuxtLink({})
  //Layout Components run after route middlewares
 
  const store = useMainStore()

  let menu_links = computed(()=>{
    var arr         = store.admin_menu_links  ;
    
    var root_names  = arr.filter(it => it.parent == null).map(it => it.name )
    
    var out         = [] 

    root_names.forEach(name => {
      var bundle = [], it 
      for(var i=0; i < arr.length; i++){
        it = arr[i];
        if ( it.name == name || it.parent == name) bundle.push( it )
      }
      out.push( bundle )
    });
    return out 
  })
  let b_expand_sidebar = ref(true);
  let hnd_toggle_sidebar = ()=>{
    b_expand_sidebar.value = !b_expand_sidebar.value
  }

  let first_link = computed(()=>{
    return (bundle)=>{
      let first = bundle[0]
      if ( ! first) return {}
      return first
    }
  })
  let icon_type = computed(()=>{
    return (link)=>{
      if ( ! link) return null;
      if ( !link.icon) return null;
      var icon = link.icon.trim();
      if ( ! icon) return null; 

      if ( icon.startsWith("<svg")) return "svg";
      if ( icon.startsWith("http")) return "img";
      return null; 
    }
  }) 
  let child_links= computed(()=>{
    return ( bundle ) =>{

      return bundle.filter ((it, i) => i != 0)
    }
  })
  let has_children = computed(()=>{
    return (bundle)=>{
      if ( ! bundle) return false;
      return bundle.length > 1 
    }
  })
  let link_status = computed(()=>{
    return ( link) =>{
      return link.is_current ? 'is-current': ''
    }
  })

  let user = computed (()=>{
    if ( ! store.user ) return null;
    return store.user;
  })
  console.log ("User Auth Layout running", store.counter)
</script>

<style scoped>
body {
    background-color: var(--admin-theme-whitespace);
}
.sidebar-header  {
  color: #fff;
}
.menu-links{
  margin: 0;
    min-width: 280px;
    width: 280px;
    max-width: 280px;
    transition: margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
    background-color: var(--admin-theme-panel-bg);
    color: var(--admin-theme-panel-color) !important;
    font-weight: 600;
}
.menu-link.no-icon {
  padding-left: 2.8rem;
}
.layout-user.expanded .menu-links {

}
.layout-user.collapsed .menu-links {
  margin-left: -285px;
}
.menu-link {
  margin:0;
  padding: 0.5rem 0.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  text-align: left;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  cursor: pointer;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
}
.menu-link:hover , 
.menu-link.is-current, 
.menu-link.router-link-active{
  background-color: rgba(255, 255, 255, 0.085);
}
.overlay {
  display: none;
}
@media (max-width: 640px) {
  .layout-user .menu-links .toggle {
    display: none;
  }


  .layout-user .menu-links {
    position: absolute;

  }
  .layout-user.expanded .overlay {
    display: block;
  }

}
.menu-bundle {
  margin: 0;
}

.display-image.avatar {
    background-color: #080c1b;
    border-radius: 50%;
    border: 3px solid var(--indigo-600);
}
</style>