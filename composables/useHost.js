

var host = null; 
export default () => {

  if ( host ) return host; 
  if (!process.server) {
    host = `http://${window.location.host}`
    return host;
  }


  let dynamic_way = () => {
    console.log("-------------------------Using dynamic method to get HoseName----------------------")
    const nuxtApp = useNuxtApp()
    // for 3.0.0.rc_vercions: host = nuxtApp.ssrContext.req.headers.host
    // UPD 27.01.23:
    const headers = nuxtApp.ssrContext?.event.node.req.headers
    var referer = headers.referrer || headers.referer; // The page the user is on while making this call
    var user_agent = headers['user-agent']
    host = headers.host
  }
  try {
    var arg = JSON.parse(process.env.__CLI_ARGV__)
    var port = null;
    for (var i = 0; i < arg.length; i++) {
      if (arg[i].includes("--port=")) {
        port = arg[i].replace("--port=", "")
        break;
      }
    }
    if (!port) dynamic_way(); else {
      host = "localhost:" + port
    }
  } catch (e) {
    console.log("======================== Try dynamic use for {HoseName} =====================")
    dynamic_way()
  }


  host = "http://" + host;
  return host;
}