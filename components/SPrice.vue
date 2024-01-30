
<template>
    <div class="pricing-unit relative" ref="root" :class="[d.status]" >
        <!-- start: Static View-->
        <div class="absolute top-right" style="right:0.5em; top: 0.5em"> <!-- edit / delete controls -->
            <button class="favorite button" @click="hnd_emit_favorite" data-title="Default price">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                stroke="currentColor" class="w-4 h-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
</svg>

            </button>
            <button class="edit   button" @click="hnd_edit" data-title="Edit price">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>

            </button>
            <button class="edit   button" @click="hnd_remove()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div class="flex justify-between">

            <h4><span :class="[is_active ? 'bold':'font-thin', 'amount']">{{ amount   }}</span> <span class='text-sm font-medium'>{{ freq }}</span></h4>
            <span :class="[d.status , 'tag']">{{ d.status }}</span>
        </div>
        <div class="flex gap-5 items-center">
            <div :class="[!is_active ? 'text-sm color-gray-400':'']">{{  d.title || "Unamed" }}</div>
        </div>
         <div class="custom-user-amount" v-if="is_active && display_meta('model')=='custom'" >
            Minimum <span class="emphasis">{{  display_meta('cust_min') || "none" }}</span>
            Maximum <span class="emphasis">{{ display_meta('cust_max')  || "none"}}</span>
         </div>
         <div class="trial-period" v-if="is_active && display_meta('trial')">
            {{ display_meta('trial') }} Day Trail
         </div>
        <div class="mt-4"><span class="sm color-gray-600 tag">{{ d.eid }}</span></div> 
        <!-- end: Static view -->



        <!-- start : Model View -->
        <div class="modal " ref="modal_price">
     
                <div class="wrapper lg:w-550 ">
                    <h3>Price Detail</h3>
                    <div class="content min-height-200" v-if="edit_price">
                        <!-- Name -->
                        <div class="row">
                            <div>Nickname</div>
                            <s-input v-model="edit_price.title"></s-input>
                        </div>
                        <div class="my-2 notice" v-if="edit_price.eid">
                            <p>Note: Once Stripe price has been created, edits to below properties(ie price, frequency) must be done within price dashboard.</p>
                            <div>Exception(s)</div>
                            <ul class="list-disc">
                                <li>status</li>
                            </ul>
                        </div>
                        <!-- Price Type &  Recurring Type-->
                        <div class="flex gap-4">
                            <s-select v-model="edit_price.status" :values="status_types"></s-select>
                            <s-select @change="hnd_pricing_model_changed" v-model="pricing_model" :values="pricing_models"></s-select>
                            <div class="button-group mb-3">
                                <button class="item button" :class="[is_reoccuring_mode ? 'active':'']"  @click="hnd_select_reoccuring_type">Recurring</button>
                                <button class="item button" :class="[is_one_time_mode ? 'active':'']"  @click="hnd_select_onetime_type">One Time</button>
                            </div>
                        </div>
                        
                        <!-- Amount and  ( Recurring Schedule or Custom Price Min/Max) -->
                        <div class="row flex gap-3">
                            <div :class="[is_reoccuring_mode  ? 'w-1/3': '']">
                                <div>Amount</div>
                                <s-input type="number" :digits="2" v-model="edit_price.amount"></s-input>
                            </div>
                            
                            <div class="w-2/3 pl-4" v-if="is_reoccuring_mode ||is_custom_mode ">
                                <div  v-if="is_reoccuring_mode">&nbsp;</div>

                                <div class="flex gap-2 items-center" v-if="is_reoccuring_mode"> 
                                    <span class="color-gray-400">Every</span> 
                                    <input  v-model="pricing_recur_count" style="width:75px" class="border border-gray-300 border-solid" type="number">
                                    <s-select   v-model="pricing_recur_freq" :values="frequencies"></s-select>
                                </div>

                                <div class="flex gap-2 items-center" v-if="is_custom_mode"> 
                                    
                                    <div>
                                        <div>Min</div>
                                        <input @change="hnd_custom_amount_changed('min')" v-model="pricing_custom_min" data-title="Minimum Amount" placeholder="Minimum Amount" 
                                            style="width:75px" class="border border-gray-300 border-solid" type="number">
                                    </div>
                                    <div>
                                        <div>Preset</div>
                                        <input  @change="hnd_custom_amount_changed('preset')"   v-model="pricing_custom_preset" 
                                        data-title="Preset Amount" placeholder="Preset Amount" 
                                        style="width:75px" class="border border-gray-300 border-solid" type="number">
                                    </div>
                                    <div>
                                        <div>Max</div>
                                        <input  @change="hnd_custom_amount_changed('max')"   v-model="pricing_custom_max" 
                                        data-title="Maximum Amount" placeholder="Maximum Amount" 
                                        style="width:75px" class="border border-gray-300 border-solid" type="number">
                                    </div>
                                </div>

                            </div>
                        </div>
                        <!-- end: Dynamic view -->
                        <div>
                            <div>Trail Period</div>
                            <div class="button-group">
                                <input  v-model="pricing_trail_days" data-title="In Days" placeholder="# Days" 
                                            style="width:75px" class=" " type="number">
                                <div class=" px-3  flex items-center text-sm">Days</div>
                            </div>
                        </div>
                    </div>
                    <div class="footer flex gap-2 justify-end">
                        <button class="button modal-cancel ">Cancel</button>
                        <button class="button primary modal-ok">Update</button>
                    </div>
                </div>
 
        </div> 
        <!-- end: Model View-->


    </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({
 
  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update:modelValue', 'favorite'])
const d = useModel(props,emit);

const amount = computed(()=>{
    var arr = d.value.metas || [];
    var m = arr.find(it => it.name == 'cust_preset') || null 
    if ( m ) m  = m.value  
    if ( ! m || m == 'null' ) m = d.value.amount 
    if ( m == null ) m = "0.00" 
    m = m.toString();

    var parts = m.split(/\./gm) 
    if ( parts.length < 2) parts = [ parts[0] || "0", "00"]
    else {
        parts[1] = parts[1].substring(0,2);
    }
    return parts.join(".")
})
const freq = computed(()=>{
    var arr = d.value.metas || [];

    var type = arr.find(it => it.name == 'type') || null 
    if ( type ) type = type.value 

    var freq = arr.find(it => it.name == 'freq') || null 
    if ( freq ) freq = freq.value 
 
    var count = arr.find(it => it.name == 'count') || null 
    if ( count ) count = count.value 
 

    if ( type == 'recurring') {  
        if ( count != 1 ){
            count = count + " "
        }else {
            count = ""
        }
        return " / " + count + freq
    }
})
let is_active = computed(()=>{
    return ['active','published' ].includes (d.value.status  )

})
let status_types = ref([
    { title : "None", value : null},
    { title : "Active", value : "active"},
    { title : "Archived", value : "archive"},
    { title : "Delete", value : "delete"},
])
let frequencies = ref([
    { title : "Days", value : "day"},
    { title : "Weeks", value : "week"},
    { title : "Months", value : "month"}, 
])
const modal_price = ref ( null )

const display_meta = computed(()=>{
    return (name)=>{
        if ( ! d.value.metas) return "Unknown"
        var m = d.value.metas.find( it => it.name == name)
        if ( ! m ) return "N/A"
        return m.value 
    }
})
const edit_price = ref(null)

let metas = ref( null )

const hnd_emit_favorite = ()=>{ 
    emit('favorite', d.value.eid )
}
const hnd_edit = async ()=>{
    edit_price.value = util.copy (d.value)
    if ( !edit_price.value.metas  )edit_price.value.metas  = []

    metas.value = edit_price.value.metas 

 
    var res = await util.open_modal({id : modal_price.value });
    if (res.action == 'ok') {
        let copied_price = util.copy(edit_price.value ) 
        copied_price.metas = util.copy(metas.value )

        d.value = copied_price
        emit('change', copied_price ) 
    }
}

const hnd_remove = async ()=>{
    d.value.status = "archive"
}
let hnd_pricing_model_changed = ()=>{
    if ( pricing_model.value == 'custom' )pricing_type.value = 'one-time'
}
let pricing_models = ref([
    { title : "Standard",       value : "standard"},
    { title : "Per Package",    value : "package"},
    { title : "Custom",         value : "custom"},
])
let pricing_model       = useMetaModel(metas,"model","standard")
let pricing_type        = useMetaModel(metas,"type","one-time")
let pricing_recur_count = useMetaModel(metas,"count")
let pricing_recur_freq  = useMetaModel(metas,"freq")


let pricing_custom_min      = useMetaModel(metas,"cust_min")
let pricing_custom_preset   = useMetaModel(metas,"cust_preset")
let pricing_custom_max      = useMetaModel(metas,"cust_max")
let pricing_trail_days      = useMetaModel(metas, "trial")

let is_reoccuring_mode  = computed(()=>{ 
    return pricing_type.value == 'recurring'; 
})

let is_custom_mode = computed(()=>{ 
   return  pricing_model.value =='custom'; 
})
let is_one_time_mode = computed(()=>{ 
    return pricing_type.value == 'one-time'; 
})
 

let hnd_select_onetime_type = ()=>{ 
    pricing_type.value ='one-time' 
}
let hnd_select_reoccuring_type =()=>{ 
     console.log (pricing_type, pricing_type.value )
    pricing_type.value='recurring'
    if ( pricing_model.value == 'custom') { 
        pricing_model.value ="standard"
    }

    if (! pricing_recur_freq.value ) pricing_recur_freq.value = "month"
    if (! pricing_recur_count.value) pricing_recur_count.value = 1  
    
}


let hnd_custom_amount_changed = (type)=>{

     pricing_custom_min.value = util.cast_num(pricing_custom_min.value )
     pricing_custom_preset.value = util.cast_num(pricing_custom_preset.value) 
     pricing_custom_max.value = util.cast_num(pricing_custom_max.value)
    
     if ( type =='preset'){ 
        if (pricing_custom_preset.value < pricing_custom_min.value ) pricing_custom_min.value = pricing_custom_preset.value
        if (pricing_custom_preset.value > pricing_custom_max.value ) pricing_custom_max.value = pricing_custom_preset.value
     }
    if ( type =='min') {
        if ( pricing_custom_min.value > pricing_custom_preset.value)pricing_custom_preset.value =  pricing_custom_min.value
    }
    if ( type =='max') {
        if ( pricing_custom_max.value < pricing_custom_preset.value)pricing_custom_preset.value =  pricing_custom_max.value
    }
}

</script>
<style scoped>
.pricing-unit {
    padding: 0.5em;
    padding-left: 1.0em;
    border: 1px solid;
    border-color: var(--primary-100);
    border-left-width: 2px;
    border-radius: 2px;
    margin-bottom: 0.75em;
}

.pricing-unit .absolute{
    display: none;
}
.pricing-unit:hover .absolute {
    display: block;
    background-color: white;
}
.pricing-unit.selected {
    border-width: 2px;
    border-color: var(--primary-500);
}
.pricing-unit.selected .amount {
    color: var(--primary-600);
}
</style>
