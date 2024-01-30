
<template>

<div class="s-month-view">
    <div class="week-title user-select-none" style="padding-bottom: 0;">
        <div :key="col.value" class="day" v-for="col in wk_titles">
            <div class="color-gray-500 pl-2">{{  col.title }}</div>
        </div>
    </div>
    <div class="week-days" style="padding-top: 0; border-top: none;" >
        <!-- Begin Day -->
        <div class="day month-day"  :class="[day.is_today ? 'today' : '', day.day_name.name]" 
            :data-d="day.local_date"
            @mousedown="hnd_start_day_pressing(day, $event)"
            @mouseover="hnd_day_pressing_over(day)"
            @dblclick="hnd_add_new_event(day.obj)"
            v-for="day in month_dates" :key="day.str_date">
            <div class="date-number" :class="[day.in_month ? '' : 'outter-date' ]" ><!-- Date label-->
                <span class="number-value pointer p-1 user-select-none" :data-title="day.str_date">
                    <span>{{ day.date }} </span>
                    <span class="color-gray-600 ml-1">{{ capital_word(  day.date == 1 ? day.month_name.short : "") }}</span>
                </span> 
            </div>
            <template v-for="day_event in get_events_of_day(day, d)" :key="day_event.id + day_event.title ">
                <div class="event-item"  @click="hnd_edit_event(day_event, $event )"
                    :style="{backgroundColor: get_meta(day_event,'color','#b1b2e77d') }"
                    :class="[ day_event.is_filler ? 'filler': '', 
                            day_event.is_first_day ? 'first': '',
                            day_event.is_middle ? 'middle':'',
                            day_event.is_last_day ? 'last':'',
                            day_event.is_temp ? 'temporary':''
                       ]"
                      :data-title="day_event.title" >
                    <span class="text-sm event-title"   >
                        <!--{{ ellipse_text(day_event.title,8) + " " + day_event.track_id }} -->
                        
                        {{  day_event.is_first_day||day.day_index==0 ? 
                            ellipse_text (day_event.title,10)  : "&nbsp;" 
                        }}  
                        
                    </span>  
                </div> 
            </template>
        </div><!-- End Day-->
    </div>
    <s-calendar-event-modal 
        v-model="active_event"  
        @load-edit="emit('load-edit', $event)"   
        @update="emit('update',$event)"
        :piped-event="pipedEvent" > 
    </s-calendar-event-modal>
</div>
</template>
<script setup>

import util from '~/assets/js/util'

const props = defineProps({
  modelValue: {  type: null,   default: ''  },
  month: {
    type: Number,
    pipedEvent : { type:Object , default :()=>null },
    default: ()=>{
        let today = new Date()
        
        return today.getUTCMonth()+1
    }
  },
  search : { type : String, default : "" },
  color: { type : String, default : "all"},
  year: {
    type: Number,
    default: ()=>{
        let today = new Date()
        
        return today.getUTCFullYear()
    }
  },
})

const d = useModel(props,emit);
const emit = defineEmits(['change','delete', 'update', 'load-edit'])

watch(()=>props.pipedEvent, (new_val)=>{
    console.log ("Recieved the loaded event : AA")

})

let wk_titles=ref([
    { title : 'Sun', value: 'sun'},
    { title : 'Mon', value: 'mon'},
    { title : 'Tue', value: 'tue'},
    { title : 'Wed', value: 'wed'},
    { title : 'Thu', value: 'thu'},
    { title : 'Fri', value: 'fri'},
    { title : 'Sat', value: 'sat'}, 
])
/** calendar-data (cd) of the current month of the main (m) calendar view.  
 * 
 * Gives: Array of { date: Int, day_index: Int, day_name : { name, short}, year :Int, month: Int, month : { name, short }, in_month:Boolean, str_date, is_today }
*/
let month_dates = computed(()=>{
    return util.get_month_dates(props.year, props.month)
})

