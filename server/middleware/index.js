
import core from "../jxtpress/core";
import plugin from "../jxtpress/plugin";
 
/**
 * @param event { node : { 
 *                  req: {httpVersion,url,method,statusCode,statusMessage}, 
 *                  res :{...} 
 *                },
 *                fetch : Function ,
 *                headers : { ... }
 * 
 *  }
 */
export default defineEventHandler(async (event) => {

    
    // Server 
    var resource_url = event.path 
    // { href : url string, origin, protocol:'http', host: domain and port, 
    //   search: string query, searchParams: Query object, port, hostname, hash: blank string,
    //   username, password, pathname : String }
    var req_url =   getRequestURL(event) ;
    //Lookis like "http://localhost/..." ie "http://localhost:5678/F-team1.jpg?id=440"
    var pathname = req_url.pathname
    var href     = req_url.href 

    let cookies = parseCookies(event ) 
    let headers = await getHeaders(event)
    event.jxtpress = {cookies,headers } 

    if ( Object.keys(cookies).length==0){
        console.log ("================================Cookies passed in is EMPTY")
    }
    
    let user        = await core.verify_user(event) 
    
    var referer     = headers.referer || headers.referrer || headers.refer || headers.refferer
    //other keys : sec-fetch-site
    var user_agent  = headers['user-agent'];//'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    var os          = headers['sec-ch-ua-platform']
    var browser     = headers['sec-ch-ua'] //'"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"'
    var ip          = headers['x-forwarded-for']
    var utz         = event.utz = headers['utz']
    var utime       = Number.parseInt ( event.utime =headers['utime'] || 0 )
    var ulng        = headers['accept-language']
    var server_time = new Date()
    var stz         = server_time.getTimezoneOffset()
    var method      = event.node.req.method.toLowerCase()
    event.jxtpress.ip = ip 
    event.jxtpress.referer = referer 
    setHeader(event,'stz',stz)
    setCookie(event,'stz',stz)
    if ( ['post','delete','put'].includes(method) ){
        // event.body = await readBody(event) 
    }else if ( ['get'].includes(method)){
        //event.body = await readBody(event) 
    }

    plugin.run_action('on_request', { referer, user_agent, os, browser, ip, pathname });

    event.user      = user;


    var re_checker = /\/.+\.(jpg|png|webg|ico|svg|mp4|mp3|ogg)?/gm
    if ( re_checker.test( pathname)){ 
        // console.log ("----===>  DENY.Media ", pathname, resource_url)
        return null 
    }
    
    console.log ( `REQ:${method}> ${pathname}` , `uZone(${utz}) / sZone(${stz})` )

    
    // console.log('New reques4t: ' + api_url)
})
  