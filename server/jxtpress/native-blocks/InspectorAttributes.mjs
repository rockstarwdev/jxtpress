export default class {

    constructor(instance, {cp, chk} ){
 
        if ( instance && instance.data ) {
            this.attrs = chk(instance.data, "attrs", []) 
        }
        cp(instance, cp)
    }
    edit ( { el, set, get, block_id , debounce, util  }){
        let el_attrs = [] 

        let create_attr_row = (index, data)=>{
            return el('div', { classes:['flex','items-start','gap-2', 'attr-row','mb-1']},
                el('button', {classes:['button','sm', 'danger'],
                    innerHTML : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" ` +
                    `stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>`,
                    onClick (e){
                        var attrs = get('attrs');
                        attrs.splice(index,1)
                        set({attrs})
                        util.trigger('blur',e.target);
                    }
                }),
                el('div',{ },
                    el('div',{ },
                        el('string', {
                            placeholder : 'attribute-name',
                            value :  data.name,
                            onChange (e){
                                var attrs = get('attrs');
                                attrs[index].name = e.target.value 
                                set({attrs})
                            }
                        })
                    ),
                    el('div',{ },
                        el('string', {
                            placeholder : 'attribute-value',
                            value :  data.value,
                            onChange (e){
                                var attrs = get('attrs');
                                attrs[index].value = e.target.value
                                set({attrs})
                            }
                        })
                    ),
                )
            )
        }
        for(var i = 0; i < this.attrs.length; i++){
            el_attrs.push(  create_attr_row(i, this.attrs[i]) )
        }

        return  el('div',{}, 
                    el('style',{
                            attrs : { id : 'style-'+block_id },
                            innerHTML : get('attrs')
                    }),
                    el('inspector',{ priority: -50, classes: ['mb-6'] },[
                        el('div',{ classes:['flex', 'items-center', 'mt-2']},
                            el('button',{
                                classes: [ 'sm','mr-3', 'hover:background-indigo-500' ],
                                innerHTML : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />  </svg>
                              `,
                              onClick(e){
                                var attrs = get('attrs') || []
                                attrs.push({ name : "", value : "" })
                                set({ attrs })

                                util.trigger('blur',e.target);
                              }
                            }), el('label',{innerHTML: "Block Attributes"  }, []),
                        ),
                        
                        ... el_attrs 
                        
                    ]) 
                )
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