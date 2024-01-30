
<template>
    <div class="s-scheduling"  :class="[sidebar_expansion ? 'expanded' : 'collapsed']">
        <header class="heading p-2 flex bg-white">
            <aside class="lead-header flex items-center">
                <button class="button rounded-full hamburger-expander" @click="hnd_toggle_sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg> 
                </button>
                <slot></slot>
            </aside>
            
            <main class="schedule-headers flex justify-between flex-1 items-center">
                <div class="flex gap-2"> 
                    <button class="button  rounded" @click="hnd_reset_main_calendar_to_today">Today</button>
                    <div class="flex gap-1">
                        <button class="button rounded-full previous sm" @click="hnd_iterate_main_calendar(-1)">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg> 
                        </button>
                        <button class="button rounded-full next sm"  @click="hnd_iterate_main_calendar(1)">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg> 
                        </button>
                    </div> 
                    <div class="flex items-center">
                        <span class="font-bold color-gray-600">{{  
                            display_view_period  
                            
                        }}</span>
                    </div>
                </div>

                <div class="group-0000">
                    <s-select v-model="scheduling_view_mode" 
                        :values="schedule_view_modes" 
                        @change="hnd_scheduling_view_type_changed">
                    </s-select>
                </div>

            </main>
        </header>
        <div class="calendar-view">
            <aside class="sidebar p-2" style="">

                <div class="flex gap-2">
                    <div class="w-1/3">
                        <div>Color</div>
                        <s-select v-model="target_color" :values="color_list"></s-select>
                    </div>
                    <div class="w-2/3">
                        <div>Name</div>
                        <s-input v-model="target_name"></s-input>
                    </div>
                </div>    
                
            </aside>
            <main class="content">

                <s-month-view v-if="scheduling_view_mode=='by_month'" :search="target_name" :color="target_color"
                    v-model="d"  @update="hnd_month_view_updated" :piped-event="pipedEvent" 
                    :month="cd_m_month" :year="cd_m_year"   @load-edit="emit('load-edit',$event)"></s-month-view>
                <s-week-view v-if="scheduling_view_mode=='by_week' || scheduling_view_mode=='by_day'" v-model="d"
                    :view="scheduling_view_mode"  :search="target_name" :color="target_color"
                    :month="cd_m_month" :year="cd_m_year" :date="cd_m_date" :piped-event="pipedEvent" 
                    @update="hnd_month_view_updated"  @load-edit="emit('load-edit',$event)"
                    >
                </s-week-view>
            </main> 
        </div>
    </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';


