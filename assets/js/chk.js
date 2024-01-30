export default (options,key,def=undefined)=>{
  var value = options[key];


  if ( (value === undefined || value== undefined) && def !== undefined) value = def; 


  return value ; 

  }