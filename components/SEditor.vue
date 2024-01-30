
<template>
  <div class="ui s-editor">
    <div class="button-group w-full mb-2">
      <div class="blocks flex">
        <button class="button ripple is-dark"
          v-for="(bloc, bi) in normal_reg_blocks" :key="'bi' + bi + bi.name" @click="hnd_insert_block_instance(bloc)">
          {{ bloc.name }}
        </button>
      </div>
      <div>
        <div class="rich-controls shadow">
          <div class="primary-tools">
            <button class="bold p-1" @click="hnd_create_bolk">
              <svg width="24" height="24" focusable="false">
                <path
                  d="M7.8 19c-.3 0-.5 0-.6-.2l-.2-.5V5.7c0-.2 0-.4.2-.5l.6-.2h5c1.5 0 2.7.3 3.5 1 .7.6 1.1 1.4 1.1 2.5a3 3 0 0 1-.6 1.9c-.4.6-1 1-1.6 1.2.4.1.9.3 1.3.6s.8.7 1 1.2c.4.4.5 1 .5 1.6 0 1.3-.4 2.3-1.3 3-.8.7-2.1 1-3.8 1H7.8Zm5-8.3c.6 0 1.2-.1 1.6-.5.4-.3.6-.7.6-1.3 0-1.1-.8-1.7-2.3-1.7H9.3v3.5h3.4Zm.5 6c.7 0 1.3-.1 1.7-.4.4-.4.6-.9.6-1.5s-.2-1-.7-1.4c-.4-.3-1-.4-2-.4H9.4v3.8h4Z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </button>
            <button class="italic p-1" @click="hnd_create_italic">
              <svg width="24" height="24" focusable="false">
                <path
                  d="m16.7 4.7-.1.9h-.3c-.6 0-1 0-1.4.3-.3.3-.4.6-.5 1.1l-2.1 9.8v.6c0 .5.4.8 1.4.8h.2l-.2.8H8l.2-.8h.2c1.1 0 1.8-.5 2-1.5l2-9.8.1-.5c0-.6-.4-.8-1.4-.8h-.3l.2-.9h5.8Z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </button>
            <button class="underline p-1" @click="hnd_create_underline">
              <svg width="24" height="24" focusable="false">
                <path
                  d="M16 5c.6 0 1 .4 1 1v5.5a4 4 0 0 1-.4 1.8l-1 1.4a5.3 5.3 0 0 1-5.5 1 5 5 0 0 1-1.6-1c-.5-.4-.8-.9-1.1-1.4a4 4 0 0 1-.4-1.8V6c0-.6.4-1 1-1s1 .4 1 1v5.5c0 .3 0 .6.2 1l.6.7a3.3 3.3 0 0 0 2.2.8 3.4 3.4 0 0 0 2.2-.8c.3-.2.4-.5.6-.8l.2-.9V6c0-.6.4-1 1-1ZM8 17h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 0 1 0-2Z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </button>
            <button class="link p-1" @click="hnd_create_link">
              <svg width="24" height="24" focusable="false">
                <path
                  d="M6.2 12.3a1 1 0 0 1 1.4 1.4l-2 2a2 2 0 1 0 2.6 2.8l4.8-4.8a1 1 0 0 0 0-1.4 1 1 0 1 1 1.4-1.3 2.9 2.9 0 0 1 0 4L9.6 20a3.9 3.9 0 0 1-5.5-5.5l2-2Zm11.6-.6a1 1 0 0 1-1.4-1.4l2-2a2 2 0 1 0-2.6-2.8L11 10.3a1 1 0 0 0 0 1.4A1 1 0 1 1 9.6 13a2.9 2.9 0 0 1 0-4L14.4 4a3.9 3.9 0 0 1 5.5 5.5l-2 2Z"
                  fill-rule="nonzero"
                ></path>
              </svg>
            </button>
          </div>
          <div class="slot" ref="control_slot">
            <b>FREEDOM VILL</b>
          </div>
        </div>
      </div>
    </div>

    <!-- Inspector Tool-->
    <div
      class="inspector"
      ref="context_inspector"
      @change="hnd_field_changed($event, 'inspector', 'change')"
      @input="hnd_field_changed($event, 'inspector', 'input')"
    ></div>

    <!-- Floating Tool to insert content into page-->
    <div class="inline-insert" ref="el_inline_insert">
      <div class="p-1">
        <h3 class="current-block text-bold color-primary-500"></h3>
        <input
          class="w-full border border-1 border-solid border-gray-300"
          v-model="search_block_name"
        />
      </div>
      <div class="p-1 items"></div>
    </div>
    <!-- Contains active & hover context indicator.  Context data is sandwiched in-between -->
    <div class="live-editor-wrapper" @refresh="set_active_block(undefined)">
      <div class="block-active widgets" ref="context_indicator_active">
        <div class="block-edit-item">
          <button type="button" class="ripple is-dark drag" ref="drag_handle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-3 h-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 9h16.5m-16.5 6.75h16.5"
              />
            </svg>
          </button>
          <button
            type="button"
            class="up ripple is-dark rounded-0"
            @click="hnd_reorder(-1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-3 h-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
          </button>
          <button
            type="button"
            class="down ripple is-dark rounded-0"
            @click="hnd_reorder(1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-3 h-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          <button
            type="button"
            ref="context_bt_remove"
            class="ripple is-dark rounded-0 close color-red-600"
            @click="hnd_remove_block_instance"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3px"
              stroke="currentColor"
              class="w-3 h-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <!-- END of  Active Context Widgets-->

      <div
        class="live-editor ui"
        ref="live_editor"
        @change="hnd_field_changed($event, 'editor', 'change')"
        @input="hnd_field_changed($event, 'editor', 'input')"
      ></div>

      <div class="block-hover" ref="context_indicator_hover"></div>
    </div>

    <div></div>
  </div>
</template>
<script setup>
import util from "~/assets/js/util";
import { useMainStore } from "~/store";


const props = defineProps({
  modelValue: { type: null, default: Array },
});
let live_editor = ref(null);

let drag_handle = ref(null);

const emit = defineEmits([
  "change",
  "update:modelValue",
  "open-inspector",
  "open-block",
]);
const d = useModel(props, emit);

let control_slot = ref(null);
let reg_blocks = ref(null);
let inspector_plugins = ref([]);
let context_indicator_hover = ref(null);
let context_indicator_active = ref(null);
let context_bt_remove = ref(null);
/**
 * Point to the element that currently has selection
 */
let context_target = ref(null);
let context_target_id = null;

let context_inspector = ref(null);
let inspector_ui_buffer = [];
let search_block_name = ref("");
let el_inline_insert = ref(null);

let log = util.log;
let err = util.error;

let store = useMainStore();
/** Represents list of block context's the mouse is currently under */
let hover_tree = [];
let blocks_are_ready = false;

