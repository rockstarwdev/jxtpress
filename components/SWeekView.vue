
<template>

    <div class="s-week-view relative" ref="root"  >
 
        <div class="fold-view-title flex">
                <div class="time-header  ">00:00</div>
                <div class="week-header-tittle"  :class="[view_type]">
                    <div class="day-title day-col gutter"   v-for="(day,index) in week_dates" 
                    :key="day" :class="[index==0 ?'gutter':'',day.day_name.short]">
                    <span  >{{ day.day_name.short }} {{  day.date  }}</span>  
                    </div>
                </div>
        </div>
        <div class="fold-view">
            <div class="week-time-pane"> 
                <div class="time-list-gutter">
                    <div v-for="time_slot in time_list(null)" 
                    :class="[ clean_time ('t'+time_slot.time) ,
                    time_slot.is_current_time ? 'current-time': '', 'scale-'+interval_scale,
                    time_slot.is_on_the_hour ? 'on-the-hour':'', 
                    time_slot.is_not_on_the_hour ? 'not-the-hour':'',
                    time_slot.hour < 8 || time_slot.hour > 17? 'after-hours':'']"
                    @mouseover="hnd_hover_time_gutter"
                    @mouseout="hnd_stop_hover_time_gutter"
                    class="gutter time-slot" :key="time_slot.time" 
                    :time="clean_time('t'+time_slot.time)" >
                        {{ time_slot.time  }} 
                    </div> 
                </div>
            </div>
   
            <div class="week-dates" :class="[view_type]">
                <div class='day-date day-col' v-for="day in week_dates" :key="day.local_date" 
                        :class="[ day.day_name?.name, 'gutter']"  > 
                    <!--    {{  day.local_date  }}  -->

                    <div v-for="time_slot in time_list(day)" 
                    class="gutter day-time-slot "  
                    :class="[ clean_time('t'+time_slot.time) , 
                     time_slot.is_current_time ? 'current-time': '','scale-'+interval_scale,
                     time_slot.hour < 8 || time_slot.hour > 17? 'after-hours':'']"  
                    @mousedown="hnd_start_span_drag( time_slot)"
                    @mouseover="hnd_hover_span(time_slot)"
                    @end-spanning="hnd_end_span_drag(time_slot)"
                    :key="time_slot.time" :time="time_slot.time">
                        
                        <template v-for="(event,ei) in get_events_of_day(time_slot )" :key="event.id+'ei'+ei">
                            <div class="event" :data-title="event.title"  
                            @mousedown="(e)=>e.stopPropagation()"
                            @dblclick="hnd_edit_event( event )"
                            @mouseover="hnd_mouse_over_event" @mouseout="hnd_mouse_out_event"
                            :style="{backgroundColor : get_meta ( event, 'color')  }"
                            :event-id="event.id"
                            :class="[event.is_start ? 'start':'',event.is_end ?'end' :'']">
                                {{ ellipse_text (event.title ,5) }} 
                            </div>
                        </template>
                        <!-- Loop within this timesloot to see which events fall into it-->

                    </div>

                </div>
            </div>  
         
        </div>

        
        <div class="absolute scaler z-100" style="right: 22px; bottom: 10px">
            <div class="button-group sm">

                <button v-for="scale in time_scales" :key="scale.value "
                @click="hnd_update_scale(scale.value)"  
                :class="[scale.value == interval_scale ? 'active':'']"
                    class="button" type="button">
                {{ scale.title }}
                </button>
                
            </div>
        </div>

        <!-- XHO -->
        <s-calendar-event-modal v-model="active_event"  :piped-event="pipedEvent"  
            @update="hnd_emit_update_event" @load-edit="emit('load-edit', $event)"> 
        </s-calendar-event-modal>
        
    </div>
 
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';

let days = ref([
 'Sun','Mon','Tue','Wed','Thu','Fri','Sat'
])
let time_scales = ref([
    { title : '1HR',value : '1hr'},
    { title : '30min',value : '30min'}, 
    { title : '15min',value : '15min'}, 
    { title : '10min',value : '10min'}, 
    { title : '5min',value : '5min'},  
])
let active_event = ref ( null )