let stext = (d)=>{
    return `${d.getMonth()+1}-${d.getDate()}-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`
}
/** Given a possibley long text, short it to be visible in a compact space */
let ellipse_text = useEclipseText()


let event_memory_bank = {} 
let reset_memory_bank = ()=>{
    event_memory_bank = {} //reset memory bank 
}
let month_year_changed = (prop_name, value )=>{
    reset_memory_bank()
    console.log(prop_name + " changed to ", value )
}
watch( ()=> props.month, ( value)=>{
    month_year_changed("month", value )
})
watch( ()=> props.year, (value)=>{ 
    month_year_changed("year", value )
})
onMounted(()=>{
    window.__mmm = event_memory_bank
})

let get_meta = useGetMeta()

let get_events_of_day = computed(()=>{

    return (day_obj, arr_events) =>{
        if ( ! Array.isArray(arr_events ))return [] 
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
        let modified_event_list = [ ... arr_events ]
        if ( is_doing_new_date_pressing.value  ) {
            var span = [new Date (date_pressing_from.value ), 
                    date_pressing_to.value  ? 
                    new Date(date_pressing_to.value ) : 
                    new Date(date_pressing_from.value ) ].sort((a,b)=> a - b )
            
            
            modified_event_list.push({
                title : "new event", 
                start : span[0],
                end : span[1] , 
                is_temp : true 
            })
            
        }
        day_obj.obj = new Date(day_obj.str_date + ' 00:00:00')

        var do_mon = day_obj.obj.getMonth()+1
        var do_date= day_obj.obj.getDate()
        var do_year= day_obj.obj.getFullYear()
        
        var d1 = new Date(day_obj.obj.getTime())
        d1.setHours(23,59,59)

        
        if ( day_obj.day_index==0) reset_memory_bank ()
        var f_subset = [],  temp

        //For the given day object, return all events that fall within the day
        let mem_id = ( id, title, time)=>  'event_'+id + title + time 
        
        let make_date = (d_val)=> new Date(d_val)
        
        
        modified_event_list.filter( evt =>{
            var e_start = null , e_end= null; 
            

            if ( evt.start ) e_start = make_date( evt.start )
            if ( !e_start ) return false; 

            var included = false;
            var is_first_day=false, is_last_day=false, is_middle =false; 
            if ( evt.end ) e_end =  make_date( evt.end )
            if ( ! e_end ) {
                included = (e_start.getDate()== do_date && do_mon == e_start.getMonth()+1 && do_year == e_start.getFullYear())
                is_first_day=is_last_day=is_middle =included ; 
            }else { 
 
                included = util.does_overlay(day_obj.obj, d1, e_start,e_end,evt.title )
                if ( included ){
                    is_first_day=  e_start.getDate()       == do_date && 
                                    e_start.getMonth()+1    == do_mon && 
                                    e_start.getFullYear()   ==do_year   

                    is_last_day =   e_end.getDate()         == do_date && 
                                    e_end.getMonth() + 1      == do_mon && 
                                    e_end.getFullYear()     == do_year 
                    
                     
                    is_middle   = !is_first_day && !is_last_day
                }
            } 
            if ( included ) { 
                var track_id = f_subset.length+1  
                var memory_id = mem_id(evt.id, evt.title,e_start.getTime())
                if ( ! event_memory_bank[memory_id]) {
                    event_memory_bank[memory_id] =  { id :  evt.id, track_id, title : evt.title   }
                }else { 
                    track_id = event_memory_bank[memory_id].track_id
                }
                temp = {  
                    ... evt  , 
                    is_first_day,is_last_day,is_middle,
                    priority_order : e_start.getTime(),
                    time : e_start.getTime(), track_id ,
                     
                }
                f_subset.push( temp )
                if ( day_obj.date==1){   }
            }
            return included 
        }) 

        f_subset= f_subset.sort((a,b )=> a.priority_order - b.priority_order )
        //Check for collisions
        let track_iter=1
        let e_loop, e_loop_other, collision_track_id, e_highest_priority
        for(var i =0; i < f_subset.length; i++){
            e_loop = f_subset[i];

            for(var j=0; j<f_subset.length; j++){
                if ( i == j ) continue; 
                e_loop_other = f_subset[j];
                // A collision exists
                if ( e_loop.track_id == e_loop_other.track_id){
                    collision_track_id = e_loop.track_id
                    var t_sort = [e_loop, e_loop_other].sort((a,b)=> a.priority_order-b.priority_order)
                    e_highest_priority = t_sort[0]
                    e_highest_priority.track_id = collision_track_id
                    t_sort[1].track_id = track_iter + 1 
                    if (t_sort[i] && t_sort[i].is_first_day) 
                        event_memory_bank[mem_id(t_sort[i].id, t_sort[i].title,t_sort[i].time )].track_id =t_sort[1].track_id
                }
            }
            track_iter ++;
        }

        //Now check for tracks that are open between other other-filled trackss 
        let e_iter, e_prior = null, gap 
        for(var i =0; i < f_subset.length; i++){
            e_loop = f_subset[i];
            if ( e_loop.is_first_day) { //for items that are just starting their track
                for(var j=0; j<f_subset.length; j++){
                    // if ( i == j ) continue; 
                    e_iter = f_subset[j];
                    e_prior = f_subset[j-1]
                    if ( ! e_prior) continue; 
                    gap = Math.abs(e_prior.track_id - e_iter.track_id)
                    if ( gap > 1) { 
                        var opening = e_prior.track_id + 1;
                        event_memory_bank[mem_id(e_loop.id, e_loop.title,e_loop.time )].track_id = opening
                        e_loop.track_id = opening
                        break;
                        //console.log ( "Track Difference", e_prior.title +`(${e_prior.track_id})`, e_iter.title+`(${e_iter.track_id})`)
                    }
                    //try to find open track between two tracks
                }
            }
        }

        //finally, because we possibly changed the track order by placing events into open tracks, sort by track id
        f_subset= f_subset.sort((a,b )=> a.track_id - b.track_id )

        //Now because we could have some tracks that start at "3" and we prefer to have filler events
        // use loop to create fillers
        track_iter = 1
        let dif_track = 0
        for(var i =0; i < f_subset.length; i++){ 
            e_loop = f_subset[i];
            if ( e_loop.is_filler) continue; 
            dif_track = Math.abs(e_loop.track_id - track_iter)
        
            if (dif_track > 0) {//there is a gap
                for(var j=0; j < dif_track; j++){ 
                    f_subset.splice( track_iter-1, 0, { 
                        title : '', is_filler:true, 
                        track_id : track_iter+j 
                    })
                }
                //stip to end of track
                track_iter = e_loop.track_id
                //if we are at the end, break 
                if ( f_subset.length == track_iter)break;
            }
            track_iter++;
        }
        return f_subset
    }
})

 
let capital_word = useCapitalWord()
let active_event = ref(null)
let edit_modal = ref(null) 
 