let normal_reg_blocks = computed(() => {
  return reg_blocks.value == null
    ? []
    : reg_blocks.value.filter((it) => !it.is_inspector);
});
let load_blocks = async () => {
  //Get the blocks
  reg_blocks.value = await store.load_blocks();


  if (!process.client) return;

  //Create RUntime script and styles from all blocks
  var live_editor_style_name = "live-editor-style";
  var live_editor_script_name = "live-editor-style";
  var live_editor_style = document.querySelector("#" + live_editor_style_name);
  var live_editor_script = document.querySelector(
    "#" + live_editor_script_name
  );

  if (!live_editor_style) {
    live_editor_style = document.createElement("style");
    document.body.appendChild(live_editor_style);
  }
  if (live_editor_script) {
    live_editor_script.remove();
  }
  live_editor_script = document.createElement("script");
  document.body.appendChild(live_editor_script);

  live_editor_style.innerHTML = "";

  var out,
    style = "",
    script = "";
  for (var i = 0; i < reg_blocks.value.length; i++) {
    out = await instantiate_block(reg_blocks.value[i]);

    if (out && out.style) style += out.style;
    if (out && out.script) script += out.script;
  }
  live_editor_style.innerHTML = style;
  live_editor_script.innerHTML = script;
  blocks_are_ready = true;
};

load_blocks();

let hnd_create_bolk = () => {
  document.execCommand("bold");
};
let hnd_create_italic = () => {
  document.execCommand("italic");
};
let hnd_create_underline = () => {
  document.execCommand("underline");
};
let hnd_create_link = () => {
  var parent = control_slot.value.parentElement;
  if (!parent) return;
  var slot = parent.querySelector(".slot");
  slot.innerHTML = "";
  if (!slot) return;
  parent.classList.add("active");
  var close_slot = () => {
    parent.classList.remove("active");
  };
  util.click_outside(parent, close_slot);
  var el = util.el;

  var sel_property = util.selection_properties(document.getSelection());
  if (sel_property.parent && sel_property.parent.tagName.toLowerCase() != "a") {
    //Create LINK
    var linkURL = "www.website.com";
    var sText = document.getSelection();
    document.execCommand(
      "insertHTML",
      false,
      '<a href="' + linkURL + '" target="_blank">' + sText + "</a>"
    );
  }

  setTimeout(() => {
    //Get the property again
    sel_property = util.selection_properties(document.getSelection());
    if (!sel_property) {
      close_slot();
      return;
    }

    var ui = el("div", {}, [
      el("input", {
        id: "url",
        value: sel_property.parent.getAttribute("href"),
        onClick: () => {},
        classes: ["border", "border-solid", "border-gray-400", "mx-3"],
      }),
      el("label", {}, [
        el("input", {
          id: "new_tab",
          attrs: { type: "checkbox" },
          checked: sel_property.parent.getAttribute("target") == "_blank",
        }),
        el("span", { text: "New Tab", classes: ["ml-2"] }),
      ]),
      ,
      el("button", {
        text: "Ok",
        onClick: () => {
          sel_property.parent.setAttribute(
            "href",
            ui.querySelector("#url").value
          );
          sel_property.parent.setAttribute(
            "target",
            ui.querySelector("#new_tab").checked ? "_blank" : ""
          );

          close_slot();
          util.trigger("change", live_editor.value); //Let Editor know something changed
        },
        classes: ["button", "flat", "primary", "mx-2"],
      }),
    ]);
    slot.appendChild(ui);
  }, 2);
};

let copy_to_instance = (data, class_instance) => {
  if (!data) return class_instance;
  if (data.data) {
    if (!data.id) return class_instance;

    for (var k in data.data) {
      class_instance[k] = data.data[k];
    }
  }
  return class_instance;
};
/**
 *
 * @param {Object} bloc Block Definition
 */
let instantiate_block = async (bloc) => {
  if (!bloc) return;
  if (!bloc.Class) return;
  if (typeof bloc.Class != "string") return;

  try {
    var runnable = ` return ${bloc.Class}  `;
    var fn = new Function(runnable)();
    bloc.Class = fn;
    var temp_block = new bloc.Class(
      { type: bloc.name, data: {}, children: [] },
      copy_to_instance
    );
    return {
      style: typeof temp_block.style == "function" ? temp_block.style() : null,
      script:
        typeof temp_block.script == "function" ? temp_block.script() : null,
    };
  } catch (e) {
    err(
      "Block Instantiation error for",
      bloc.name,
      e.message,
      "\nduring",
      bloc.Class
    );
    return {
      style: null,
      script: null,
    };
  }
};

let hnd_insert_block_instance = (bloc) => {
  if (!d.value) d.value = [];
  d.value.push(create_block_instance(bloc.name));
  setTimeout(() => {
    RUN_UI();
  }, 10);
};
/**
 * Given a block name, create an empty block instance
 * @param {String} bloc_name Block Name
 */
let create_block_instance = (bloc_name) => {
  let id = null,
    el;
  do {
    id = "B" + Date.now();
    el = live_editor.value.querySelector("#" + id);
  } while (el != null);
  return {
    id,
    type: bloc_name,
    data: {},
    children: [],
  };
};
/**
 * Add an item to the Hover Tree List
 * @param {String} block_context
 */
let update_hover_tree = (block_context = null) => {
  let target;
  if (block_context) {
    if (!block_context.classList) return;
    hover_tree.push(block_context);
    target = block_context;
  } else {
    target = hover_tree.pop();
    if (target && !target.classList) return refresh_hover();
  }
  refresh_hover();
};

/**
 * Update the block element that is currently with Focus
 * @param {HTMLElement} block_context The HTML Representation of the block item being edited
 */
let set_active_block = (block_context) => {
  if (!context_indicator_active.value) {
    return;
  }

  if (block_context !== undefined) {
    context_target.value = block_context;
    context_target_id = block_context ? block_context.id : null;

    var title = document.querySelector(".active-block-title");
    var cur_block = get_instance(context_target_id);
    var cur_block_name = "";
    if (cur_block) cur_block_name = cur_block.type;

    if (title) title.innerHTML = "Block " + cur_block_name;
  } else {
    block_context = context_target.value; //retrieve previously saved verison
    update_hover_tree(block_context);
    context_target_id = block_context ? block_context.id : null;
  }

  if (block_context == null) {
    context_indicator_active.value.classList.remove("active");
    return;
  }

  var controls = context_inspector.value.querySelectorAll(".inspector-control"),
    control,
    inspector_for;
  for (var i = 0; i < controls.length; i++) {
    control = controls[i];
    inspector_for = control.getAttribute("inspector-for");
    if (inspector_for && inspector_for == context_target_id) {
      control.classList.add("active");
    } else {
      control.classList.remove("active");
    }
  }

  emit("open-block");
  context_indicator_active.value.classList.add("active");
  refresh_indictor(context_indicator_active.value, block_context);
};

