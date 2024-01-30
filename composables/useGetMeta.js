/**
 * Capitalize the first letter of every word in stence and remove under scores with spaces
 */
export default ()=>{
    return computed(()=>{
        return (obj, meta_name, def_value =null )=>{
            if ( ! obj ) return null;
            var metas = obj.metas ;
            if ( metas == undefined || metas == null ) return null;
            var m = metas.find(it =>it.name == meta_name) 
            var value = def_value 
            if ( m ) value = m.value || def_value 
            
            return value  
        }
    })
}