

export default (reactive_var )=>{
    
    return computed(()=> { 
        if ( ! Array.isArray(reactive_var.value)){
            return {}
        }else {
            var first = reactive_var.value[0];
            if ( ! first ) return first; 
            var pagination = first.pagination;
            return pagination;
        }
    })
}