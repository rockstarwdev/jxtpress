import util
 from "./util";

 const months = [
    "Jan","Feb","Mar",
    "Apr","May","Jun",
    "Jul","Aug","Sep",
    "Oct","Nov","Dec"
 ]
 /**
  * Create the element HTML ELement that represents the "values" holder.  The values holder will contain
  * 2 divs - choices and controls.
  * @returns {HTMLElement} 
  */
 let new_values =()=>{
    let values = document.createElement("div");
    values.classList.add("values")
    
    var controls = document.createElement("div");
    controls.classList.add("controls","flex","justify-between","p-2")

    var previous = document.createElement("button")
    previous.classList.add('button', 'ripple','is-dark',"prev")
    previous.setAttribute("type","button")
    previous.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
    stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`
    
    var type_toggle = document.createElement("button")
    type_toggle.style.minWidth = '7em'
    type_toggle.classList.add('button','ripple','is-dark',"period")
    type_toggle.setAttribute("type","button")
    type_toggle.innerHTML= `Current`

    var next = document.createElement("button")
    next.classList.add('button', 'ripple','is-dark',"next")
    next.setAttribute("type","button")
    next.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`
    
    
    controls.appendChild(previous)
    controls.appendChild(type_toggle)
    controls.appendChild(next)


    var temporal = document.createElement("div");
    temporal.classList.add("temporal","flex","justify-center","px-2")

    var hours= document.createElement("select");
    var minutes= document.createElement("select");
    var seconds= document.createElement("select");
    var d0 = document.createElement("span")
    var d1 = document.createElement("span")
    d0.innerHTML = d1.innerHTML = ":";
    hours.classList.add("hours")
    minutes.classList.add("minutes")
    seconds.classList.add("seconds")

    for ( var i=0; i < 24; i++){
        var h = document.createElement("option");
        h.setAttribute("value",i);
        h.innerText = lz(i);
        hours.appendChild(h);
    }


    for ( var i=0; i < 60; i++){
        var t = document.createElement("option");
        t.setAttribute("value",i);
        t.innerText = lz(i);
        minutes.appendChild(t);

        t = document.createElement("option");
        t.setAttribute("value",i);
        t.innerText = lz(i);
        //seconds.appendChild(t);
    }

    temporal.appendChild(hours)
    temporal.appendChild(d0) 
    temporal.appendChild(minutes)
    //temporal.appendChild(d1) 
    //temporal.appendChild(seconds)

    var choices = document.createElement("div")
    choices.classList.add("choices", "p-2")


 

    values.appendChild(controls); 
    values.appendChild(temporal); 
    values.appendChild(choices);
    return values; 
 }
 /** Create a leading zero number */
 let lz = (ival)=> String(ival).padStart(2,'0')
 
 let to_date_str = ({month,date,year })=>{
    return lz(month) +  "/"+lz(date) + "/" + lz(year) 
}
 let to_time_str = ({hour,minutes,seconds })=>{
    return lz(hour || 0)+":"+lz(minutes || 0) +  ":"+lz(seconds || 0);
}

