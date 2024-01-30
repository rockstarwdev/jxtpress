import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 

import pages from '~/server/jxtpress/pages';
import ecommerce from '~/server/jxtpress/ecommerce';

/**
 * Provides an interface to plugins to expose registered endpoints to front end or 
 * remote servers
 * 
 * @param { action, post_id, quantity, variations : optional }
 */
export default defineEventHandler( async (event) => {
    var body        = await readBody(event)  ; 
    var param       = event.context.params
    const query     = getQuery(event) 
    const headers   =  getHeaders(event);


    if ( ! body ) return core.res_denied(event, { msg : "payload required to process request"})
    if ( ! body.action || ! body.quantity || !body.post_id ) 
    return cpre.res_denied(event, {msg : "invalid payload provided"})

    let user        = event.user;
    query.user_id = user?.id; 
    body.user_id = user?.id  
    

    if ( !body.user_id){ // if the user is not signed in, 
      // get all jwt cart items and add it to the body option 
      body.cart_cookies = core.get_cookie(event, 'cart', [])   
    } 
    
    //Add the new item the user wished to add
    let d = await ecommerce.cart_action( body );

    //If not user signed in, add their cart data to cookies
    if ( ! body.user_id ) {
      var str_cart = JSON.stringify(d.cart_cookies )
      console.log ("Setting new cart++++++++++++++++++", str_cart)
      setCookie(event, 'cart', str_cart)
    }
    
    return { d }
  })