let refresh_indictor = (indicator_el, source_context) => {
  if (!indicator_el) return null;

  if (!source_context) {
    if (indicator_el) {
      indicator_el.style.width = "";
      indicator_el.style.height = "";
    }
    indicator_el.classList.remove("active");
    return;
  }
  //if ( ! source_context.getBoundingClientRect ) return;
  var rect = source_context.getBoundingClientRect();
  if (rect.width == 0) return;
  var pad = 2;
  indicator_el.style.left = rect.left - pad + "px";
  indicator_el.style.right = rect.right + pad + "px";
  indicator_el.style.top = rect.top - pad + "px";
  indicator_el.style.right = rect.right + pad + "px";
  indicator_el.style.width = rect.width + pad * 2 + "px";
  indicator_el.style.height = rect.height + pad * 2 + "px";
  indicator_el.classList.add("active");
};
let refresh_hover = () => {
  refresh_indictor(context_indicator_hover.value, get_hover_block());
};
let get_hover_block = (block_context) => {
  if (hover_tree.length == 0) return null;
  return hover_tree[hover_tree.length - 1];
};

let chk = util.chk;
let trigger = util.trigger;

let get_block = (name, instance_data = { data: {}, children: [] }) => {
  if (typeof name != "string") return null;
  if (!reg_blocks.value) return null;
  name = name.toLowerCase();
  var out = reg_blocks.value.find((it) => {
    var block_name = (it.name || "").toLowerCase();
    var match = block_name == name;
    return match;
  });

  if (!out) return null;
  let block = new out.Class(instance_data, copy_to_instance);
  return block || null;
};

let get_context = (block_id) => {
  var ctx = live_editor.value.querySelector(`#${block_id}.jxt-block`);
  return ctx;
};

let scroller = (e) => {
  set_active_block();
};
onMounted(() => {
  window.addEventListener("scroll", scroller);
});

onUnmounted(() => {
  window.removeEventListener("scroll", scroller);
});