/**
 * Populate the choices
 * @param {String} cur_value The current value for the Date Field
 * @param {String} type type of choices to create [ dates, months, years, decades ]
 * @param {HTMLElement} values The dropdown that houses controls and choices
 */
 let create_choices = (cur_value, view_date,  type , values, root )=>{
   
    if ( ! values ) return null; 
    var el_root = values.closest(".date");
    var el_selected = null; 
    if ( el_root){
        el_selected = el_root.querySelector(".selected");
    }
     
    var controls    = values.querySelector(".controls")
    var choices     = values.querySelector(".choices")
    var temporal    = values.querySelector(".temporal");
    
    if ( ! controls || ! choices || !temporal) throw new Error("Controls, Temporal, or Choices for Date Field not found")
    choices.classList.add("grid")
    choices.innerHTML = ``
    if ( ! cur_value ){
        cur_value = util.get_today()
    }else {
        try{
            console.lg ("has value of---??",cur_value)
            var is_date = new Date(cur_value);
            if ( isNaN ( is_date.getTime()) ) cur_value = util.get_today()
            if ( !cur_value.includes("-") || !cur_value("/")){
                cur_value = util.get_today()
            }
        }catch(e){}
    }
    if ( ! view_date){
        view_date = cur_value + ""
    }
    
    var has_time = el_root ? el_root.classList.contains("time")  : false; 
    temporal.style.display = has_time && type == "dates" ? '' : 'none'




    // Parse the text value  into an object
    var value_parts = util.get_date_parts( cur_value )
    //This is used for getting the dates/months view that user is navigating (render)
    var view_parts = util.get_date_parts( view_date )
    if ( !view_parts || ! value_parts) {
        var today = util.get_today()
        create_choices  (today, today,  type , values, root );
        return; 
    }

    var delay = 50

    var labels = controls.querySelector(".period")
    if ( labels ) { //Update the Current Viewing month, year, decade, etc
        var ref_parts = view_parts || value_parts || { }
        if (type == 'dates') {
            var month = months[ref_parts.month-1]
            var year = ref_parts.year 
            labels.innerHTML = `<span>${month}, ${year}</span>`
        }else if (type=="months"){
            var year = ref_parts.year 
            setTimeout(()=> 
                labels.innerHTML = ( `<span>${year}</span>` ), 
            10)
        }
    }
 
    var el_prev     = values.querySelector(".controls .button.prev")
    var el_period   = values.querySelector(".controls .button.period")
    var el_next     = values.querySelector(".controls .button.next")
    var next = (e)=>{
        if ( type == 'dates') {
            view_parts.month++;
            if ( view_parts.month > 12){
                view_parts.month = 1;
                view_parts.year ++;
            }
            var next_view_value = lz(view_parts.month) + "/"+ lz(view_parts.date)+ "/"+view_parts.year + "/"  
 
            clean_up();
            create_choices(cur_value , next_view_value, type, values, root )
        } else if ( type == 'months'){
            view_parts.year++;
            var next_view_value =  lz(view_parts.month) + '/' + lz(1) +"/"+view_parts.year
            clean_up();
            create_choices(cur_value , next_view_value, type, values, root )
        }else {
            var span = util.get_decade_span(view_parts.year);
            clean_up();
            create_choices(cur_value, lz(view_parts.month) + '/' + lz(1) +'/'+ span[1], type, values, root)
        }
    }
    var period = (e)=>{
        var new_type = null; 
        switch(type){
            case "dates"    : new_type = "months"; break;
            case "months"   : new_type = "years"; break;
            case "years"    : new_type="years"; break;
        }
        if (type == new_type) return; 
        clean_up();
        create_choices(cur_value,view_date, new_type,values, root)
    }
    var prev = (e)=>{ 
        if ( type == 'dates') {
            view_parts.month--;
            if ( view_parts.month < 1){
                view_parts.month = 12;
                view_parts.year --;
            }
            var next_view_value = lz(view_parts.month) + '/' + lz(view_parts.date)+'/'+ view_parts.year
            clean_up();
            create_choices(cur_value , next_view_value, type, values, root )
        }  else if ( type == 'months'){
            view_parts.year--;
            var next_view_value =  lz(view_parts.month) + '/' + lz(1) + '/' +view_parts.year 
            clean_up();
            create_choices(cur_value , next_view_value, type, values, root )
        }else {
            var span = util.get_decade_span(view_parts.year);
            clean_up();
            create_choices(cur_value, lz(view_parts.month) + '/' + lz(1) + '/'+(span[0]-1), type, values, root)
        }
    }
    let temporal_changed = (e)=>{
        e.stopPropagation();
        e.preventDefault();
        var hour   = temporal.querySelector(".hours").value;
        var minutes = temporal.querySelector(".minutes").value;
        var seconds = 0//temporal.querySelector(".seconds").value;

 
        set_new_temporal_vlaue(null,  to_time_str({ hour,minutes,seconds}) )
    } 

    temporal.querySelectorAll("select").forEach(sel=>{
        var shorthand = value_parts || { minutes:59, hours :99, seconds:99, date:99,month:99}
        if ( sel.classList.contains("hours"))sel.value =shorthand.hour 
        if ( sel.classList.contains("minutes"))sel.value =shorthand.minutes 
        if ( sel.classList.contains("seconds"))sel.value =shorthand.seconds 
        sel.addEventListener("change",temporal_changed)
    })

    let clean_up =()=>{
        if ( el_prev)   el_prev.removeEventListener('click',prev);
        if ( el_period) el_period.removeEventListener('click',period);
        if ( el_next)   el_next.removeEventListener('click',next);

        temporal.querySelectorAll("select").forEach(sel=>{
            sel.removeEventListener("change",temporal_changed)
        })
    }
    if ( el_prev)   el_prev.addEventListener('click',prev);
    if ( el_period) el_period.addEventListener('click',period);
    if ( el_next)   el_next.addEventListener('click',next);


    var today = new Date()

    var arr_choices = []
    //Clear CSS Styles
    values.classList.remove("dates","months","years","decades")
    var def_classes = ["item","flex","justify-center","p-1","cursor-pointer", "hover:bg-primary-400","hover:color-white","rounded"]
    if ( type == 'years'){
        var span = util.get_decade_span(view_parts.year);
        for ( var i=span[0]; i < span[1]+2; i ++){

            var mitem = document.createElement("div");
            mitem.classList.add(... def_classes)
            mitem.innerHTML = i
            mitem.addEventListener( 'click', (  ( it )=> (e)=>{
                //Advance to months
                setTimeout(()=>{
                create_choices(cur_value, 
                    lz(view_parts.month) + '/' + lz(1) + '/' +it.year,
                    "months",values ) 
                }, 10, root )
            })({ year : i,  is_year :
                i  == today.getFullYear() }) )
            arr_choices.push(mitem)

        }
    }else if ( type == "months"){
        choices.style.gridTemplateColumns = "repeat(3,1fr)"
        months.forEach( (month_name, index)=>{
            var mitem = document.createElement("div");
            mitem.classList.add(... def_classes)
            mitem.innerHTML = month_name
            mitem.addEventListener( 'click', (  ( it )=> (e)=>{
                //Advance to dates
                setTimeout(()=>{
                    var focus_view = lz(it.index+1)+ '/' + lz(1) +'/'+ view_parts.year
                    create_choices(cur_value,  focus_view , "dates",values, root )
                }, 10 )
            })({month: month_name, index, year : view_parts.year, 
                is_today : today.getMonth() == index && 
                view_parts.year == today.getFullYear() }) )
            arr_choices.push(mitem)
        })
    } if ( type == 'dates') {

        choices.style.gridTemplateColumns = "repeat(7,1fr)"
        values.classList.add("dates")
        // array of { date, day_index, in_month, is_today, month, month_name:{name, short}, year }
        var month_dates = util.get_month_dates(view_parts.year, view_parts.month);
        var it =null; 
        
        choices.style.gridTemplateColumns = "repeat(7,1fr)"
        for(var i=0; i < month_dates.length; i++){
            it = month_dates[i];
            var hitem = document.createElement("div")
            hitem.classList.add(... def_classes);
            if ( !it.in_month ) { 
                
                hitem.classList.add("out-month", "color-gray-400")
            }
            if ( it.is_today ) hitem.classList.add('today', 'font-extrabold');

            //Is this the selected value
            if ( it.date == value_parts.date && 
                 it.year == value_parts.year && 
                 it.month == value_parts.month ){
                    
                    hitem.classList.add("is-active")
            }
            hitem.innerHTML = it.date ;
            hitem.setAttribute("item-id",i);
            hitem.setAttribute("value", it.local_date)
            //Create scoped function that remembers its version of "it"(iterator)
            hitem.addEventListener('click', ((h_item,index, el_item)=>  ((e)=>{
                //Select value and & No more advancing
                var previous_sel_it     = values.querySelector(".item.is-active")
                if ( previous_sel_it )  previous_sel_it.classList.remove("is-active")
                el_item.classList.add("is-active")

                util.trigger("item-clicked",span)
                if ( !root ) {
                    root = el_item.closest(".date")
                }
                cur_value = set_new_temporal_vlaue(h_item.local_date, null)
                setTimeout(()=>{  
                    clean_up();
                    create_choices(cur_value, h_item.local_date, "dates", values , root) 
                },delay)

            }))(it,i, hitem)  )
            arr_choices.push(hitem)
        }
        
    }
    let set_new_temporal_vlaue =(str_date, str_time)=>{
        if ( ! str_date ) {
            str_date =  lz(value_parts.month) + '/' + lz(value_parts.date) + "/"+value_parts.year ;
        }
        if ( ! str_time){
            str_time = to_time_str(value_parts)
        }
        
        var new_val = str_date
        if ( has_time ) new_val += ' ' + str_time

        var date_component =values.closest(".date");
        if ( date_component ) date_component.setAttribute("value",  new_val )


        if ( el_selected ){
            var span = el_selected.children[0];
            if ( ! span) {
                span = document.createElement("span"); 
                el_selected.appendChild(span);
            }
            span.setAttribute("value", new_val)
            span.innerHTML = new_val
            cur_value = new_val
        }
 
        util.trigger("change", root, { value : new_val })
        return new_val
    }
    arr_choices.forEach(node => choices.appendChild(node))
    
 }
    /*
          Markup 
          .select <.is-array> value="somthings"
            .selected 
                <span>some value</span>
            .values 
                div value="something" => Text REPEAT 
    */