let hnd_edit_event = async  (evt,e ) =>{
    evt  = JSON.parse( JSON.stringify(evt) ) 
    evt.start = util.format_mm_dd_yyyy_hh_mm( evt.start )
    evt.end = util.format_mm_dd_yyyy_hh_mm( evt.end || evt.start)

    active_event.value = evt 

    /*setTimeout(async ()=>{ 
        var res = await util.open_modal({ id : edit_modal.value  }) 
        if ( res.action == 'ok'){  
            var o_evt =  util.copy( active_event.value )  
            active_event.value = null;    
            emit('update', o_evt );
        }
    }, 100)*/
}   

/** User has double clicked a white space within a given day and thus wants to add a new event to that day */
let hnd_add_new_event = (starting_day, ending_day )=>{
    if ( ! ending_day) ending_day = starting_day

    let evt = {
        title : "new event",
        description : "",
        start : date_pressing_from.value , 
        end : date_pressing_to.value ,
        
    } 
    hnd_edit_event (evt )
}
/** Boolean indicating if the user want to create a new date by starting pressing on one day and releasing on another */
let is_doing_new_date_pressing = ref(false)
let date_pressing_from = ref("")
let date_pressing_to = ref("")

/** Wants to remember the fist calendar day they have pressed  */
let hnd_start_day_pressing = ( day , e) =>{
    if ( ! e.target.classList.contains('month-day'))return 
    if ( is_doing_new_date_pressing.value ) return 
    is_doing_new_date_pressing.value = true;
    date_pressing_from.value = day.local_date;
    date_pressing_to.value = day.local_date
    console.log ("starting pressing ")
    let e_handler = ( e )=>{
        
        is_doing_new_date_pressing.value = false;//release
        var target = e.target; 
        if ( ! target.classList.contains("month-day")) {
            var obj = target.closest('.event-item')
            if ( obj ) target = obj; else target = null;
             
            if ( ! target ) return; 
        }
        date_pressing_to.value = target.dataset.d  
        window.removeEventListener('mouseup', e_handler)

        //we only care about double click events, so if press and release on the same day -ignore
        if ( date_pressing_from.value == date_pressing_to.value)   return;
        
        var dx = [ new Date(date_pressing_from.value), new Date( date_pressing_to.value ) ].
                    sort((a,b) => a - b )
        hnd_add_new_event(dx[0],dx[1])
    }
    window.addEventListener('mouseup', e_handler)
}