const props = defineProps({
    view : { type : String },
    pipedEvent : { type:Object , default :()=>null },
    month: {
    type: Number,
    
    default: ()=>{
        let today = new Date() 
        return today.getMonth()+1
    }
  },
  year: {
    type: Number,
    default: ()=>{
        let today = new Date() 
        return today.getFullYear()
    }
  },
  date: {
    type: Number,
    default: ()=>{
        let today = new Date() 
        return today.getDate()
    }
  },

  search : { type : String, default : "" },
  color: { type : String, default : "all"},
  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update:modelValue', 'update', 'load-edit'])
const d = useModel(props,emit);

watch(()=>props.pipedEvent, (new_val)=>{
    console.log ("Recieved the loaded event :BB")
    active_event.value = new_val
})

const root = ref(null)
onMounted(()=>{
    view_current_time()
})
let view_current_time = ()=>{
 
    var cur = root.value.querySelector('.current-time.gutter')
    if ( cur ) cur.scrollIntoView(false)
}
let cur_hour = ref(new Date().getHours() )
let _mem_bank = {} 

let week_dates = computed(()=>{ 
    var out = util.get_week_dates( props.year, props.month, props.date)
    console.log ("View_type-<"+view_type.value+">")
    if ( view_type.value == 'by-day'){
        var it ; 
        //return out;  
        var is_date
        for(var j=out.length-1; j > -1; j--){ 
            it =out[j];
            is_date = it.month == props.month &&   it.year  == props.year &&    it.date  == props.date
            console.log ("looping ", it, !is_date )
            if ( !is_date ){
                    console.log ("Erasing", it )
                    out.splice(j,1)
            }
        }
        console.log ("VIEW BY ", view_type.value , '\n\n\n',out, props.month, props.date, props.year  )
    }
    return out 
})

let hnd_edit_event = (evt)=>{
    active_event.value = evt  
}

let hnd_emit_update_event = (evt)=>{
    emit('update', evt )
    active_event.value = null 
}

let interval_scale = ref('1hr')

    let get_step = ()=>{
        let interval = interval_scale.value ;
        var val =1;
        if ( interval == '1hr') {
            val = 60; 
        }else if ( interval == '30min'){
            val = 30  
        }else if ( interval == '15min'){
            val = 15  
        }else if ( interval == '10min'){
            val = 10 
        }else  {
            val = 5  
        }
            return val 
    }
let time_list = computed(()=>{
    _mem_bank = {} //reset memory bank
    return (day)=>{

        let start_hour = 0;
        let start_minute=0;

       
        let at_end_of_time = false;

        let out = [],  val = null  

        let hour =start_hour, minute = start_minute , next_minute=start_minute, next_hour=start_hour;
        
        let do_step = (step )=>{ 
            minute += step
            if ( minute >= 60) {
                hour++;
                minute=0;
            } 

            next_minute = minute + step
            if ( next_minute >= 60){
                next_minute = 0;
                next_hour++
            }
        }
        let today   = new Date()
        let t_time  = today.getTime()
        let t_next  = new Date(t_time)
        t_next.setHours(t_next.getHours() , t_next.getMinutes()+get_step(), 0)
        t_next = t_next.getTime()

        let a0, b0, step, num_iter_step=1, is_hourly_step,real_step_amount
        do { 
            step = get_step()
            is_hourly_step  = step == 60
            real_step_amount = is_hourly_step ? 15 : step 
            num_iter_step = 1;
            if ( is_hourly_step ) num_iter_step = 4
            a0 = day ? new Date(day.year, day.month-1, day.date) :new Date();  


            for ( var i=0; i < num_iter_step; i++){ 
                a0.setHours(hour,minute); 
                b0 = util.add_minutes(a0, real_step_amount  )

            
                val = {
                    is_on_the_hour      :  minute == 0,// is_hourly_step && i==0, 
                    is_not_on_the_hour  : minute != 0 ,//is_hourly_step && i!=0,

                    hour , minute ,  next_hour, next_minute,
                    time : util.lz(hour) +":"+ util.lz(minute ),
                    is_current_time :  a0.getHours() == today.getHours() && Math.abs(today.getMinutes() - a0.getMinutes() <=5)  ,//t_time <= a0.getTime() && a0.getTime() <= t_next ,

                    start : new Date(a0.getTime()),   
                    end : new Date(b0.getTime()),   date : a0.getDate(),
                    real_end : null
                }
                out.push( val )
                do_step( real_step_amount )
            }
            at_end_of_time = hour > 23 || ( hour >= 23 && minute >= 59)
        }while ( ! at_end_of_time )

        return out 
    }
})

let hnd_hover_time_gutter = (e)=>{
    var target = e.target; 
    var time_name = target.getAttribute("time")
    if ( ! time_name ) return; 

    var sel = `.${time_name}`
    


    document.querySelectorAll(sel).forEach((node)=>{
        node.style.backgroundColor= '#6366f17a'
        node.classList.add('active')

    })
}
let hnd_stop_hover_time_gutter = (e)=>{ 
    var target = e.target; 
    var time_name = target.getAttribute("time")
    if ( ! time_name ) return; 

    var sel = `.${time_name}`
    document.querySelectorAll(sel).forEach((node)=>{
        node.style.backgroundColor= ''
        node.classList.remove('active')
    })
}
let clean_time = computed( ()=>{
    return ( str ) =>{
        return str.replace(/:/gm,'-')
    }
})
let hnd_update_scale = (scale)=>{
    console.log ("Set Value to ", scale)
    interval_scale.value = scale 
    
    setTimeout (()=> view_current_time(), 200)

}

let ellipse_text = useEclipseText()
let get_meta = useGetMeta()


/**
 * 
 */
let get_events_of_day = computed(()=>{
    return ( time_slot) =>{ // { start, end, time, is_current_time,minute,hour}
        
 
        var s0 = time_slot.start 
        var s1 = time_slot.end 
        let is_start, is_end ;
        var filtered_data = []

        var arr_events = [... d.value ]

        arr_events = arr_events.filter( (item)=>{
            var include = true; 
            if ( props.color != 'all'){
                include &&= props.color == get_meta.value(item, 'color')
            }
            if ( props.name && props.name.length > 1 ) {
                include &&= item.title.includes(props.name)
            }
            return include; 
        })
        


        if (  b_pressing_time_slot.value) {  
            let olo = {
                title : 'New Event',
                start : drag_spanning.value.ts0.start.toISOString() ,
                end :   drag_spanning.value.ts1 ?  
                        drag_spanning.value.ts1.start.toISOString() : 
                        drag_spanning.value.ts0.start.toISOString(),
             };
             
            arr_events.push( olo ) 
        }

        arr_events.filter ( evt =>{
            var e_start = null, e_end = null; 
            if ( evt.start ) e_start = new Date(evt.start) 
            if ( evt.end ) e_end     = new Date (evt.end )

            
            var include =  false; 
            if ( e_start && e_end ) {  
                include = util.does_overlay(s0,s1,e_start, e_end )
                if (include &&  e_start > s0)include = false 
            }else { 
                include = time_slot.start <= e_start && e_start <= time_slot
                if ( include && e_end <= s1) include = false; 
            } 

            if ( include ) { 
                is_start = s0 <= e_start 
                
                is_end = s1 > e_end  
                filtered_data.push ({
                    ... evt , is_start, is_end    
                })
            }
        })

        return filtered_data
    }
})

let hnd_mouse_over_event = (e)=>{
    var target = e.currentTarget; 
    var event_id = target.getAttribute('event-id'); 
    if ( ! event_id ) return;  
 
    target.setAttribute ( 'o-color',  target.style.backgroundColor  )
    root.value.querySelectorAll(`[event-id='${event_id}']`).forEach(node=>{
        //node.style.backgroundColor = 'var(--primary-100)'
        node.classList.add('active') 
    })
}
let hnd_mouse_out_event = (e)=>{
    var target = e.currentTarget;
    var event_id = target.getAttribute('event-id'); 
    if ( ! event_id ) return;  

    var o_color = target.getAttribute ( 'o-color' )
    target.removeAttribute('o-color')
    root.value.querySelectorAll(`[event-id='${event_id}']`).forEach(node=>{
        node.style.backgroundColor = '' 
        node.classList.remove('active') 
        node.style.backgroundColor = o_color
        
    })
}
let b_pressing_time_slot = ref(false); 
let drag_spanning = ref({ ts0 :null, ts1 : null })
let hnd_start_span_drag = ( time_slot )=>{
   //if ( html_event.target.classList.contains ("day-time-slot") ) return 

    if ( b_pressing_time_slot.value) return false;
    b_pressing_time_slot.value = true; 
    drag_spanning.value.ts0 = time_slot 

    let e_handle  = (e)=>{
        b_pressing_time_slot.value = false;
        window.removeEventListener('mouseup', e_handle)
        var target = e.target;
        if ( ! target.classList.contains('day-time-slot'))    target = target.closest('.day-time-slot');
        if ( ! target ) return; 
        util.trigger('end-spanning', target  )
    }
    window.addEventListener('mouseup',e_handle)

    console.log ("Starting mouse drag ", time_slot)
}
let hnd_hover_span = (time_slot) =>{
    if ( ! b_pressing_time_slot.value) return ;
    drag_spanning.value.ts1 = time_slot
    console.log (drag_spanning.value.ts0.time,drag_spanning.value.ts1.time )
}
let hnd_end_span_drag = (time_slot)=>{ 
    var range = JSON.parse ( JSON.stringify(drag_spanning.value))
    
    hnd_edit_event ({
        title : 'new event',
        start : range.ts0.start ,
        end : range.ts1 ? range.ts1.start  : range.ts0.start 
    })
    drag_spanning.value = { ts0:null, ts1:null }


}
let view_type = computed(()=>{
    return props.view =='by_week' ? 'by-week' : 'by-day'
})

</script>
<style scoped>

.fold-view-title {
    padding-top: 8px;
}
.gutter {
    margin-top: -1px;
}
.day-title{
    margin-top: 2px;
}
.s-week-view  { 
    user-select: none;
}
.time-header.gutter {
    opacity: 0;
    user-select: none;
    visibility: hidden;
}
.week-header-tittle,.week-dates {
    display: grid;
    flex: 1;
}
.week-header-tittle.by-week,.week-dates.by-week  { 
    grid-template-columns: repeat(7,1fr);
}

.week-header-tittle.by-day ,.week-dates.by-day  { 
    grid-template-columns: repeat(1,1fr);

}



.week-dates {
    height: 100%;
    position: relative;
}
.day-col {
    height: 100%;
}
.time-header {
    visibility: hidden;
}
.fold-view {  
    min-height: 90vh;
    height: 90vh;
    max-height: 90vh;
    display: flex;
    overflow: auto;
}


.fold-view .gutter {
    min-width: 42px;
    padding: 0.125em 0px;
    border-top: 1px solid var(--gray-300);

    min-height: 20px;
    max-height: 20px;
    height: 20px;
    padding: 0 ;
}
.fold-view .gutter:first-child {
    border-top-color: transparent;
}

.Sunday.gutter .gutter {
}
.day-col.gutter > .gutter.day-time-slot {
    display: flex;
    border-left: 1px solid rgba(11, 34, 60, 0.073); 
    padding: 0 6px;
    overflow: hidden;
    gap: 2px;
    position: relative;
}
.event {
    background-color: #b1b2e77d;
    min-width: 16px;
    border: 1px solid gray;
    padding: 0 0.125em;
    overflow: hidden;
    border-top-color: transparent;
    border-bottom-color: transparent;
    z-index: 10;
    color: transparent;
}
.event.start {
    margin-top: 3px;
    color: var(--gray-800);
    border-top-color: gray ;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
}
.event.end {
    border-bottom-color: gray ;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
} 

.event.active {
    
}
.after-hours.gutter {
    background-color: #6169ad0a;
}

.day-title {
    font-weight: 600;
    color: var(--gray-500);
    font-size: 75%;
}
.time-list-gutter {
    border-left: 1px solid var(--gray-300);
    
}
.gutter.time-slot {
    color: var(--gray-400);
    cursor: default;
    display: flex;
    align-items: center;
    padding-left: 8px;
    font-size: 0.75em;
}
.gutter.time-slot:hover {
    color: var(--gray-700);
}

.gutter.time-slot.not-the-hour {
    opacity: 0.25;
}
.gutter.time-slot.on-the-hour:hover{
    text-shadow: 1px 0 #15056759;
}
.gutter.active {
    background-color: var(--primary-100);
}
.current-time.gutter, .gutter.day-time-slot:hover {
    background-color: #6d6db52e;
}

.scale-1hr.not-the-hour {
    color: transparent;
}


</style>