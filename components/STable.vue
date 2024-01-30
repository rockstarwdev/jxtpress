
<template>
  <div  class="ui s-table overflow-auto mb-2 mt-2" :class="[ ]">
 
        
        <table class="min-w-full bg-white mb-3">
            <thead class="table-head">
                <tr>
                    <th v-for="col in columns" :class="[col.name ]" :key="col.name" 
                        :style="{width: col.width=='auto' ? '100%':col.width}">  
                        <slot :name="'title-'+col.name" :col="col"> {{ col.name=='selector' ? "": 
                        clean_title (capitalize (col.title || col.name)) }}</slot>
                    </th>
                </tr>
            </thead><!--End of table head-->
            <tbody>
                <tr v-for="(row,i) in d" :key="'row'+i" :class="[   ]" class="hover:bg-primary-50 hover:color-gray-800">
                    <td v-for="(col, j) in columns" :key="'row'+i+':'+j+col.name" :class="col.name" 
                        class="px-1 text-sm text-gray-600 py-1 border-b border-gray-200 whitespace-nowrap">
                        <slot :name="col.name" :row="row">
                            <span class="text-gray-700">
                                <template v-if="!row[col.name]">
                                    <i v-if="col.name !='selector'" class="empty color-gray-400 " style="user-select: none;">empty</i>
                                </template><template v-else>
                                    {{ row [ col.name ]  }} 
                                </template>
                                
                            </span>
                        </slot>
                    </td>
                </tr>
                <tr v-if="d.length ==0">
                    <td v-for="(col, j) in columns" :key="'row'+i+':'+j+col.name" :class="col.name" 
                        class="px-1 text-sm text-gray-600 py-1 border-b border-gray-200 whitespace-nowrap">
                        <span style="opacity: 0.42"> -- </span>
                    </td>
                </tr>
            </tbody>
        </table><!--End of table-->
          
        <s-pagination :options="pagination" :url="base_url" @click="emit('pagination', $event)"></s-pagination>
  </div>

</template>
<script setup>

const props = defineProps({
  modelValue: {  type: null,   default: ()=>[]  },
  type : { type: String, default : 'text'},
  options : { type: Object, default : ()=>({})},
  base_url : { type : String, default: null}
})

let columns = computed(()=>{
    let out = props.options.columns || props.options.column || null;
    if ( ! out ) {
        var first= d.value[0] || null; 
        if ( ! first ) {
            out = [ {name : "No Column Or Data"}]
        }else {
            out = Object.keys(first).map(it =>({ name : it }))
        }
    }
    //Use map to ensure columns are in object structure
    out = out.map(it=>{
        if ( typeof it != 'object'){
            return { name : it }
        }else {
            return it;
        }
    })
    out.splice(0,0,{ name : "selector",title : "", width: "40px"})
    out.push({
        name : 'action', title : 'Action'
    })
    return out; 
})

const clean_title  = computed(()=>{
    return (title)=>{
        if ( !title) return "";
        if ( title.toLowerCase().endsWith('id')){
            var index =title.indexOf('Id');
            if (index==-1) index = title.indexOf("id")
            if ( title.length != 2)
            title = title.substring(0, index)
        }
        return title; 
    }
})
const emit = defineEmits(['change', 'update:modelValue' ])
const d = useModel(props,emit);
let pagination = usePagination(d)
const capitalize = useCapital()

</script>
<style scoped>

tr:hover .empty {
    color: var(--white);
}
</style>