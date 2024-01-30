
<template>

    <div class="s-reoccur" ref="root" :expr="d"> 
 
         <div class="row flex gap-2">
            <div>
                <div class="sm label">Repeat</div>
                <s-select v-model="freq" :values="freq_types" @change="on_freq_changed"></s-select>
            </div>
            
            <div>
                <div class="sm label"> Every   </div>
                <s-spinner v-model="interval" :min="1"  @change="refresh_expression('interval')"></s-spinner>
            </div> 
            <div>
                <div class="sm label"> &nbsp;   </div>
                <div class="pt-3">
                   {{  string_freq_units }}
                </div>
            </div> 
         </div>
         <div v-if="freq == 'weekly'" class="weekly-day-selector flex gap-2 items-center"  c="ByDay">
            <div>on</div>
            <div class="button-group">
                <button class="button" v-for="day in weeky_by_day_choices" 
                    :class="[is_day_selected(day) ? 'active': '']"
                   @click="hnd_select_week_day(day)" type="button" :key="day.value">
                    {{ day.title }}
                </button>
            </div>
         </div>
         <div v-if="freq=='monthly'"  class="monthly-day-selector  "  c="ByMonth">
            <div class="">
                <div class="flex gap-3 mb-2">
                    <s-radio option="bymonthday" v-model="monthly_drill_down_type" title="On day" 
                    
                    @change="on_monthly_on_day" ></s-radio>
                    
                    <div v-if="monthly_drill_down_type=='bymonthday'" class="flex gap-3">
                        <s-select option="bysetpos" @change="refresh_expression('bymonthday-value')" v-model="by_month_day" :values="calendar_days"></s-select>
                        
                    </div>
                
                </div>

                <div class="flex gap-3 mb-2"> 
                    <s-radio option="bysetpos" v-model="monthly_drill_down_type" title="On the"  
                    @change="on_monhtly_on_the"></s-radio>

                    <div class="flex gap-3"  v-if="monthly_drill_down_type=='bysetpos'">                        
                        <s-select v-model="by_set_pos" :values="by_set_month_dates" 
                        @change="on_monthly_set_pos"></s-select>
        
                        <s-select v-model="by_week_day" :values="monthly_by_day_choices" @change="refresh_expression('by_monthly_day')">
                        </s-select>
                    </div>
                </div>
            </div> 
        </div>
 

        <div v-if="freq=='yearly'"  class="yearly-day-selector  "  c="ByYear">
            <div class="">
                <div class="flex gap-3 mb-2">
                    <s-radio option="bymonth" v-model="yearly_drill_down_type" title="On "  
                    @change="on_yearly_on_day"></s-radio>

                    <div v-if="yearly_drill_down_type == 'bymonth'" class="flex gap-3">
                        <s-select  @change="on_yearly_month_changed"
                        
                        v-model="by_month" :values="by_month_choices"></s-select>
                    
                    
                        <s-select  v-model="monthly_by_day" :values="calendar_days" @change="on_yearly_month_date_changed">
                        </s-select>
                    </div>
                </div>

                <div class="flex gap-3 mb-2"> 
                    <s-radio option="bysetpos" v-model="yearly_drill_down_type" title="On the"  
                    @change="on_yearly_set_pos"></s-radio>

                    <div class="flex gap-3" v-if="yearly_drill_down_type == 'bysetpos'">

                            <s-select v-model="by_set_pos" :values="by_set_month_dates" 
                        @change="on_yearly_update_xos"></s-select> 
        
                        <s-select v-model="by_week_day" :values="monthly_by_day_choices" @change="refresh_expression('by_monthly_day')">
                        </s-select>
            
                    </div>
                </div>
            </div> 
        </div>
        <div class="ends flex gap-2 items-center mt-3">
            <span>Ends</span>
            <s-select v-model="occurrence_end_type" :values="occurrence_end_types" @change="on_ends_type_changed"></s-select>

            <div class="dynamic-ends ">
                <div class="count flex gap-2 items-center" v-if="occurrence_end_type == 'after'">
                    <s-spinner v-model="occurrence_end_count" @change="on_end_type_count_changed"></s-spinner>
                    <span>Occurrences </span>
                </div>
                <div class="count flex gap-2 items-center" v-if="occurrence_end_type == 'until'">
                    <s-date :has_time="false" v-model="occurrence_end_date" @change="on_end_type_date_changed"></s-date>
                     
                </div>
            </div>
        </div>

    </div>
</template>
<script setup>

import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';

const props = defineProps({
  modelValue: {    type: null,   default: ''   },
  color: {   }
})

const   emit = defineEmits( [ 'change','delete', 'update:modelValue' ] )
const   d    = useModel( props , emit );

let changed_from_within = ref(false)
watch ( d, (new_val)=>{
    
    decode_str_value(new_val) 
})


/** When user selected frequency of by month: choices is bymonthday or  bysetpos */
let monthly_drill_down_type = ref("")
let freq = ref("")
let freq_types = ref([
    {title : 'Daily',value : 'daily'},
    {title : 'Weekly',value : 'weekly'},
    {title : 'Monthly',value : 'monthly'},
    {title : 'Yearly',value : 'yearly'},
])
let interval = ref(1)

