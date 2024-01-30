// https://nuxt.com/docs/api/configuration/nuxt-config


const is_dev = process.env.NODE_ENV == 'development';
const is_prod= process.env.NODE_ENV == 'production';
 
if ( is_prod ){
  
}
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
          theme: {
            primaryColor: 'user_primary'
          }
        }
    },
    modules: ['@pinia/nuxt'],
    nitro: {
        plugins: ["~/server/jxtpress/index.js"],
    },
    css: [
      '~/assets/css/style.css', 
    ],
    hooks: {
      close: () => {
        console.log ("nuxt.hook.close  ++++++++++++++++++++++++++++++++++++++++++++")
      },
      'vite:extendConfig' : (config, { isClient, isServer })=>{
        if ( isClient ) {
          console.log (" + Added Vue Runtime")
          config.resolve.alias.vue = 'vue/dist/vue.esm-bundler.js'
        }
      }
    }
})
