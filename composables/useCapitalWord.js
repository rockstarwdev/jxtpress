/**
 * Capitalize the first letter of every word in stence and remove under scores with spaces
 */
export default ()=>{
    return computed(()=> { 
        return (str )=>{ 
            if ( ! str) return ""; 
            
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
        }
    })
}