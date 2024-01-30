import { useMainStore } from "~/store";

/**
 * Uniformed way to instruct JxtPress that the page has been mounted
 */
export default (optional_fn)=>{
    let store = useMainStore()

    
    onBeforeMount( ()=>{

        let store = useMainStore()
        
    })
}