export default function (){

    let init = ()=>{
        document.querySelectorAll(".date").forEach( root =>{
            var selected = root.querySelector(".selected");
            var el_value = selected.children[0];
            setTimeout(()=>{
                if ( el_value) {
                    var strval = root.getAttribute("value")
                    try { 
                       strval = JSON.parse(strval)
                    }catch(e){ }
                    var parts = util.get_date_parts(strval) ;

                    try{ 
                        if ( root.classList.contains("time")) {
                            strval = to_date_str(parts) + " " + to_time_str(parts)
                        }else {
                            strval = to_date_str(parts) 
                        }
                    }catch(e){
                        strval ="null"
                    } 
                    el_value.innerText=strval
                }
            },50)
            
        })
    }
    util.ready( util.init)
    //On pagiation to new route, call init functions
    util.delegate('page-load', 'body', (e)=>{ 
        init () 
    })


    window.addEventListener( 'scroll', (e)=>{
        var nodes = document.querySelectorAll(".date");
        for(var i=0; i < nodes.length; i++){ 
            util.keep_relative ( nodes[i], nodes[i].querySelector(".values") )
        }
    });

    let get_value = (date_root)=>{
        var attr = date_root.getAttribute("value");
        if ( attr == "") attr = "null";
        if ( !attr) attr = "null"
        var value ;
        try {

            value = JSON.parse(attr) || null
        }catch(e){
            value = attr 
        }
        return value; 
    }



    //Open up the Dropdown Window
    util.delegate("click", ".date", (e)=>{
        var do_later =()=>{
            e.stopPropagation()
            var target = e.target; 
            var root = !target.classList.contains("date") ? target.closest(".date") : target;
        
            //sanity check
            var values = e.target.closest(".values");
            if ( values || !root ) return;//Do not process when the click orginated from values

            //Get the values container, 
            values = root.querySelector(".values");
            if ( values   )  values.remove() //remove what is there currently

            var value = get_value(root);
        
            values = new_values ();
            root.appendChild(values); 
            
            create_choices (value, value, "dates", values, root  );

            
            var is_active = root.classList.contains("is-active")
            if (  is_active )return; //Already open

            root.classList.add('is-active')
            util.click_outside(values, ()=> {
                root.classList.remove('is-active')
                setTimeout(()=> values.remove(), 210)
            })
            util.keep_relative ( root, values ) 
        }
        setTimeout(()=> do_later(), 45 )
    })



}