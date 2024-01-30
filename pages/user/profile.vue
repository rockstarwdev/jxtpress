<template>
    <div class="page">

       <div class="flex justify-between"> 
            <div class="image-area flex flex-col justify-center">
                <img :src="user.avatar ? user.avatar : ''" class="avatar" @click="hnd_edit_avatar">
                <span class="mt-2 color-primary-700 capitalize  text-center">{{ user.name }}</span> 
            </div>
            <h2 class="flex items-center">Profile</h2>
       </div>
        <div class="card my-4">
            <h3 class="mb-3">General</h3>
            <div class="row flex gap-2">
                <div class="w-1/3 label"> 
                    Name
                </div>
                <div class="w-2/3 ">
                    <span class="color-gray-500">{{ user.name  }}</span>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3 label"> 
                    Display Title
                </div>
                <div class="w-2/3">
                    <s-input v-model="user.title"></s-input>
                </div>
            </div>

            <div class="row flex gap-2">
                <div class="w-1/3 label"> 
                    Email
                </div>
                <div class="w-2/3">
                    <s-input type="email" v-model="user.email"></s-input>
                </div>
            </div>


            
            
            <div class="row justify-center flex gap-2 mt-5">
          
                <div class="">
                    <button class="button success" type="button" @click="hnd_update_user">Update</button>
                </div>
            </div>
        </div>

        <div class="card my-4" style="min-height: 25em;" template v-if="store.rendered_post && store.rendered_post.rendered">
       
            
            <s-compile></s-compile>
 
        </div>
 
        <div class="card">
            <h3 class="mb-3">Demographics</h3>

            <div class="flex gap-2 sm:block">
                <div class="row flex-col flex "> 
                    <div class="label">First Name</div>
                    <s-input v-model="demographics [ meta_index(demographics,'first_name') ].value " placeholder="First Name"></s-input>
                </div>
                <div class="row flex-col flex "> 
                    <div class="label">Last Name</div>
                    <s-input v-model="demographics [ meta_index(demographics,'last_name') ].value " placeholder="Last Name"></s-input>
                </div>


                <div class="row flex-col flex "> 
                    <div class="label">Date of Birth</div>
                    <s-date v-model="demographics [ meta_index(demographics,'dob') ].value " placeholder="Date of birth"></s-date>
                </div>
            </div>

            <div class="row flex-col flex "> 
                <div class="label">Street Address</div>
                <s-input v-model="demographics [ meta_index(demographics,'address1') ].value " placeholder="Street Address 1"></s-input>
            </div>
            
            <div class="row flex-col flex "> 
                <div class="label">Street Address (continued)</div>
                <s-input v-model="demographics [ meta_index(demographics,'address2') ].value " placeholder="Street Address 2"></s-input>
            </div>

            <div class="gap-2 flex sm:block">
                <div class="row w-1/4 sm:w-full">
                    <div class="label">City</div>
                    <s-input v-model="demographics[meta_index(demographics,'city')].value" placeholder="City"></s-input>
                </div>
                <div class="row w-1/3 sm:w-full">
                    <div class="label">State</div>
                    <s-input v-model="demographics[meta_index(demographics,'state')].value" placeholder="State"></s-input>
                </div>
                <div class="row w-1/4 sm:w-full">
                    <div class="label">Postal Code</div>
                    <s-input v-model="demographics[meta_index(demographics,'postal_code')].value" placeholder="Postal Code" type="number"></s-input>
                </div>
            </div>
            <div class="gap-2 flex justify-center">
                <button type="button" class="button success" @click="hnd_update_demographics">Update</button>
            </div>
        </div>


        <div class="card my-4">
            <h3>Change Password</h3>
            <div class="row flex gap-2 mt-4">
                <div class="w-1/3 label"></div>
                <div class="w-2/3">
                    <a class="" href="#"  @click="hnd_change_password">Change</a>
                </div>
            </div>
            <div class="modal" ref="el_modal_password">
                <div class="wrapper">
                    <div class="header"><h2>Change Password</h2></div>
                    <div class="content">
                        <div class="row">
                            <div class="label">
                                Current Password
                            </div>
                            <s-input v-model="password.old_password" type="password"></s-input>
                        </div>
                        <div class="row">
                            <div class="label">
                                New Password
                            </div>
                            <s-input v-model="password.new_password" type="password"></s-input>
                        </div>
                        <div class="row my-3 color-red-500  " :class="[password.color]">
                            {{ password.msg  }}
                        </div>
                    </div>
                    <div class="footer flex gap-2 justify-end">
                        <button class="button modal-cancel" type="button">Cancel</button>
                        <button class="button modal-ok bg-green-600 color-white" type="button">Change Password</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card my-4">
            <h3>Account Details</h3>
            <div class="row flex gap-2 mt-4">
                <div class="w-1/3 label">Note</div>
                <div class="w-2/3">
                    <s-textarea height="80px" v-model="account[meta_index(account,'account_note')].value" ></s-textarea>
                </div>
            </div>

            <div class="row flex gap-2 mt-2">
                <div class="w-1/3 label">Payment Methods</div>
                <div class="w-2/3"> 
                    <button class="button primary mb-6" @click="hnd_add_payment_button">Add Payment Method</button>
                    <div class="payment-methods mb-3">
                        <h4 class="font-normal mb-1">Cards</h4>
                        <ul class="list border">
                            <li class="item payment-method row-item" v-for="(method,index) in user.payment_methods" :key="method.id">
                                <div class="flex justify-between ">
                                    <div>
                                        <span class="tag brand">{{ method.brand }}</span> <span class="last4">{{ method.last4 }}</span>
                                        <span class="date mx-4"><span class="month">{{ method.exp_month }}</span>/<span class="year">{{ method.exp_year }}</span></span>
                                    </div>
                                    <button type="button" class="button danger hidden" @click="hnd_remove_payment_method(method, index)">Delete</button>
                                </div>
                                <div class="mt-3 pl-4 color-gray-400"><span class="color-gray-400">Created</span> <span class="text-sm">{{ simple_time.utc_to_simple(method.created) }}</span></div>
                            </li>
                            <li class="item payment-method" v-if="!user.payment_methods || (user.payment_methods && user.payment_methods.length ==0)">
                                <span clas="color-gray-400">{{ "No cards on file" }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="modal" ref="modal_add_payment">
                        <div class="wrapper">
                            <div class="header">
                                <h4>Add Payment Method</h4>
                            </div>
                            <div class="content">
                                
                                <div class="border-gray-300 border rounded bg-white p-3  ">
                                    <div class="mb-2 flex gap-2">
                                        <s-checkbox v-model="use_name_per_above" >same as above</s-checkbox>
                                        <input v-model="custom_cardholder_name" :disabled="use_name_per_above" placeholder="Cardholder name" class="mb-2 border border-gray-300 focus:border-primary-500" id="cardholder-name" type="text">
                                        
                                    </div>
                                
                                    <!-- placeholder for Elements -->
                                    <div id="card-element"></div>
                                    <div id="card-result" class="p-2 text-center color-red-500 font-italics">{{ save_card_error }}</div>
                                    <div class="mt-2">
                                        <button id="card-button" class=" primary button modal-ok" @click="hnd_save_payment_card">Add Card</button>
                                    </div>
                                </div>
                            
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gap-2 flex justify-center">
                <button type="button" class="button success" @click="hnd_update_account_info">Update</button>
            </div>
        </div>
    </div>    
</template>


<script setup>
import util from "~/assets/js/util";
import { useMainStore } from "~/store";

 
let store = useMainStore()
let simple_time = useTimeFormat()


useOnPageReady();

 /**
  * Get the user's profile information - user info and meta properties
  */
 let user = ref(await store.get_profile() )
 let el_modal_password = ref(null)
 let password = ref({ old_password: "",new_password : ""})
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
let use_name_per_above = ref(false)
let custom_cardholder_name = ref("") 
let modal_add_payment = ref(null)
let save_card_error = ref("")
let hnd_save_payment_card = null; 

let hnd_remove_payment_method = async (method,index)=>{
    var res = await util.open_modal({
        content : `Are you sure you want to delete<br> Payment method <b>${method.brand }</b> - ${method.last4}`,
        ok : "Delete", 
        cancel : "Cancel"
    })
    if ( res.action=='ok' ) { 
        try { 
            await store.modify_user_account({ 
                remove_payment_method_id : method.id 
            })  
            user.value.payment_methods.splice(index,1)
            
        }catch(e){}
    }
}

let hnd_add_payment_button = async ()=>{
    //Testing Card : https://stripe.com/docs/testing
    var res = await util.open_modal({ 
        id : modal_add_payment.value ,
        before_ok : hnd_save_payment_card  
    })
    
}


let demographics = ref([])
let account = ref([])
let create_new_meta = ( field_name )=>{
    return { user_id : user.value.id , name : field_name , value : null }
}
let get_meta_field = ( field_name ) =>{
    return user.value.metas.find(it => it.name == field_name ) || create_new_meta (field_name )
}
let meta_field = computed(()=>{
    return (arr_fields, field_name)=>{
        var field = null; 
        field = arr_fields.find ( it => it.name == field_name);
        return field; 
    }
})
let meta_index = computed( ()=>{
    return ( arr_fields, field_name)=>{ 
        for ( var i = 0 ; i < arr_fields.length; i++){
            if ( arr_fields[i].name == field_name) return i;
        }
        return -1;
    }
})
let ini_demographics = ()=>{
    let demo_fields = ["first_name", "last_name","dob", "address1", "address2","city", "state", "postal_code", "dob"]
    if (! user.value ) return;
    var field_name, field;
    for(var j=0;  j < demo_fields.length; j++){
        field_name  = demo_fields [ j] ;
        field       =  get_meta_field( field_name)
        demographics.value.push( field )
    }
};
ini_demographics();


let hnd_edit_avatar = async () =>{
    var selected = []
    if ( user.value.avatar ) selected.push( user.value.avatar )
   
    var res = await util.open_media({ selected})

    var values = res.d;  
    if ( values.length > 0 ) {
        user.value.avatar = values[0].url 
        await store.modify_profile( { 
            id : user.value.id , 
            avatar : values[0].url
        })
        
    }
    
}

let init_account = ()=>{
    let demo_fields = ["account_note"]
    if (! user.value ) return;
    var field_name, field;
    for(var j=0;  j < demo_fields.length; j++){
        field_name  = demo_fields [ j] ;
        field       =  get_meta_field( field_name)
        account.value.push( field )
    }
};
init_account();
 
onMounted(()=>{
    try { 
        let stripe = Stripe( store.rendered_post.store.public_key );

        const elements = stripe.elements();
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');

        hnd_save_payment_card= async ()=>{   
            save_card_error.value = ''
            var name = custom_cardholder_name.value 
            if ( use_name_per_above.value ) {
                var first = meta_index.value(demographics.value,'first_name')
                var last = meta_index.value(demographics.value,'last_name') 
                name = first + " " + last
            }
            
            const {paymentMethod, error} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: { name },
            });

            if (error) { //display error
                save_card_error.value = error.message;
                return false; 
            } else {
                // You have successfully created a new PaymentMethod
                save_card_error = ""
                var payment_method_id =  paymentMethod.id;
                await store.modify_user_account({ 
                    payment_method_id 
                }) 
                var tmp_profile = await  store.get_profile()
                user.value.payment_methods = tmp_profile.payment_methods
                return true 
            }
        }
    }catch(e){
        console.error("Oh no", e )
    }
})
definePageMeta({ 
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware :  [ 
    "auth" ,
    async (to, from)=>{
        //rewrite the url such that "post_type" is not in the url;
        //  this is because in the database, the url is stored alone without "/{post_type}" prefix
        var url = to.path 
        let store =  useMainStore() 
        await store.process_post({ type: 'admin-page', 
          url  , 
          full_url : to.fullPath, 
          query:to.query, 
          param :to.params , 
          scripts : [ ],
          store : true , 
        },{ native:false});
    }
  ]
});