let hnd_day_pressing_over = ( day ) =>{
    if (! is_doing_new_date_pressing.value ) return  
    date_pressing_to.value = day.local_date 
}
</script>
<style scoped>
.s-month-view {
    display: flex;
    flex-direction: column;
    gap: 0;
}
.week-title,.week-days {
    padding: 0.25em; 
    display: grid;
    grid-template-columns: repeat(7,1fr);
    border-left: 1px solid var(--gray-300);
    border-top: 1px solid var(--gray-300);
    padding-left: 0;
    padding-top: 0;
}
.week-days {
    height: 90vh;
}
.day {
    border: 1px solid var(--gray-300);
    padding: 0.25em;
    border-top: none;
    border-left: none;
    margin: -1px;
}
.week-days > .day {
    position: relative;
    min-height: 100px;
    padding-top: 22px;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0.35em;
}
.week-days > .day.today .date {
    background-color: var(--primary-500);
    color: var(--white);
    border-radius: 50%;
}
.day > .date-number {
    position: absolute;
    left: 6;
    top: 8px
}
.day > .date-number.outter-date {
    color: var(--gray-200);
}
.week-days .date:hover {
    text-decoration: underline;
}
.week-days .day:hover {
    background-color: rgba(28, 45, 80, 0.014);
}
.week-days .day:hover .date {
    text-shadow: 1px 0 0 var(--primary-500);
}
.event-item {
    --border : #3f3662;
    background-color: var(--indigo-500);
    color: var(--gray-800);
    margin-bottom: 0.25em;
    border: 1px solid transparent;
    user-select: none;
    max-height: 21px;
    overflow: hidden;
    border-radius: 3px;
}
.event-item.first {
    border-color: var(--border);
    border-right:none;
    margin-left: 3px; 
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
.event-item.last {
    border-color: var(--border);
    border-left:none; 
    margin-right: 3px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
.event-item.middle {
    border-top-color: var(--border);
    border-bottom-color: var(--border);
    border-left: none;
    border-right: none;
}
.event-item.first.last {
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
}
.event-item.temporary {
    border-color: rgba(8, 0, 255, 0.266);
}
.event-item.filler {
    opacity: 0;
    visibility: hidden;
}
.event-item.temporary {
    pointer-events: none;
}
</style>