/**
 * Capitalize the first letter of every word in stence and remove under scores with spaces
 */
export default ()=>{
    return computed(()=> { 
        return (sentence, max_length =undefined)=>{ 
            if ( ! sentence) return; 

            var out = sentence.replace(/_/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            if ( max_length && sentence.length > max_length){
                out = out.substring(0, max_length) + "..";
            }
            return out;
        }
    })
}