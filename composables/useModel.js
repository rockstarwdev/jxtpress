import { computed } from 'vue' 

export function useModel(props, emit, name='modelValue'){
    var old_value = undefined;
    return computed({
        get: ()=> { 
            old_value = props[name];
            return old_value ; 
        }, 
        set: (new_value)=> { 
            emit(`update:${name}`, new_value)
            var has_changed = true; 
            if ( old_value !== undefined && old_value == new_value) has_changed=false;  
            
            if ( has_changed ) emit('change',new_value)
        }
    })
}