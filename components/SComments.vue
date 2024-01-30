
<template> 
    <div class="s-comments"  ref="root" > 
        <div class="create-new-comment-post my-2">
            <s-textarea v-model="new_comment">
            </s-textarea>
            <div class="flex justify-end mt-1">
                <button  :class="[btSizing]"  class="button color-gray-500 hover:color-gray-800" @click="hnd_post_new_comment">post</button>
            </div>
        </div>
        <ul class='comment-list' :style="{ maxHeight: maxHeight ? maxHeight + 'px' : '' }"> 
            <li v-if="filtered_comments.length == 0" v-html="alternate_content">
                
            </li>
            <li v-for="comment in filtered_comments" :key="'comment-'+comment.id " class="m-0"
                    :id="'comment-'+comment.id" :comment-id="comment.id" :class="[comment.status]"
                    :style="{paddingLeft : (comment.indentation * 25) + 'px'}" :order="comment.indentation">
                <div  class="comment flex gap-2 m-0 mb-4">
                    <div clas="comment-head">
                        <img class="image avatar sm" :src="comment.user_avatar" >
                    </div>
                    <div class="comment-rest flex-1">
                        <div class="comment-meta flex gap-2 items-center mb-1">
                            <span class="font-bold username">{{  comment.user_name }}</span>
                            <span class="comment-timestamp color-gray-400 text-sm">
                                {{ formater(  comment.encounter ) }}
                            </span>
                        </div>
                        <div class="comment-body  user-select-text"> 
                            {{  comment.status != 'delete' ? comment.value:'' }}
                            <span class="italic color-gray-300 pl-4" v-if="comment.status=='delete'">deleted</span>
                        </div>
                        <div class="actions flex gap-3 mt-2" v-if="comment.status != 'delete'">
                            <button :class="[btSizing]" class="button  inline-flex items-center color-gray-300 hover:color-red-800" @click="hnd_like_comment(comment)">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>

                                <span class="ml-1">like</span>
                                <span v-if="comment.likes != null&& comment.likes > 0" class="like-count ml-1 text-sm">({{ comment.likes }})</span>
                            </button>
                            <button  :class="[btSizing]"  class="button  inline-flex items-center color-gray-300  hover:color-gray-800" @click="hnd_reply_to(comment)">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
                                class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                </svg>
                                <span class="  ml-1">reply</span>
                            </button>
                            <button  :class="[btSizing]"  class="button inline-flex item-center color-gray-300 hover:color-red-500 danger light confirm" 
                            v-if="is_owner_or_admin(comment)" @confirm="hnd_delete_comment(comment) ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                                    stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                <span class="ml-2">remove</span>
                            </button>
                        </div>
                    </div> 
                </div>
                <div v-if="replying_to != null && replying_to == comment.id" class="mb-3 p-1">
                    <s-textarea v-model="reply_text"></s-textarea>
                    <div class="flex gap-2 justify-end mt-1">
                        <button type="button"  :class="[btSizing]"  class="button  " @click="hnd_post_reply_comment">post</button>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
import { useMainStore } from '~/store';

