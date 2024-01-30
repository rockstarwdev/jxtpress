export default (options )=>{
    if ( ! options ) return; 
    var container_id= "notification-container"
    var container = document.querySelector("#"+container_id)
    if ( ! container) {
        container = document.createElement("div")
        container.classList.add("absolute")
        container.style.left = "0px"; container.style.bottom = "0px";
        document.body.appendChild(container)
    }
}