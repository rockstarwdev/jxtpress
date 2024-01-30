export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          
            
        }
        cp(instance, this)
    }
    edit ( {el} ){
        return el('serverside', {}, null); 
    }

    async render (core, {id, classes , iattrs } ){
        var title = await core.get_option({name : "site_title", value : ""})
        var html = `<span ${id()} ${classes("SiteTitle")}  ${iattrs()} ><b>${title.value || "Untitled Site" }</b></span>`
        return { html }
    } 
    style () {

        return ` 
        .block-instance.sitetitle {
            display: inline-block
        }
            
        `
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