let recursive_render = async (block_instance) => {
  if (!block_instance) {
    console.log("recursive_render - invalid instance");
    return null;
  }
  let block = get_block(block_instance.type, block_instance);
  if (!block) {
    console.log("recursive_render - invalid block");
    return null;
  }

  let cancel_change_redraw = false;
  let redraw = async (id_to_make_active = null, cb = null) => {
    await RUN_UI();

    setTimeout(() => {
      id_to_make_active = id_to_make_active || block_instance.id;
      if (id_to_make_active) {
        setTimeout(() => {
          var ctx = get_context(id_to_make_active);
          if (ctx) {
            set_active_block(ctx);
            if (ctx && typeof cb == "function") cb(ctx);
          }
        }, 250); // Alarm
      }
    }, 200);
  };

  /**
   * Utility function to easly create a set of HTML elements
   * @param {HTMLElement } tag_name HTML Element to create
   * @param {Object} options Set of properties to apply the the newly created element
   * @param {Array} children Array of child elements to append to this element being created
   * @returns {HTMLElement}
   */
  let el = (tag_name, options = {}, children = []) => {
    tag_name = tag_name.toLowerCase();
    var is_inspector = tag_name == "inspector";
    if (is_inspector) { 
      tag_name = "div";
      inspector_control_counter++;
    }
    if (tag_name == "editable") {
      options.editable = true;
      tag_name = "div";
    }

    var type = chk(options, "type");
    var is_form_field = false;

    if (
      tag_name == "input" ||
      tag_name == "text" ||
      tag_name == "number" ||
      tag_name == "email" ||
      tag_name == "date" ||
      tag_name == "checkbox" ||
      tag_name == "hidden" ||
      tag_name == ""
    ) {
      if (tag_name == "date") type = "datetime-local";
      type = tag_name;
      if (type == "input") type = "text";
      tag_name = "input";
      is_form_field = true;
    }
    if ( tag_name == 'textarea'){
      is_form_field = true;
    }
    if (tag_name == "choice" || tag_name == "select") {
      tag_name = "select";
    }
  
    var is_dropdown = false;
    var is_media = false; 
    if (tag_name == "dropdown") {
      is_dropdown = true;
      tag_name = "div";
    }
    if ( tag_name == "media"){
      is_media = true;
      tag_name = "div"
    }

    var element = document.createElement(tag_name);
    var innerText = chk(options, "text") || chk(options, "innerText");
    var innerHTML = chk(options, "html") || chk(options, "innerHTML");
    var value = chk(options, "value");
    var style = chk(options, "style", {});
    var attrs = chk(options, "attrs", {});
    var src = chk(options,"src")

    if ( src != undefined) { 

      if ( Array.isArray(src) && typeof src[0] == 'string'){
        element.setAttribute("src",src[0]);
      }else {
        element.setAttribute("src",src  )
      }
    }

    if (type && attrs.type) attrs.type = type;
 
    if (tag_name == "select" && Array.isArray(options.values)) {
      is_form_field = true;
      for (var i = 0; i < options.values.length; i++) {
        var o = options.values[i];
        var choice = document.createElement("option");
        choice.innerHTML = o.title || o.text || o;
        var val = o.id || o.value || o;
        choice.setAttribute("value", val);
        if (val == options.value) choice.setAttribute("selected", true);
        element.appendChild(choice);
      }
    }
    if (  is_media ) {
        element.classList.add("media","flex", "my-2", "border","border-gray-300", "rounded")
        var e_input = document.createElement("input");  e_input.type="text";  e_input.classList.add("flex-1");
        e_input.placeholder = options.placeholder || (options.attr?.placeholder) || "Select file(s)"

        var e_btn   = document.createElement("button"); e_btn.classList.add("button","flat","primary")
        e_btn.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"> <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>`
        let create_file_items = (values)=>{
           
          var urls = "";
          for (var i=0; values && i < values.length; i++){
            var item = values[i],  e_item ;
            e_item = document.createElement("input")
            e_item.type = "hidden";
            e_item.classList.add("file")
            var link = null; 
            if ( !isNaN(item)) {
              e_item.value = item; 
            }else {
              if ( item && typeof item == 'object'){
                if ( item.url ) {
                    link =  item.url.includes("id=") ? item.url : item.url + "?id="+item.id 
                    e_item.value = link ;
                } 
              }else {
                e_item.value = item;//item should just be plain text url
                link = item; 
              }
            }
            urls += link   
              if ( i < values.length-1) urls +=", "
             
            element.appendChild(e_item)
          }
          e_input.value = urls 
        }
        e_btn.addEventListener('click',async (e)=>{
          e.preventDefault();
          e.stopPropagation();

          var ret = await util.open_media({  files: value })//value should be an array of values
          if ( ret.action == 'ok'){
            var d = ret.d ||[]
            element.querySelectorAll (".file").forEach( node =>node.remove() ) 
            create_file_items(d); 
            
            setTimeout(()=>{
              e_input.click()
              setTimeout(()=>   e_input.focus(),50)
              setTimeout(()=>{ 
                util.trigger('change',element,{ detail : d },) 
                
              },100)
            },100) 
          }
        })
        element.appendChild(e_input)
        element.appendChild(e_btn)
        create_file_items(value);

    }//End of media
    if (is_dropdown) {
      element.classList.add("select", "dropdown");
      element.setAttribute("value", JSON.stringify(options.value));
      if (Array.isArray(options.value)) element.classList.add("is-array");

      var el_selected = document.createElement("div");
      el_selected.classList.add("selected");
      var el_values = document.createElement("div");
      el_values.classList.add("values");

      var valz = Array.isArray(options.value) ? options.value : [options.value];

      for (var i = 0; i < valz.length; i++) {
        var it = valz[i];
        
        var item = document.createElement("span");
        var it_val = it ? (it.id || it.value || it) : "";
        item.setAttribute("value", it_val);
        var inner = it ?  ( it.title || it.text || it.name || it ) : "";

        for (var j = 0; j < options.values.length; j++) {
          var ot = options.values[j];
          ot = ot.id || ot.value || ot;
          if (ot == it_val) {
            ot = options.values[j];
            inner = ot.title || ot.text || ot.name || it;
            break;
          }
        }
        item.innerHTML = inner;
        el_selected.appendChild(item);
      }

      if (Array.isArray(options.values)) {
        for (var i = 0; i < options.values.length; i++) {
          var it = options.values[i];
          var item = document.createElement("div");
          item.setAttribute("value", it.id || it.value || it);
          item.innerHTML = it.title || it.text || it.name || it;
          el_values.appendChild(item);
        }
      }
      element.appendChild(el_selected);
      element.appendChild(el_values);
    }
    if (is_form_field ) {
      element.classList.add(
        "w-full",
        "focus:border-primary-500",
        "border",
        "border-solid",
        "border-gray-300"
      );
    }

    if (is_inspector)
      element.classList.add("inspector-control", "is-inspector");
    if (options.editable) {
      element.setAttribute("contenteditable", true);
      element.style.minHeight = "1em";
      let cte_old_val;
      element.addEventListener("focus", () => {
        cte_old_val = element.innerHTML;
      });
      element.addEventListener("blur", () => {
        var new_val = element.innerHTML;
        if (cte_old_val != new_val) {
          trigger("change", element);
        }
      });
      let signal_refresh = (e) => {
        trigger("refresh", e.target);
      };
      element.addEventListener("click", (e) => signal_refresh(e));
      element.addEventListener("click", (e) => {});
      element.addEventListener("mouseup", (e) => {});

      element.addEventListener("keydown", async (e) => {
        var stop_event = false;
        if (e.keyCode == 13) {
          //enter key -- auto create new paragraph tags
          if (block_instance.type.toLowerCase() == "paragraph") {
            stop_event = true;

            stop_event = true;
            var found = recursive_find_parent(block_instance.id, d.value);
            var parent = null,
              children,
              block_index = -1;
            if (!found) {
              return;
            }

            if (Array.isArray(found)) {
              children = found;
            } else {
              parent = found;
              children = parent.children || [];
            }

            for (var i = 0; i < children.length; i++) {
              if (block_instance.id == children[i].id) {
                block_index = i;
                break;
              }
            }
            if (block_index == -1) return;
            var cur_ctx = document.querySelector("#" + block_instance.id);
            var blk = create_block_instance(block_instance.type);
            var ctx = await recursive_render(blk);
            //This next part is critical in order to make sure we are able to actually retrieve the data later
            if (cur_ctx.nextElementSibling) {
              cur_ctx.parentElement.insertBefore(
                ctx,
                cur_ctx.nextElementSibling
              );
            } else {
              cur_ctx.parentElement.appendChild(ctx);
            }

            if (block_index == children.length - 1) {
              children.push(blk);
            } else {
              children.splice(block_index + 1, 0, blk);
            }
            d.value = d.value;
            cancel_change_redraw = true;

            setTimeout(() => {
              redraw(blk.id, (ctx) => {
                if (block_instance.type.toLowerCase() == "paragraph") {
                  var et = ctx.querySelector("[contenteditable]");
                  setTimeout(() => {
                    if (ctx) {
                      ctx.click();
                      et.focus();
                    }
                  }, 50);
                }
              });
            }, 100);
          } //end of target elements that need to be spawn new block instances
        } //End of enter key if block

        if (stop_event) {
          e.preventDefault();
          e.stopPropagation();
        }
        signal_refresh(e);
      }); //End of - if key down event

      element.addEventListener("keyup", (e) => signal_refresh(e));
      element.addEventListener("mousedown", (e) => signal_refresh(e));
      element.addEventListener("keypress", (e) => signal_refresh(e));
      if (value != undefined) element.innerHTML = value;
    }
    // Style the element
    for (var key in style) {
      element.style[key] = style[key];
    }
    // Apply attributes
    for (var key in attrs) {
      element.setAttribute(key, attrs[key]);
    }
    // Inner/Text
    if (innerText != undefined) element.innerText = innerText;
    if (innerHTML != undefined) element.innerHTML = innerHTML;
    if (options.id != undefined) element.id = options.id;
    if (value != undefined) element.value = value;

    // Apply Classes
    var classes = chk(options, "classes") || chk(options, "class") || [];
    if (classes) {
      classes.forEach((cls) => {
        if (!cls) return;
        cls.split(" ").forEach((part) => {
          if (!part) return;
          element.classList.add(part);
        });
      });
    }
    //Apply Events
    Object.keys(options).forEach((event_prefixed_name) => {
      var actual_evt_name = null;
      if (event_prefixed_name.startsWith("on_")) {
        actual_evt_name = event_prefixed_name.substring(3);
      } else if (event_prefixed_name.startsWith("on")) {
        actual_evt_name = event_prefixed_name.substring(2);
      } else {
        return;
      }
      if (typeof actual_evt_name != "string") return null;
      actual_evt_name = actual_evt_name.toLowerCase();
      let evt_handler = options[event_prefixed_name];

      element.addEventListener(actual_evt_name, (e) => {
        try {
          if (typeof evt_handler == "function") evt_handler(e);
        } catch (e) {
          err("editor", event_prefixed_name, e);
        }
      });
    }); //End of registering all events

    // Add Children
    children.forEach((child) => {
      if (!child.classList) return;
      if (child.classList.contains("is-inspector")) return;
      if (child) element.appendChild(child);
    });
    if (is_inspector) {
      // Connect it to inspector
      add_to_inspector(block_instance.id, element);
      return element;
    }

    return element;
  }; //End of el Function <============================
  let do_append = false;
  let inspector_control_counter=0; 

  let add_to_inspector = (block_id, element) => {
    let _inner_handler = () => {
      element.setAttribute("inspector-for", block_id); //set inspector
      inspector_ui_buffer[block_id] = element;
      context_inspector.value.appendChild(element);
      element.addEventListener("change", () => {
        element.classList.add("changed");
      });
      //----------------------------------------------------------------
      //If real changed occurred within inspector, re-render editor
      //----------------------------------------------------------------
      element.addEventListener("click", (e) => {
        util.click_outside(element, () => {
          if (!element.classList.contains("changed")) return;
          click_outside_change_occurred("inspector");
        });
      }); //
    }; //end of normal way to build up inspector

    if (do_append) {
      //retrieve existing
      var inspector = inspector_ui_buffer[block_id];
      if (inspector) {
        inspector.appendChild(element);
      } else {
        _inner_handler(); //when no pre-existing inspector exist, do normal stuff
      }
    } else {
      _inner_handler(); //normal stuff
    }
    return null;
  };
  var previously_processed_change = false;
  let click_outside_change_occurred = (source) => {
    if (previously_processed_change) return;
    if (cancel_change_redraw) return;
    previously_processed_change = true;

    redraw();
  };
  //---
  //  At this point all edit ui is set up
  //---
  var element = await block.edit(el, api);
  if (element == null) {
    var res = await api("/api/site/block-render", {
      method: "post",
      body: block_instance,
    });
    if (res.d) {
      var temp = document.createElement("div");
      temp.innerHTML = res.d;
      element = temp.children[0];
      if (!element) return null;
    }
  }

  // InspectorDefault(s)
  //Create Default Inspector Controls
  await (async () => {
    var it,
      block_id = block_instance.id;
 
    var inspector = inspector_ui_buffer[block_id];
 
      do_append = true;
 
    if ( inspector_control_counter == 0) {
      inspector = document.createElement("div")
      inspector.classList.add("inspector-control","is-inspector")
      inspector.setAttribute("inspector-for", block_instance.id)
      inspector_ui_buffer[block_id] = inspector;
      context_inspector.value.appendChild(inspector); 
    }
    for (var i = 0; reg_blocks.value && i < reg_blocks.value.length; i++) {
      it = reg_blocks.value[i];
      if (!it.is_inspector) continue;
      block = new it.Class(block_instance, copy_to_instance);
      var out = await block.edit(el, api);
      var count = out.children.length;
      for (var c = 0; c < count; c++) {
        inspector.appendChild(out.children[0]);
      }
    }
  })(); //END OF Default controls for Inspector

  //Create the wrapping shell for the block
  var wrapper = document.createElement("div");
  wrapper.classList.add("jxt-block", block_instance.type);
  wrapper.setAttribute("block-type", block_instance.type);
  var unwrap = undefined;
  if (unwrap == undefined && unwrap != true) {
    wrapper.appendChild(element);
    element = wrapper;
  }

  element.addEventListener("mouseenter", (e) => {
    update_hover_tree(e.target);
  });
  element.addEventListener("mouseleave", (e) => {
    update_hover_tree();
  });
  element.addEventListener("change", () => {
    element.classList.add("changed");
  });

  element.addEventListener("click", (e) => {
    var target = e.target;
    if (!target.getAttribute("block-type")) {
      target = target.closest("[block-type]");
    }
    set_active_block(target);

    util.click_outside(element, (e) => {
      var inspector_control = e.target.closest(".inspector-control");
      if (inspector_control) return;
      if (!element.classList.contains("changed")) return;
      click_outside_change_occurred("element");
    });
  });

  //Render Children
  if (Array.isArray(block_instance.children)) {
    var children_container = document.createElement("div");
    children_container.classList.add("children-container");
    for (var i = 0; i < block_instance.children.length; i++) {
      var child = await recursive_render(block_instance.children[i]);

      if (child) {
        child.setAttribute("child-of", block_instance.id);
        prepend_insert_indicator(
          child,
          children_container,
          block_instance.children[i].id,
          i,
          block_instance.children.length
        );
        children_container.appendChild(child);
        postpend_insert_indicator(
          child,
          children_container,
          block_instance.children[i].id,
          i,
          block_instance.children.length
        );
      }
    }
    element.appendChild(children_container);
  }

  element.id = block_instance.id;
  return element;
}; //end of recursive render

