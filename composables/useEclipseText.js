/**
 * Capitalize the first letter of every word in stence and remove under scores with spaces
 */
export default ()=>{
    return computed(()=>{
        return (text, max=12)=>{
            if ( ! text ) return text
            if ( ! text.substring) return text 
            var length = text.length;
            text = text.substring(0,max)
            if ( length > max) text += "..."
            return text 
        }
    })
}