const props = defineProps({
  pipedEvent : { type: Object, value : null},//an event that was loaded using 'load-edit'
  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update','period-change', 'load-edit'])
const d = useModel(props,emit);

const root = ref(null)
onMounted(()=>{
 
})
watch(()=>props.pipedEvent, (new_val)=>{
    console.log ("--->",new_val,"Scheduling")

})


let target_color = ref('all')
let target_name = ref('')
var t_colors = util.get_color_list()
t_colors.splice(0,0,{ title : "All", value : "all "})

let color_list =   ref(t_colors)
 
/**
 * The current format the user wishes to view the scheduling calendar
 */
let scheduling_view_mode = ref('by_week') //ref("by_month")
/** The different ways in which the calendar can be viewed */
let schedule_view_modes = ref([
    { title : "Day", value : "by_day" },
    { title : "Week", value : "by_week" },
    { title : "Month", value : "by_month" },
    { title : "Year", value : "by_Year" }, 
])
/** the user want to change the type of view that exists */
let hnd_scheduling_view_type_changed = (x)=>{
    hnd_iterate_main_calendar(0) 
}
/** Indicate whether the sidebar is expanded or not */
let sidebar_expansion = ref(true) 
/**
 * User want to collapse/expand sidebar
 * @param {Event} e 
 */
let hnd_toggle_sidebar = (e) =>{
    sidebar_expansion.value = !sidebar_expansion.value 
}
 
/** User click the primary "Today" button with intent to view the main calendar current date.  
 * This method is auto invoked on component creation
 */
let hnd_reset_main_calendar_to_today = ()=>{
    var today = new Date()
    cd_m_month.value = today.getMonth()+1
    cd_m_year.value = today.getFullYear() 
    cd_m_date.value = today.getDate()
}
/** The integer year that will yield date span in primary view */
let cd_m_year = ref( 1 )
/** The integer month that will yield date span in primary view */
let cd_m_month = ref( 1999);
/** The integer date that will yield date span in primary view */
let cd_m_date = ref(1)

hnd_reset_main_calendar_to_today()

 
let display_view_period = computed(()=>{
    let month = ["January","February", "March",
                 "April","May","June",
                 "July","August","September",
                 "October","November","December"  ]
    if ( scheduling_view_mode.value  == 'by_month'){
        return month [ cd_m_month.value -1 ] + " " +  cd_m_year.value 
    }else if ( scheduling_view_mode.value =='by_week') {
        var span = util.get_week_window(cd_m_year.value, cd_m_month.value, cd_m_date.value )
        var ltext = (span[0].getMonth()+1)+"/"+span[0].getDate()
        var rtext = (span[1].getMonth()+1)+"/"+span[1].getDate()+"/"+span[1].getFullYear()
        return `${ltext} -  ${rtext}`
    }else {

        return `${month[cd_m_month.value-1]} ${cd_m_date.value}, ${cd_m_year.value}`
    }
})
/** User want to view the next date view as of function of @scheduling_view_mode */
let hnd_iterate_main_calendar = ( direction)=>{
    let cd_view_span = null; 
    let out = null; 
    switch(scheduling_view_mode.value ) {
        case 'by_month':
            if ( direction == 1 ) {
                cd_m_month.value  ++;
                if ( cd_m_month.value > 12) {
                    cd_m_month.value = 1;
                    cd_m_year.value ++;
                } 
            }else if ( direction == -1) {
                cd_m_month.value  --;
                if ( cd_m_month.value < 1) { 
                    cd_m_month.value = 12;
                    cd_m_year.value --;
                }
            }else { 
                //do nothing
            }
            //window span
            out = util.get_month_window( cd_m_year.value, cd_m_month.value ) 
       
            
            break;
        case 'by_week':
            //get the window of the week we are in
            var cur_view = util.get_week_window(cd_m_year.value, cd_m_month.value, cd_m_date.value )
            var next= direction == -1 ? cur_view[0] : direction == 1 ? cur_view[1] : cur_view[0] ;
            next.setDate( next.getDate() + direction )
            cd_m_date.value = next.getDate()
            cd_m_month.value = next.getMonth()+1
            cd_m_year.value = next.getFullYear()
            //then use the updated week we are in to get the next coming view the user asked for
            out =  util.get_week_window(cd_m_year.value, cd_m_month.value, cd_m_date.value )
            break; 
        case 'by_day':
            //get the window of the day we are in
            var cur_view = new Date ( cd_m_year.value, cd_m_month.value-1, cd_m_date.value )
            cur_view.setDate( cur_view.getDate() + direction ) //Advance to the new Date //the desired view period

            var new_day = new Date(cur_view.getTime())
            var end_of_day = new Date(new_day.getTime()) 
            end_of_day.setHours(23,59,59);
             
            cd_m_date.value = new_day.getDate()
            cd_m_month.value = new_day.getMonth()+1
            cd_m_year.value = new_day.getFullYear()

            out =  [new_day, end_of_day]

            break; 
    }
    
    emit('period-change', out  )
}
/** The month view calendar has been updated to either modify an existing 
 * event or add a new event
*/
let hnd_month_view_updated = ( calendar_event ) =>{
    forward_event_update ( calendar_event )
}
let forward_event_update = (evt)=>{
    evt = util.copy(evt) 
    evt.start = (new Date(evt.start)).getTime()
    evt.end = (new Date(evt.end)).getTime()
    emit('update', evt  ) 
}
</script>
<style scoped>


.heading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
}
.heading > .lead-header {
    width: 342px;
}

.calendar-view {
    display: flex;
}
.calendar-view > .sidebar {
    margin-top: 54px;
    width: 342px;
    min-height: 320px;
    position: fixed;
    transition: transform 180ms ease-in-out;
}
.calendar-view > .content {
    flex: 1;
    padding: 54px 0 0 342px;
    min-height: 500px;
    transition: padding 180ms ease-in-out;
}

.s-scheduling.collapsed .calendar-view > .sidebar {
    transform: translateX(-342px);
    transition: transform 180ms ease-in-out;
}
.s-scheduling.collapsed .calendar-view > .content{
    padding: 54px 0 0 0px;
    transition: padding 180ms ease-in-out;
}

@media (max-width: 640px) {

    .s-scheduling .sidebar {
        display: none;
    }
    .s-scheduling .content {
        padding-left: 0px;
    }
}
</style>