let el_pressed = null;
let on_press_down = (e) => {
  el_pressed = e.target;
}; //save what user pressed on
let drag_item_data = null;
let drag_start = (e) => {
  if (drag_handle.value.contains(el_pressed)) {
    drag_item_data = context_target_id;
    // Dragging has started
    var img = document.querySelector(".drag-ghost");
    if (img) {
      img.style.opacity = "1";
      e.dataTransfer.setDragImage(img, 40, 30);
    }
  } else {
    //if not drag handle, cancel dragging
    e.preventDefault();
  }
};

/**
 * Open up the floating menu that allows user choice of what blocks can be inserted
 * @param {Object} options {block_id, rect, block_index, position, type}
 */
let open_inline_insert = (options) => {
  var root = el_inline_insert.value;
  if (!root) return;
  root.classList.add("active");
  var items = root.querySelector(".items");
  items.innerHTML = "";

  var h3 = root.querySelector(".current-block");
  h3.innerText = options.type;

  var rect_root = root.getBoundingClientRect();
  root.style.left = options.rect.left - rect_root.width * 0.5 + "px";
  root.style.top = options.rect.top + "px";

  if (Array.isArray(reg_blocks.value)) {
    //loop through all blocks and add them menu
    var blk;

    var blk_parent = null;
    if (options.parent) {
      var blk_parent = get_block(options.parent.type, options.parent);
    }
    for (var i = 0; i < reg_blocks.value.length; i++) {
      blk = reg_blocks.value[i];
      if (blk.is_inspector) continue;

      if (blk_parent && typeof blk_parent.insertable == "functfion") {
        if (!blk_parent.insertable(blk)) continue;
      }
      var el_item = document.createElement("div");
      el_item.classList.add(
        "blk-item",
        blk.name,
        "hover:bg-primary-200",
        "ripple",
        "is-dark",
        "rounded",
        "p-1",
        "cursor-pointer"
      );
      el_item.innerHTML = blk.name;
      el_item.setAttribute("block-type", blk.name);
      el_item.addEventListener("click", (e) => {
        var parent_block = recursive_find_parent(options.block_id) || d.value;
        var parent_name = "root";
        if (parent_block.children) {
          parent_name = parent_block.name;
          parent_block = parent_block.children;
        }
        if (parent_block) {
          var new_blk_instance = create_block_instance(
            e.currentTarget.getAttribute("block-type")
          );
          parent_block.splice(
            options.block_index + (options.position == "pre" ? 0 : 1),
            0,
            new_blk_instance
          );

          RUN_UI();
          setTimeout(() => {
            set_active_block(get_context(new_blk_instance.id));
          }, 100);
        }
        cancel_insert();
      });
      items.appendChild(el_item);
    }
  } //help me

  let cancel_insert = () => {
    root.classList.remove("active");
  };
  util.click_outside(root, (e) => {
    cancel_insert();
  });
};

