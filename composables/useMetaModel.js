
import { ofetch } from 'ofetch' 
import { useMainStore } from '~/store'

/**
 * Create a simple way to model individual meta properties within an Array simple by specifing the Vue array object and the meta property
 * to be modeled.  If the meta name does not exist, the composable will generate it automatically.
 */
export default ( vue_ref_obj ,meta_name,initial_value = null  ) => { 
    
    let variable = computed ({
            get(){
                var arr = vue_ref_obj.value.metas ;
                if ( ! Array.isArray(arr)) {
                    arr = vue_ref_obj.value 
                }
                
                var it = arr.find(it => it.name == meta_name)
                if ( ! it ) { 
                    it = { name : meta_name , value : initial_value }
                    arr.push( it )
                } 
                return it.value 
            },
            set (new_value ){  
    
                var arr = vue_ref_obj.value.metas ;
                if ( ! Array.isArray(arr)) {
                    arr = vue_ref_obj.value 
                }
                
                var it = arr.find(it => it.name == meta_name)
                if ( ! it )  { 
                    it = { name : meta_name , value : initial_value } 
                    arr.push ( it )
                }
                
                if (new_value && typeof new_value.trim=='function') new_value = new_value.trim() 
                it.value = new_value  
            }
    })
    return variable 
}
