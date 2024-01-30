module.exports = class TestBlock {
    constructor(instance, {cp, chk}){

    }

    edit({el, set, get}){
        return el('div',{
            innerHTML:  "this is a <b><u>test</u></b> block"
        })
    }
    render ( { id, classes , sty }){
        return { html: "" }
    }
}