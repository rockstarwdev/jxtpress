export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          
        }
        cp(instance, this)
    }
    edit ( {el} ){
        return el('serverside',{},null); 
    }

    async render (core, {id,classes, is_preview , post_id, is_404, is_403 }   ){
        let html = ``;
        if ( is_preview ){

            html = `
                <div>
                    <div><b>{</b> Post Comments <b>}</b></div>
                    <textarea disabled class="border border-solid border-gray-400 w-full"></textarea>
                    <div class="flex mb-6 justify-end"><button disabled class="button">post</button></div>

                    <div class="media">
                        <div class="image opacity-75">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                      </svg>                      
                        </div>
                        <div class="content">
                            <div class="w-full h-3 bg-gray-300 rounded mb-2"></div>
                            <div class="w-2/3 h-3 bg-gray-200 rounded mb-2"></div>
                            <div class="w-full h-3 bg-gray-200 rounded mb-2"></div>
                        </div>
                    </div>
                    
                    <div class="media">
                        <div class="image opacity-45">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                      </svg>                      
                        </div>
                        <div class="content">
                                    
                            <div class="w-1/2 h-3 bg-gray-100 rounded mb-2"></div>
                            <div class="w-1/3 h-3 bg-gray-200 rounded mb-2"></div>
                            <div class="w-3/4 h-3 bg-gray-300 rounded mb-2"></div>
                        </div>
                    </div>
                    
                </div>
            `
            return {   html   }
        }else {

            if (is_403 || is_404) return { html : "<!-- Disabled comments for 404/403 -->" }

            var output = `<div ${id()}  ${classes('PostComment') }  > `; 
            output += `<s-comments :post-id="${post_id}" bt-sizing="md"></s-comments>`
            output += "</div>"
            return {
                html : output
            } 
        }
 
    }
    

    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) { 
        return false 
    }
    
}