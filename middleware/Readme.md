Defines code that runs within the Vue part of your Nuxt app. Not to be confused withserver middleware, which are run in the Nitro server part of your app.

3 Types
    (1) Global middleware - define within /middleware with ".global" name and runs first
    (2) Named middleware -defined within /middleware and used within definePageMeta
    (3) Annoymous/inline -defined within each page via definePageMeta
    
Example Definition:

export default defineNuxtRouteMiddleware((to, from) => {
  if (to.params.id === '1') {
    return abortNavigation()
  }
  return navigateTo('/')
})
