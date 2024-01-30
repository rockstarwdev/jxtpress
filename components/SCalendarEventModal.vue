
<template>
 
    <div class="modal" ref="edit_modal">
        <div class="wrapper">
            <div class="title" >{{ title  }} </div>
            <div class="content" v-if="active_event">
                 <div class="flex gap-2">
                    <div class="row w-1/2">
                        <div class="label">Start</div>

                        <s-date v-if="!b_viewing_notes" v-model="active_event.start"  class="w-full time"></s-date>
                        <div class="text-sm" v-else>{{  simple_datetime(active_event.start) }}</div>
                    </div>
                    <div class="row w-1/2">
                        <div class="label">End</div>
                        <s-date v-if="!b_viewing_notes" v-model="active_event.end" class="w-full time "></s-date>
                        <div class="text-sm" v-else>{{ simple_datetime(active_event.end ) }}</div>
                    </div>

                 </div>
                 <div class="row">
                    <div    class="label flex justify-between items-center"  >
                        <span :data-title="active_event.id || 'ID Pending'" >
                            {{ b_viewing_notes ? active_event.title : "Title" }} 
                        </span>
                        <button class="Notes button " v-if="active_event.id" @click="hnd_load_notes"> {{ b_viewing_notes ? 'Close comments' : 'Comments'}}</button>
                    </div>
                    <s-input v-if="!b_viewing_notes" v-model="active_event.title" ></s-input>
                </div>
                <div v-if="!b_viewing_notes">
                    <div class="row">
                        <div class="label">Description</div>
                        <s-textarea v-model="active_event.description" style="height: 90px;"></s-textarea>
                    </div>
                    
                    <div class="row flex gap-2">
                        <div class="">
                            <div class="label">Color</div>
                             

                            <s-select :values="colors" v-model="color_code">
                                <template #default="{ value }">
                                    <span class="color inline-block w-4 h-4 border-solid rounded-sm border border-sold border-gray-600" :style="{backgroundColor : value.value }"></span>
                                    <span class="ml-2">{{ value.title }}</span>  
                                </template>
                                <template #selected="{value }">
                                    <div class="inline-flex items-center">

                                    <span class="color inline-block w-4 h-4 border-solid rounded-sm border border-sold border-gray-600" :style="{backgroundColor : value.value }"></span>
                                    <span class="ml-2">{{ value.title }}</span>  
                                    </div>
                                </template>
                            </s-select>
                            
                        </div>
                        <div>
                            <div class="label">Occurrence</div>
                            <div class="button-group" v-if="!active_event.is_occurrence">
                                <button class="button" :class="[ active_event.aux == null ?'active':'' ]" @click="hnd_event_frequency(null)">One time</button>
                                <button class="button" :class="[ active_event.aux != null ?'active':'' ]" @click="hnd_event_frequency('')">Reoccur</button>
                            </div>
                            <div v-else>
                                <div class="color-gray-400 text-sm">Occurrence of event
                                    <button class='button sm' @click="hnd_edit_parent_event(active_event.parent_id)" type='button' data-title="Edit">{{  active_event.parent_id }}</button>
                                </div>
                            </div><!-- end of v-else : not occurrrence -->

                        </div>
                        
                    </div>
                    
                    <div class="row" v-if="active_event.aux != null">
                            <s-reoccur-picker v-model="active_event.aux"></s-reoccur-picker>
                    </div>
                    
                </div>
                <div class="View-Comments md:w-350" v-else>
                    <s-comments :max-height="450" :post-id="active_event.id"></s-comments>
                </div>

            </div>
            <div class="footer flex justify-end end gap-3">
                <button class="button  danger" @click="hnd_do_delete" :class="[b_delete_event?'bg-red-200':'']">Delete</button>
                <button class="button modal-cancel">Cancel</button>
                <button class="button modal-ok primary">Ok</button>
            </div>
        </div>
    </div>

</template>


<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({
  pipedEvent : { type:Object , default :()=>null },
  view : { type : String, default :  () => 'week' }, 
  title : { type : String , default : 'Event Editor' },
  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update:modelValue', 'update', 'load-edit'])
const d = useModel(props,emit);
const edit_modal = ref(null)

watch( ()=> props.modelValue , (new_val, old_val)=>{
    b_viewing_notes.value = false 
    hnd_open_editor ( new_val ) 
})


let color_code      =  ref("")
let b_delete_event  = ref(false)


let colors = ref(util.get_color_list())

let hnd_do_delete = ()=>{
    b_delete_event.value =!b_delete_event.value; 
}

const root          = ref(null)
let active_event    = ref(null)
let hnd_event_frequency = (val)=>{
    if ( ! active_event.value ) return ;
    active_event.value.aux = val; 

}
let hnd_open_editor = (evt)=>{
    if ( ! evt ){
        d.value = null; 
        return  
    }
    b_delete_event.value = false; 
    evt  = JSON.parse( JSON.stringify(evt) ) 

    evt.start = util.format_mm_dd_yyyy_hh_mm( evt.start )
    evt.end = util.format_mm_dd_yyyy_hh_mm( evt.end || evt.start)

    color_code.value = "";
    var color_meta = null; 
    if ( evt.metas ) {
        color_meta = evt.metas.find( it => it.name == 'color')
        if ( color_meta ) color_code.value = color_meta.value || "";

    }else {
        evt.metas = []
    }


    active_event.value = evt 
    
    setTimeout(async ()=>{ 
        
        var res = await util.open_modal({ id : edit_modal.value ,
            before_complete () {
                hnd_load_notes()
                b_viewing_notes.value = false 
                
            }
        }) 
        b_viewing_notes.value = false 
        if ( res.action == 'ok'){  
            color_meta = evt.metas.find(it => it.name == 'color')
            if ( ! color_meta ){
                color_meta = { post_id : evt.id , name : 'color', value : null  }
                evt.metas.push ( color_meta )
            }
            color_meta.value = color_code.value 


            var o_evt =  util.copy( active_event.value )  
            if ( b_delete_event.value ) {
                o_evt.delete = true; 
            }else delete o_evt.delete 
            active_event.value = null;    
            emit('update', o_evt );
        }
        d.value = null; 

    }, 100)

}
let hnd_update_color_window_zindex = (e) => {
    var target = e.target; 
    var detail = e.detail;
    var win = detail.window; 
    if ( win ) {
        win.style.zIndex=999999999999
    }
}

let dt_formating  = useTimeFormat()
let simple_datetime = computed(()=>{
    return (e)=>{
        return dt_formating.utc_to_simple( e )
    }
})

let hnd_edit_parent_event=(id_to_edit)=>{
    var out = { id : id_to_edit}
    emit('load-edit', out )
    console.log ("Emitting event", out )
}
/** Indicate that we are currenting viewing notes related to the event */
let b_viewing_notes = ref(false)
let hnd_load_notes = (e)=>{
    b_viewing_notes.value = !b_viewing_notes.value //true;  
}
</script>