let occurrence_end_type = ref('never')
let occurrence_end_count = ref("")
let occurrence_end_date = ref("")
let occurrence_end_types = ref([
    { title : "Never", value : 'never'},
    { title : 'After', value : 'after'},
    { title : 'Until', value : 'until'}
])

let by_week_day=ref("")
let weekly_by_day = ref([])
let weeky_by_day_choices = ref([
    { title : 'Sun', value : 'su'},
    { title : 'Mon', value : 'mo'},
    { title : 'Tue', value : 'tu'},
    { title : 'Wed', value : 'we'},
    { title : 'Thu', value : 'th'},
    { title : 'Fri', value : 'fr'},
    { title : 'Sat', value : 'Sa'},
])
let monthly_by_day = ref("")
let monthly_by_day_choices =  ref([
    { title : 'Sunday', value : 'su'},
    { title : 'Monday', value : 'mo'},
    { title : 'Tuesday', value : 'tu'},
    { title : 'Wednesday', value : 'we'},
    { title : 'Thursday', value : 'th'},
    { title : 'Friday', value : 'fr'},
    { title : 'Saturday', value : 'sa'},
])
/** When monthly freq, and "on day" is select, use this to hold the selected date */
let by_month_day = ref("")
/** When monthly freq, and "on the" is selected, use this to hold the "BYSETPOS" */
let by_set_pos = ref("")
let by_set_month_dates = ref([
    { title : 'First', value : 1 },
    { title : 'Second', value : 2 },
    { title : 'Third', value : 3 },
    { title : 'Fourth', value : 4 },
    { title : 'Last', value : -1 },
])
/** For yearly freq, this determintes when within the year month event occurs */
let by_month = ref("")
let calendar_days = ref( (()=>{
    var out = [];
    for ( var i=1 ;i < 32; i++ ) out.push({ title : i, value : i })
    return out 
}) () )

/** When yearly view type, used to choice "On", "on the" */
let yearly_drill_down_type = ref("")

let string_freq_units = computed(()=>{
    var amount = interval.value 
 
    var units = 'unit'
    switch(freq.value){
        case 'hourly': units = 'hour'; break;
        case 'daily': units = 'day'; break;
        case 'weekly': units = 'week'; break;
        case 'monthly':units = 'month'; break;
        case 'yearly': units = 'year'; break;
        default: units = 'unit'; break;
    }
    if ( amount > 1) units += '(s)'
    return units 
})

let is_day_selected = computed(()=>{
    return (day)=>{
        return weekly_by_day.value.includes(day.value.toLowerCase() )
    }
})
let hnd_select_week_day = ( day ) =>{
    var value = day.value.toLowerCase() 
    var index =  weekly_by_day.value.indexOf(value )
    if (index == -1 ) {
        console.log ("Addint to lost ")
        weekly_by_day.value.push( value )
    }else{
        console.log ("Dfasdf?? ")
        weekly_by_day.value.splice(index,1)
    }    
    refresh_expression('by_week')
}


let on_freq_changed = ()=>{
    if ( !monthly_drill_down_type.value )
    monthly_drill_down_type.value = 'bymonthday'
    refresh_expression('freq')
}
let on_monthly_on_day = ()=>{
    console.log ("REDKJFKFJLSKDJ ")
    if ( ! by_month_day.value ) by_month_day.value = 1 
     refresh_expression('bymonthday')
}

let on_monhtly_on_the = ()=>{
    if ( !by_set_pos.value ) by_set_pos.value=1
    if ( !monthly_by_day.value) monthly_by_day.value ='mo'
    refresh_expression('bysetpos')
}


let on_monthly_set_pos = ()=>{
    if ( !monthly_by_day.value ) monthly_by_day.value = 'mo'
    refresh_expression('by_set_pos')
}
let on_yearly_on_day = ()=>{
    by_month.value = 1
    if ( !monthly_by_day.value)monthly_by_day.value = 1
    refresh_expression('bymonth')
}
let on_yearly_month_changed =()=>{
    yearly_drill_down_type.value = 'bymonth'
    if ( !monthly_by_day.value)monthly_by_day.value = 1
    refresh_expression('bymonthday-value')
}
let on_yearly_month_date_changed = ()=>{
    yearly_drill_down_type.value = 'bymonth'
    if ( !by_month.value)by_month=1
    refresh_expression('by_monthly_day')
}

let on_yearly_set_pos = ()=>{

    if ( !by_set_pos.value ) by_set_pos.value=1
    if ( !by_week_day.value) by_week_day.value ='mo'

    refresh_expression('by_set_pos')
}