let drag_end = (e) => {
  var img = document.querySelector(".drag-ghost");
  if (img) {
    img.style.opacity = "";
  }
};
let mouse_on_handle = (e) => {
  var clz = "is-select";
  context_indicator_active.value.classList.add(clz);

  let move_out = (e) => {
    context_indicator_active.value.classList.remove(clz);
    drag_handle.value.removeEventListener("mouseleave", move_out);
  };
  drag_handle.value.addEventListener("mouseleave", move_out);
};
let mouse_on_remove_context = (e) => {
  var clz = "target-removal";
  context_indicator_active.value.classList.add(clz);

  let move_out = (e) => {
    context_indicator_active.value.classList.remove(clz);
    context_bt_remove.value.removeEventListener("mouseleave", move_out);
  };
  context_bt_remove.value.addEventListener("mouseleave", move_out);
};
onMounted(() => {
  // When Component Ready
  var interval = setInterval(() => {
    if (blocks_are_ready) {
      clearInterval(interval);
      RUN_UI();
      window.RUN_UI = RUN_UI;
      context_indicator_active.value.setAttribute("draggable", true);
      context_indicator_active.value.addEventListener(
        "mousedown",
        on_press_down
      );
      context_indicator_active.value.addEventListener("dragstart", drag_start);
      context_indicator_active.value.addEventListener("dragstart", drag_end);
      var drag_ghost = document.createElement("div");
      drag_ghost.classList.add("drag-ghost");
      document.body.append(drag_ghost);
      drag_handle.value.addEventListener("mouseenter", mouse_on_handle);
      context_bt_remove.value.addEventListener(
        "mouseenter",
        mouse_on_remove_context
      );
    }
  }, 120);
});
onUnmounted(() => {
  // When Component is destroyed
  if (context_indicator_active.value) {
    context_indicator_active.value.removeEventListener(
      "mousedown",
      on_press_down
    );
    context_indicator_active.value.removeEventListener("dragstart", drag_start);
    context_indicator_active.value.removeEventListener("dragstart", drag_end);
    var drag_ghost = document.querySelector(".drag-ghost");

    drag_handle.value.removeEventListener("mouseenter", mouse_on_handle);
    context_bt_remove.value.removeEventListener(
      "mouseenter",
      mouse_on_remove_context
    );

    if (drag_ghost) {
      drag_ghost.remove();
    }
  }
});

/**
 * Create an insert indicator before the component we need to insert
 * @param {HtmlElement} element The element being that was inserted into root (this method only uses reference to apply events)
 * @param {HtmlElement} root The element that pre and post will be inserted into
 * @param {*} block_id block id
 * @param {Number} block_index order index within the block instance children
 * @param {Number} child_count number of children within block instance children
 */
let prepend_insert_indicator = (
  element,
  root,
  block_id,
  block_index,
  child_count
) => {
  var pre = document.createElement("div");
  pre.classList.add("insert-point", "pre");
  _unify_insert_point(pre, block_id, block_index, "pre");

  if (block_index > 0) return;
  element.insertBefore(pre, element.children[0] || null);
};
/**
 * Create an insert indicator
 * @param {HtmlElement} element The element being that was inserted into root (this method only uses reference to apply events)
 * @param {HtmlElement} root The element that pre and post will be inserted into
 * @param {*} block_id block id
 * @param {Number} block_index order index within the block instance children
 * @param {Number} child_count number of children within block instance children
 */
let postpend_insert_indicator = (
  element,
  root,
  block_id,
  block_index,
  child_count
) => {
  var post = document.createElement("div");
  post.classList.add("insert-point", "post");
  _unify_insert_point(post, block_id, block_index, "post");

  if (!element.querySelector(".inspect-point.post")) {
    element.appendChild(post);
  }
  //When we drop ENTER The element itself
  element.addEventListener("dragenter", (e) => {
    element.classList.add("drag-target");
  }); //end drag ener
  element.addEventListener("dragleave", (e) => {
    element.classList.remove("drag-target");
  }); //end drag target
  element.addEventListener("dragover", (e) => {
    e.preventDefault();
  }); //end dragover
  element.addEventListener("drop", (e) => {
    e.stopPropagation();

    var dest = recursive_find_parent(block_id) || d.value;
    if (Array.isArray(dest)) {
      //Array of blocks
      var dest_blk = null,
        dest_index;
      for (var i = 0; i < dest.length; i++) {
        if (dest[i].id == block_id) {
          dest_blk = dest[i];
          dest_index = i;
          break;
        }
      }

      if (dest_blk) {
        // INSERT INTO THY SELF
        var block = get_block(dest_blk.type, dest_blk);
        if (!block) return;

        if (typeof block.drop != "function") {
          console.error(
            "Block[" + dest_blk.type + "] does not define drop functionality"
          );
          return;
        }

        element.classList.remove("drag-target");
        var di_id = drag_item_data; //drag item
        var di_parent_block = recursive_find_parent(di_id) || d.value;
        if (di_parent_block.children)
          di_parent_block = di_parent_block.children;

        if (Array.isArray(di_parent_block)) {
          for (var i = 0; i < di_parent_block.length; i++) {
            if (di_parent_block[i].id == di_id) {
              var src = di_parent_block[i]; //Drag Item

              if (block.drop(src)) {
                // Check if We can drop the "drop item(di)" into this element
                di_parent_block.splice(i, 1);
                dest_blk.children.push(src); //GOOD
                FORCE_UI(di_id);
              }
              break;
            }
          }
        }
      }
    }
  }); //End drop event handler
};

/**
 * Find the a given Block Context and update it
 * @param {String} ctx_id Name of the Block Context to update
 */
