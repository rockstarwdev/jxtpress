import core from '../jxtpress/core'
import db from '../jxtpress/db'


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
 
    console.log ( body , "Post GBody") 
    var now_obj = body.now_obj 
    var now_ts = body.now_ts 

    console.log ( "Inputs { ", now_obj , now_ts , " }  User's time " ) 
    console.log ("---new date obj", new Date( now_obj )) 
    console.log ("---new date ts", new Date( now_ts ),"\n\n")
    console.log ()

    console.log ("---new conversion obj", await core.to_server_time( { date: now_obj , offset: event.utz }))
    var server_out = await core.to_server_time( { date : now_ts , offset:  event.utz })
    console.log ("---new conversion tzi",  server_out )

    console.log ("") 
    var out_localuser = await core.to_user_time( { date : server_out , offset:  event.utz })

    console.log ("---back to user_time ",  out_localuser )
    return {
      server_time : server_out,
      user_time : out_localuser  
    }
  })