let hnd_update_user = async ()=>{
    var data = user.value 
   await  store.modify_profile({ id : data.id , title : data.title , email : data.email, 
    metas :  [ meta_field.value(demographics.value, 'dob') ] })
}
let hnd_update_demographics = async ()=>{
    await store.modify_profile( { 
        id : user.value.id , 
        metas : demographics.value 
    })
}
let hnd_update_account_info = async ()=>{
    await store.modify_profile( { 
        id : user.value.id , 
        metas : account.value 
    })
}
//After the Home page post is rendered, use this to prevent prep what the user sees
// we do not want to display 404 message on the dashboard, so if the admin has not created a 
// dashboard page yet, just hide the 404 messaing
let check_for_null_page = ()=>{
  if(store.rendered_post && store.rendered_post.__is_404){
    store.rendered_post.rendered = ''
  }
}
check_for_null_page()

let hnd_change_password = (event)=>{
    password.value = { old_password: "",new_password : "", msg : "" ,color: ""}
    event.preventDefault()
    event.stopPropagation()
    util.open_modal({ id : el_modal_password.value, 
        async before_ok ( e) {
            let body = JSON.parse(JSON.stringify(password.value))
            var response = await store.reset_password( body )
            if ( ! response.d ) { 
                password.value.msg = response.msg 
                password.value.color = "color-red-500"
                setTimeout(()=>{
                    password.value.msg = ""
                },3500)
            }else {
                password.value.color = "color-green-500"
                
            } 
            return response.d; 
        }
    }).then ( ret=>{
        if ( ret.action == 'ok'){
            console.log (" Password changed")
        } 
    })
}

useHead({
  title: "Profile",
  meta: [ ],
  bodyAttrs: {  },
  script: [   ... store.rendered_post.head_scripts ],
  link : [  ... store.rendered_post.links ],
  style : [ ... store.rendered_post.head_style   ]
})

</script>
<style scoped>

</style>