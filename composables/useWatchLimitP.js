import { computed } from 'vue' 

/**
 * Dynamically watch a page number specifier changes
 * @param {ref} ref_results A variable that holds the results  that need to be paginated
 * @param {ref} ref_page_num A Vue ref variable that is to be watched for p number changes
 * @param {ref} ref_page_limit Vue ref variable that is to be watch for limit changes
 * @param {Function} fn_to_call optionally, a function to call when the ref page has changed
 * @returns { Array } Pagination Page numbers as an array of { title , value : page number }
 */
export function useWatchLimitP(ref_results, ref_page_num, ref_page_limit, fn_to_call ){

  //Create the choices of page number that user can select


  if ( ref_results){ 
    watch(ref_results, (new_results)=>{

    })
  }
  if( ref_page_num ) { 
    watch(ref_page_num, async  (new_page_number, previous) => {
        let route     = useRoute()
        route.query.p = new_page_number //fullPath contains query and param, whilst path only contains the url
 
        var query     = { ... route.query }

        navigateTo({  path: route.path  , query  })
        if ( typeof fn_to_call == 'function')  await fn_to_call()
           
    })
  }

  if( ref_page_limit ) { 
    watch(ref_page_limit, async  (new_page_limit, previous) => {
        let route     = useRoute()
        route.query.limit = new_page_limit //fullPath contains query and param, whilst path only contains the url
 
        var query     = { ... route.query  }

          navigateTo({  path: route.path  , query  })
          if ( typeof fn_to_call == 'function'){
            await fn_to_call()
          } 
    
    })
  }
  let pages = computed( ()=>{
    if ( ! ref_results.value ) return []
    
    // Hello world
    var out         = []
    var pagination  = ref_results.value[0]?.pagination || {}; 
    var num_pages   = pagination.pages || 1;
    
    for ( var i=0; i < num_pages  ; i++){
      out .push({   title : "Page " + (i + 1)  , value : i+1})
    }
    
    return out 
  })
  let limits = ref([ ])
  var count = 10;
  var amount =0;
  var increment = 25;
  limits.value.push({title : `1 / page`, value : 1 })
  
  for ( var i = 1; i < count; i++){
    amount = i * increment
    limits.value.push({ title : `${amount} / page`, value : amount   }) 
  }

  return { pages , limits }
}