let on_yearly_update_xos = ()=>{
    yearly_drill_down_type.value='bysetpos' 
    if ( !by_week_day.value) by_week_day.value ='mo'

    refresh_expression('by_set_pos')
}
let on_ends_type_changed = ()=>{
    if ( !occurrence_end_count.value ) occurrence_end_count.value = 1
 
    if( ! occurrence_end_date.value ) {
        var t = new Date()
       
        occurrence_end_date.value =   `${t.getMonth()+1}/${t.getDate()}/${t.getFullYear()}`
      
    }
    console.log ("A")
    refresh_expression('ends-type')
}
let on_end_type_count_changed = ()=>{
    console.log ("B")
    refresh_expression('ends-count')
}
let on_end_type_date_changed = ()=>{
    console.log ("C")
    refresh_expression('ends-count')
}
let by_month_choices = ref([
    { title :'Jan', value:1},
    { title :'Feb', value:2},
    { title :'Mar', value:3},
    { title :'Apr', value:4},
    { title :'May', value:5},
    { title :'Jun', value:6},
    { title :'Jul', value:7},
    { title :'Aug', value:8},
    { title :'Sep', value:9},
    { title :'Oct', value:10},
    { title :'Nov', value:11},
    { title :'Dev', value:12},
])
    

                

let refresh_expression = (source)=>{
    var FR = freq.value
    var IR = interval.value 
    var Conditionals = '';

    if ( FR == 'weekly' && weekly_by_day.value.length>0){

        var days_list =weekly_by_day.value .join(',');
        Conditionals = `BYDAY=${days_list};`
    }
    if ( FR == 'monthly'){
  
        var T=monthly_drill_down_type.value || 'bysetpos';
        let V 
        if (T == 'bysetpos'){
            V = by_set_pos.value 
            let Y = by_week_day.value 
            Conditionals= `BYSETPOS=${V};BYDAY=${Y};`
        }else {
            V=by_month_day.value 
            Conditionals= `BYMONTHDAY=${V};`
        }
    }
    if ( FR == 'yearly'){ 
        var T=yearly_drill_down_type.value || 'bysetpos';
        let V=null , Y=null 
        if ( T == 'bysetpos'){
            V = by_set_pos.value 
            let Y = by_week_day.value 
            Conditionals= `BYSETPOS=${V};BYDAY=${Y};`
            
        }else {
            V=by_month.value 
            Y=monthly_by_day.value 
            Conditionals=`BYMONTH=${V};MONTHDAY=${Y}`
        }
    }
    var Ends = '';
    if ( occurrence_end_type.value != 'never'){
        console.log("----<XOH", "<"+ occurrence_end_type.value+">")
        if ( occurrence_end_type.value == 'after'){
            Ends = `Count=${occurrence_end_count.value};`
        }else {
            var V = occurrence_end_date.value;
            if ( V ) {
                V = new Date(V);
                V = V.toISOString()
            }
            Ends = `Until=${V};`
        }
    }else {
        console.log ("Express End=", occurrence_end_type.value)
    }

    var str = `FREQ=${FR};INTERVAL=${IR};${Conditionals}${Ends}`
    changed_from_within.value = true; 
    d.value = str 
    changed_from_within.value = false; 
     
}


let decode_str_value = (str)=>{
    if ( ! str ) return;
    if ( changed_from_within.value) return; 

    //occurrence_end_type.value = 'never'
    var assignments = str.trim().split(/;/gm).map(it => { 

        var expr = it.trim().toLowerCase().split(/=/gm)
        return { name : expr[0], value : expr[1] }
    })
    var expr 
    let get_freq=()=>{
        let f = assignments.find(it =>it.name =='freq');
        if ( ! f ) return null; 
        return f.value 
    }
    for(var i=0; i < assignments.length; i++){
        expr = assignments[i];
        if(expr.name == 'freq') freq.value = expr.value 
        if(expr.name =='interval')interval.value = expr.value 
        if(expr.name =='bysetpos'){ 
            if ( get_freq() == 'yearly'){
                yearly_drill_down_type.value = 'bysetpos'
            }else {
                monthly_drill_down_type.value  = 'bysetpos'
            }   
            by_set_pos.value = expr.value 
        }
        if(expr.name == 'byday') {
            
            if ( get_freq() == 'weekly'){
                var week_selected = expr.value.split(/,/gm)
                weekly_by_day.value = []
                week_selected.forEach( x_day=>{
                    if ( ! x_day) return; 
                    weekly_by_day.value.push( x_day.toLowerCase().trim() )
                })
            }else {
                by_week_day.value = expr.value 
            }
        }
        if (expr.name == 'bymonth') {
            if ( get_freq( ) == 'yearly'){
                yearly_drill_down_type.value = 'bymonth'
            }else {
                monthly_drill_down_type.value = 'bymonth'
            }
            by_month.value = expr.value 
        }
        if ( expr.name == 'monthday') monthly_by_day.value = expr.value  
        if ( expr.name == 'bymonthday'){
            monthly_drill_down_type.value = 'bymonthday'
            by_month_day.value = expr.value 
        }
        if ( expr.name == 'count')    occurrence_end_count.value = expr.value 
        if ( expr.name == 'date') { 
            if ( expr.value ){
                var dt = new Date(expr.value )
                occurrence_end_date.value = `${dt.getMonth()+1}/${dt.getDate()}/${dt.getFullYear()}`
            }else{
                occurrence_end_date.value = '' 
            }
            
        }
    }
    
    
}

decode_str_value(d.value);


</script>
<style scoped>

</style>