let FORCE_UI = (ctx_id) => {
  RUN_UI();
  setTimeout(() => {
    var ctx = document.querySelector("#" + ctx_id);
    set_active_block(ctx);
    update_hover_tree(ctx);
  }, 60);
};
let _unify_insert_point = (el, block_id, block_index, position) => {
  el.setAttribute("insert-for", block_id);
  var button = document.createElement("button");
  button.innerText = "+";
  button.addEventListener("click", (e) => {
    var rect = e.target.getBoundingClientRect();

    var instance = get_instance(block_id);

    if (instance) {
      open_inline_insert({
        block_id,
        rect: {
          left: e.target.offsetLeft,
          top: e.target.offsetTop + window.pageYOffset,
        },
        block_index,
        position,
        type: instance.type,
        parent: recursive_find_parent(block_id),
      });
    }
  });

  el.appendChild(button);
  el.addEventListener("dragenter", (e) => {
    e.preventDefault();
    el.classList.add("drag-target");
  });
  el.addEventListener("dragleave", (e) => {
    e.preventDefault();
    el.classList.remove("drag-target");
  });
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  el.addEventListener("drop", (e) => {
    el.classList.remove("drag-target");
    var di_id = drag_item_data;
    var ip_parent_block = recursive_find_parent(block_id) || d.value; //insertion point block parent
    if (ip_parent_block.children) ip_parent_block = ip_parent_block.children;
    var di_parent_block = recursive_find_parent(di_id) || d.value;
    if (di_parent_block.children) di_parent_block = di_parent_block.children;

    var di_index = -1;
    for (var i = 0; i < di_parent_block.length; i++) {
      if (di_parent_block[i].id == di_id) {
        di_index = i;
        break;
      }
    }

    // INSERT INTO pre or post element
    var src;
    if (ip_parent_block == di_parent_block) {
      //Shared parents
      if (di_index > block_index) {
        //item being dragged is being dragged upwards to the top of the list
        src = di_parent_block[di_index]; //create reference to what we are moving
        di_parent_block.splice(di_index, 1); //remove it from its current location
        di_parent_block.splice(block_index, 0, src); //re insert it into the point where it needs to go
      } else {
        //item being dragged is being moved down towards the list
        src = di_parent_block[di_index]; //create reference to what we are moving
        di_parent_block.splice(di_index, 1); //remove it from its current location
        di_parent_block.splice(block_index, 0, src); //re insert it into the point where it needs to go
      }
      //console.log ("\tSame Parents", `IP-index(${block_id} - ${block_index}) | DI-index(${di_id } - ${di_index})` )
    } else {
      //Parent are entirely different
      src = di_parent_block[di_index];
      di_parent_block.splice(di_index, 1);
      ip_parent_block.splice(block_index, 0, src);
    }

    setTimeout(() => {
      FORCE_UI(di_id);
    }, 400);
    e.stopPropagation();
  });
};

/**
 * Essentially force complete re-draw of the editor and inspector region of the editor by recursively
 * invoking each block and its children.
 */
let RUN_UI = async () => {
  //Clear the Inspector and Editor
  if (!live_editor.value) return;
  live_editor.value.innerHTML = ``;
  context_inspector.value.innerHTML = `
        <div class="flex items-center ">
          <button class="button primary parent flat mr-2 ripple ripple-dark" title="Select parent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg> 
           </button>

           <h3 class="mr-2 text-bold active-block-title cursor-pointer">Block </h3>  
           <button class="button primary flat ml-auto ripple ripple-dark document">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

            </button>
        </div>
      `;

  var h_title = context_inspector.value.querySelector(".active-block-title");

  h_title.addEventListener("mouseenter", () => {
    let clz = "is-select";
    context_indicator_active.value.classList.add(clz);
    let move_out = (e) => {
      context_indicator_active.value.classList.remove(clz);
      h_title.removeEventListener("mouseleave", move_out);
    };
    h_title.addEventListener("mouseleave", move_out);
  });

  var bt_doc = context_inspector.value.querySelector("button.document");
  bt_doc.addEventListener("click", () => {
    emit("open-inspector");
    RUN_UI();
  });
  var bt_parent = context_inspector.value.querySelector("button.parent");
  bt_parent.addEventListener("click", () => {
    var it = recursive_find_parent(context_target_id);
    if (it) {
      set_active_block(live_editor.value.querySelector("#" + it.id));
    }
  });

  var block_instance, block;
  if (!d.value) d.value = [];
  //Loop
  for (var i = 0; i < d.value.length; i++) {
    block_instance = d.value[i];
    var element = await recursive_render(block_instance);
    if (element) {
      prepend_insert_indicator(
        element,
        live_editor.value,
        block_instance.id,
        i,
        d.value.length
      );
      live_editor.value.appendChild(element);
      postpend_insert_indicator(
        element,
        live_editor.value,
        block_instance.id,
        i,
        d.value.length
      );
    } else {
      console.warn("Block-render failed", element, block_instance);
    }
  }
};

let recursive_save = (block_context) => {
  if (!block_context) return null;

  var block_type = block_context.getAttribute("block-type");
  var block_id = block_context.id;
  if (!block_type) return null;

  let block = get_block(block_type);

  let query = (css_selector, attr = undefined) => {
    //css context
    var el = block_context.querySelector(css_selector);
    if (!el) el = inspector_ui_buffer[block_id].querySelector(css_selector);
    if (el == undefined)
      console.error(
        block_type + '.save.query: cannot find "' + css_selector + '"',
        inspector_ui_buffer[block_id]
      );
    if (el && attr) {
      if (el.classList.contains("media") && attr=='value') {//Return the pure value
        var out = [];
        el.querySelectorAll(".file").forEach(f => out.push(f.value))
        return out; 
      }
      if ( el.classList.contains("select") && attr =='value'){
        var val = el.getAttribute(attr);
        try { val = JSON.parse(val);  }catch(e){}
        return val; 
      }
      if ( el.tagName.toLowerCase() == 'input'){
        var type = el.getAttribute("type") ||el.type 
        if ( type == "text") return el.value;
        if ( type == "number") return Number.parseFloat(el.value)
        if ( type == "checkbox") return el.checked 
      }
      if ( el.tagName.toLowerCase() == 'textarea' && attr=='value'){
        return el.value; 
      } 
      if ( el.classList.contains(".select") && attr=='value'){
        var out  = el.getAttribute("value");
        try { out = JSON.parse(t); } catch(e) { };
        return out;
      }

      var t = el.getAttribute(attr);
      var x = t;
      if (t.startsWith("'") || t.startsWith('"')) {
        x = t.substring(1, t.length - 1);
      }

      return x;
    }
    return el;
  };
  var data = null;
  try {
    data = block.save(query); //Extract out data
  } catch (e) {
    err(block_type + ".save", e, block.save.toString());
  }

  // InspectorDefault(s)
  //Create Default Inspector Controls
  (() => {
    var it;
    for (var i = 0; reg_blocks.value && i < reg_blocks.value.length; i++) {
      it = reg_blocks.value[i];
      if (!it.is_inspector) continue;
      block = new it.Class(data, copy_to_instance);
      try {
        var out = block.save(query);
        if (data) {
          data = { ...data, ...out };
        }
      } catch (e) {
        console.error(
          block_type + "." + reg_blocks.value[i].name + ".query",
          e
        );
      }
    }
  })(); //END OF Default controls for Inspector

  var block_instance = { id: block_id, data, type: block_type, children: [] };
  // Check children
  var child_context = null,
    child_block_instance;
  var children_context = block_context.querySelectorAll(
    `[child-of=${block_id}]`
  );
  for (var i = 0; i < children_context.length; i++) {
    child_context = children_context[i];
    child_block_instance = recursive_save(child_context);

    if (child_block_instance) {
      block_instance.children.push(child_block_instance);
    }
  }
  return block_instance;
};
/**
 * Gets the entire data
 */
