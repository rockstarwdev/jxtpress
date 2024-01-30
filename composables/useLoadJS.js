
import fx_button            from "~/assets/js/fx_button";
import fx_select            from "~/assets/js/fx_select";
import fx_ripple_effect     from "~/assets/js/fx_ripple_effect";
import util                 from "~/assets/js/util"
import fx_type_complete     from "~/assets/js/fx_type_complete";
import fx_checkbox          from "~/assets/js/fx_checkbox";
import fx_date              from "~/assets/js/fx_date";
import fx_duplex            from "~/assets/js/fx_duplex";
import fx_color             from "~/assets/js/fx_color";
import fx_accordion         from "~/assets/js/fx_accordion";
import fx_post_interactions from "~/assets/js/fx_post_interactions"; 
import fx_lookup            from "~/assets/js/fx_lookup";
import fx_meta              from "~/assets/js/fx_meta";
import fx_data_tooltip      from "~/assets/js/fx_data_tooltip";
import fx_form_logic        from "~/assets/js/fx_form_logic";
import fx_link_override     from "~/assets/js/fx_link_override";
import fx_frontend_menu     from "~/assets/js/fx_frontend_menu";
import fx_spinner           from "~/assets/js/fx_spinner";            
import fx_ecommerce from "~/assets/js/fx_ecommerce";
import ace from "ace-code"
import twilight from "ace-code/src/theme/twilight"
import fx_mouse_pointing from "~/assets/js/fx_mouse_pointing";

/**
 * Runs on Application startup to register delegated functions that will enable and enhance UI behavior.
 */
export default async  (options = {})=>{
    if (!process.client)return;
    window.navigateTo = navigateTo
 
    window.router = useRouter()
    window.useRequest = useRequest 
    window.ace = ace 

    
    fx_select() 
    fx_ripple_effect();
    fx_button()
    fx_type_complete()
    fx_checkbox()
    fx_date()
    fx_duplex()
    fx_color()
    fx_accordion()
    fx_post_interactions()
    fx_lookup()
    fx_meta ()
    fx_data_tooltip ()
    fx_form_logic   ()
    fx_link_override()
    fx_frontend_menu()
    fx_spinner()
    fx_ecommerce()
    fx_mouse_pointing()
  
    

    util.ready( util.initialize_all_select)
    //On pagiation to new route, call init functions
    util.delegate('page-load', 'body', (e)=>{ 
        util.initialize_all_select()
    })
    

    //When we click on native form control, add "has-focus" to its closest ui container
    util.delegate("click","input,select,textarea,button",(e)=>{ 
        var ui = e.target_actual.closest(".ui")
        if ( ! ui ) return; 

        ui.classList.add("has-focus")
        util.trigger("focus",ui)
        util.click_outside(ui, (f)=>{
            ui.classList.remove("has-focus");
        })
    })


    util.delegate('keydown', '[contenteditable]', (e)=>{
        // trap the return key being pressed
        if (e.keyCode === 13) {
            // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
            document.execCommand("defaultParagraphSeparator", false, "p");
            // prevent the default behaviour of return key pressed
            return false;
        }
    })

}