let store = useMainStore()
let comments = ref([])
const props = defineProps({ 
  //modelValue: {  type: null,   default: ''  },
  postId: { type: Number, default: ()=>null   },
  btSizing : { type : String, default:()=>"sm"},/** The size of button */
  maxHeight: { type : Number, default : ()=>null },
  alternate_content : { type : String, default : ()=>{ 
        var a_user_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
  <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clip-rule="evenodd" />
</svg>
`
        return `<div class="flex items-center">${a_user_icon} <span class='ml-2 color-gray-400'>Be the first to comment.</span> </div>` 
    }
    }
})
const emit = defineEmits(['change','delete'])
const d = useModel(props,emit);

let new_comment = ref("")
let active_post_id = ref(null)
let user_can_delete_any_comment  = ref(null);
let filtered_comments = ref([])
let replying_to= ref(null) 
let reply_text = ref(null);
let time_format = useTimeFormat();
const root = ref(null)


watch(()=> props.postId, (new_id)=> {
    active_post_id.value = new_id 
    hnd_load_comments_for(new_id)
})
let hnd_load_comments_for = async (post_id)=>{
    store.get_current_user()
    user_can_delete_any_comment = await store.can_user({ user_id : store.user?.id, action : 'manage_comments'})
    active_post_id.value = post_id  
    let tmp_comments = await store.load_comments({ post_id })

    var exists;
    for ( var i =0; i < tmp_comments.length; i++){
        exists = comments.value.find(it => it?.id == tmp_comments[i]?.id );
        if ( ! exists) comments.value.push( tmp_comments[i] )
    }


    //The Logic for sorting the comments 
    var out = []; 
    comments.value.forEach(comment => delete comment.__added )
    /**
     * Add "the_comment" immediately after the specified comment whose id matches "parent_id"
     */
    let add_to_parent = ( parent_id, the_comment ) =>{
        if ( !the_comment) return ; 
        if ( the_comment.__added ) return

        if ( the_comment.parent_id == parent_id) {
            the_comment.__added=true; 
            out.push( the_comment)

            let children = comments.value.filter(child=>child.parent_id == the_comment?.id )
            children.forEach( child => { 
                child.indentation = the_comment.indentation + 1
                add_to_parent( the_comment.id,  child )
            })
        }
    }

    comments.value.forEach( C =>{
        if ( ! C ) return  
        if ( C.indentation == undefined ) C.indentation = 0
        add_to_parent( null, C )
    })
    filtered_comments.value = out; 
}
 

let formater = computed(()=>{
    return (t)=>{
        return time_format.utc_to_short_month_date(t)
    }
})

let hnd_like_comment = (comment )=>{

    store.like ({
        object_type: 'comment',
        object_id : comment.id , 
        toggle : true ,
    }).then ( res=>{
        var num_likes = null; 
        if ( res.d ) num_likes = res.d.like_count 
        
        if ( num_likes != null)  comment.likes =num_likes ;

    })
 
}
let hnd_reply_to = (comment)=>{
    if ( ! comment ) return ;
    replying_to.value= comment.id ;
    reply_text.value = "" 
}
let hnd_post_new_comment = async ()=>{
    var comment = {
        title : null, 
        value : new_comment.value ,
        post_id : active_post_id.value, 
    }
    var res = await store.post_comment(comment);
    if ( res.d ) {
        comments.value.splice( 0,0, res.d )
    }
    await hnd_load_comments_for( active_post_id.value )
    new_comment.value = "";
}


let hnd_post_reply_comment = async ()=>{
    var comment = {
        parent_id : replying_to.value, 
        title : null, 
        value : reply_text.value ,
        post_id : active_post_id.value, 
    }
    var res = await store.post_comment(comment);
    if ( res.d ) {
        comments.value.splice( 0,0, res.d )
    }
    replying_to.value = null; 
    await hnd_load_comments_for( active_post_id.value )
    reply_text.value = "";
}


let hnd_delete_comment = async (comment)=>{ 
    await store.manage_comment({ 
        id : comment.id , status : 'delete', 
    })
    comment.status = 'delete' 
}


let is_owner_or_admin = computed(()=>{ 
    return    (comment)=>{
        var out = false;

        if ( comment.created_by == store.user?.id )out = true; 
        if ( user_can_delete_any_comment.value ) out = true
        return out 
    }
})

try { 
    await hnd_load_comments_for( props.postId)
}catch(e){
    console.log("----->ERRRRRR FOR COMMENTS", )
}
  
</script>
<style scoped>

.s-comments {
    min-height: 120px;
    min-width: 300px;
}
.s-comments .comment-list {
    overflow: auto;
    min-height: 80px;
}
</style>