let get_data = () => {
  var out = [];
  var arr_contexts = live_editor.value.children,
    bloc_instance = null;
  for (var i = 0; i < arr_contexts.length; i++) {
    bloc_instance = recursive_save(arr_contexts[i]);

    if (bloc_instance) {
      out.push(bloc_instance);
    }
  }
  return out;
};
let hnd_field_changed = (e, location, event_type) => {
  console.log("Changes made")
  if (!live_editor.value) {
    console.log("Unable to extract block data when live_editor is null");
    return;
  }
  d.value = get_data(); //Emit out changes to parent component
  setTimeout(() => {
    set_active_block();
  }, 50); //makes sure inpector control stays open
  window.hnd_field_changed = hnd_field_changed;
};

/**
 * Given an instance ID, recursively look for the instance by searching down the instance tree
 * @param {String} instance_id block instance id
 * @param {Object} parent_block Parent Block
 * @param {Array} arr_blocks Array of all block instances
 * @returns {Object} Block Instance
 */
let recursive_find_parent = (
  instance_id,
  parent_block = null,
  arr_blocks = undefined
) => {
  var instances = arr_blocks != undefined ? arr_blocks : d.value;
  if (!Array.isArray(instances)) return null;

  var binstance;
  for (var i = 0; i < instances.length; i++) {
    binstance = instances[i];
    if (binstance.id == instance_id) {
      return parent_block;
    } else {
      if (Array.isArray(binstance.children)) {
        var p = recursive_find_parent(
          instance_id,
          binstance,
          binstance.children
        );
        if (p) {
          return p;
        }
      }
    } //   :OOO:
  }
  return null;
};

let get_instance = (
  instance_id,
  parent_block = null,
  arr_blocks = undefined
) => {
  if (!instance_id) return null;
  var instances = arr_blocks != undefined ? arr_blocks : d.value;
  if (!Array.isArray(instances)) return null;

  var binstance;
  for (var i = 0; i < instances.length; i++) {
    binstance = instances[i];
    if (binstance.id == instance_id) {
      return binstance;
    } else {
      if (Array.isArray(binstance.children)) {
        var p = get_instance(instance_id, binstance, binstance.children);
        if (p) {
          return p;
        }
      }
    }
  }
  return null;
};

/** Remove a block instance using confirmative click */
let hnd_remove_block_instance = (e) => {
  if (!context_bt_remove.value.classList.contains("confirm-delete")) {
    context_bt_remove.value.classList.add("confirm-delete");
    let cancel = util.click_outside(context_bt_remove.value, (e) => {
      //Canceling
      context_bt_remove.value.classList.remove("confirm-delete");
      cancel();
    });
    return;
  } else {
    e.target.classList.add("confirm-delete");
    if (!context_target_id) return;
    var parent = recursive_find_parent(context_target_id, null);
    var blks = parent ? parent.children : d.value;
    if (!Array.isArray(blks)) return;

    for (var i = 0; i < blks.length; i++) {
      if (blks[i].id == context_target_id) {
        blks.splice(i, 1);

        FORCE_UI(context_target_id);
        break;
      }
    }
    context_bt_remove.value.classList.remove("confirm-delete");
  }
};
/**
 * When the active widget button is clicked, move the block instance up (-1) or down (1)
 * @param {Number} direction -1 or 1
 */
let hnd_reorder = (direction) => {
  if (!context_target_id) return;
  var parent = recursive_find_parent(context_target_id, null);
  var blks = parent ? parent.children : d.value;
  if (!Array.isArray(blks)) return;

  var index = -1;

  for (var i = 0; i < blks.length; i++) {
    if (blks[i].id == context_target_id) {
      index = i;
      break;
    }
  }
  if (index == -1) return;
  var new_index = index + direction;
  if (new_index < 0) return;
  if (new_index > blks.length - 1) return;

  var a = blks[index];
  var b = blks[new_index];

  //Reorder the items
  blks.splice(index, 1, b);
  blks.splice(new_index, 1, a);
  var timeout_delay = 50;

  RUN_UI();
  setTimeout(() => {
    FORCE_UI(context_target_id);
  }, timeout_delay);
};


</script>
<style scoped>
:root {
}
.live-editor-wrapper {
  position: relative;
}
.block-hover,
.block-active {
  position: fixed;
  pointer-events: none;
  border: none; /*2px solid var(--gray-300); */
  display: none;
  padding: 4px;
  border-radius: 3px;
  opacity: 0.5;
}
.block-active {
  /*box-shadow: 0 0 0 2px var(--primary-500); */
  border-left: 2px solid var(--primary-500);
  border: none;
  opacity: 1;
  z-index: 200;
}
.block-hover.active,
.block-active.active {
  display: block;
}
.block-active.target-removal {
  background-color: rgba(255, 0, 0, 0.282);
}

.block-edit-item {
  position: absolute;
  left: -30px;
  top: -25px;
  border: 3px solid var(--primary-500);
  border-radius: 4px;
  z-index: 30;
  display: flex;
  pointer-events: all !important;
  flex-direction: column;
}

.block-edit-item button:hover {
  background-color: var(--primary-600);
  color: var(--white) !important;
}

.block-edit-item button {
  background: var(--admin-theme-whitespace);
  border-radius: 0;
}
.block-edit-item button.confirm-delete {
  background-color: var(--red-600);
  color: var(--white);
}
.inline-insert {
  display: none;
  border: 1px solid var(--ui-border-color);
  border-radius: 4px;
  background-color: var(--content-space);
  margin: 10px 0;
  position: absolute;
  width: 300px;
  z-index: 300;
  max-height: 300px;
  min-height: 300px;
  animation: menu-showing 300ms linear forwards;
}
.inline-insert.active {
  display: block;
}
.inline-insert .items {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}

.rich-controls {
  padding: 0 6px;
  min-height: 39px;
}
.rich-controls .primary-tools {
  display: block;
}
.rich-controls.active .primary-tools {
  display: none;
}

.rich-controls .slot {
  display: none;
}
.rich-controls.active .slot {
  display: block;
}
.rich-controls .primary-tools > button:hover {
  background-color: var(--indigo-500);
  color: var(--white);
  fill: var(--white);
}
</style>