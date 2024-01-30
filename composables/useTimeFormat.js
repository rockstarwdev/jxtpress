export default () =>{
    let short_month = [
        "Jan","Feb","Mar","Apr",
        "May","Jun","Jul","Aug",
        "Sep","Oct","Nov","Dec"
    ]
    let lz = (val)=>{
        return (val < 10 ) ? '0'+val : ''+val;
    }
    let utc_to_simple =(utc_time)=>{
        if ( ! utc_time) return null; 
        var dt = new Date(utc_time);
        var lt =  dt.toLocaleDateString() + " " + dt.toLocaleTimeString();

        var dd = lz(dt.getDate());
        var yy = lz(dt.getFullYear());
        var mm = lz(dt.getMonth()+1);

        var HH = lz(dt.getHours() );
        var MM = lz(dt.getMinutes());
        
        var sep = "/"
        var spacer=" "
        return `${mm}${sep}${dd}${sep}${yy}${spacer}${HH}:${MM}`
    }

    let utc_to_short_month_date_time =(utc_time)=>{
        if ( ! utc_time) return null; 
        var dt = new Date(utc_time);
        var lt =  dt.toLocaleDateString() + " " + dt.toLocaleTimeString();

        var dd = dt.getDate();
        var yy = lz(dt.getFullYear());
        var Mm = short_month[ dt.getMonth() ];

        var HH = lz(dt.getHours() );
        var MM = lz(dt.getMinutes());
        
        return `${Mm} ${dd}, ${yy} ${HH}:${MM}`
    }
    let utc_to_short_month_date =(utc_time)=>{
        if ( ! utc_time) return null; 
        var dt = new Date(utc_time);
        var lt =  dt.toLocaleDateString() + " " + dt.toLocaleTimeString();

        var dd = dt.getDate();
        var yy = lz(dt.getFullYear());
        var Mm = short_month[ dt.getMonth() ]; 
        return `${Mm} ${dd}, ${yy}`
    }
    return {utc_to_simple, utc_to_short_month_date, utc_to_short_month_date_time}
  }