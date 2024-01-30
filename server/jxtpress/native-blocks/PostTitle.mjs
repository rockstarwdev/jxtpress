export default class {

    constructor(instance, { cp, chk} ){
        if ( instance ) {
          
        }
        cp(instance, this)
    }
    edit ({  el }){
        return el('serverside', {}, null); 
    }

    async render (core, { inner_html, id, classes, iattrs } ){
        return {
            html : `<h1 ${classes("PostTitle")} ${id()}  ${iattrs()}  >${this.title || '<b>{</b>Post Title<b>}</b>'} </h1>`
        }
    }
    save ( query ) {
        return { }
    }

    /**
     * By defining this method, we are allowing the Layout to accept children
     * @param {Object} instance Block instance to drop into layout
     * @returns {Bool}
     */
    drop ( instance ) { 
        return false 
    }
    /**
     * Defines which blocks and be allow to be inserted into the block
     * @param {Object} blk Block Definition
     * @returns {Boolean}
     */
    insertable (blk){ 
        return false 
    }
}