import { computed } from 'vue' 

export function useTabNext(current_element){

    
    var fields = document.querySelectorAll("input, select, textarea");
    for(var i=0; i < fields.length; i++){
        if ( current_element == fields[i] && i != fields.length-1){
            setTimeout((next_field)=>{
                next_field.focus(); 
            },250, fields[i+1])
        } 
    }
}