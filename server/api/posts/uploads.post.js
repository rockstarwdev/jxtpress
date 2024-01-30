import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';

import pages from '~/server/jxtpress/pages';
import formidable from "formidable"
import path from "path"




const form = formidable({ multiples: true })

/**
 * Global Middleware invokes this endpoint when we are able to visit a page.  Utilize this opportunity to initialize default properties
 * for a given page
 */
export default defineEventHandler( async (event) => {

    let body;
    const headers = getRequestHeaders(event);
    var d = null; 

    var user = event.user; 

    if( !user) {
      return core.res_denied(event,{ msg : "You must be logged in to upload"})
    }
    if (! await core.can_user({ user_id : user.id , cap : "upload_media"})){
      return core.res_denied(event,{ msg : "You are not permitted to upload"})
    }
    var d ;

    if (headers['content-type']?.includes('multipart/form-data')) {
      body = await parseMultipartNodeRequest(event.node.req, user );
      d = body.d || []; 
      for ( var i =0; i < d.length; i++){
        var stat = await core.get_file_stat(d[i].path);
        d[i].value = stat.inode; 
        await db.update('posts', d[i])
        delete d[i].path;
      }
      
      /** {plugin A file or set of files has been uploaded} */
      await plugin.run_action("file_upload",d)
    } else {
      body = await readBody(event);
    }
    //NOTE:
    //  you can still access "body.other_fields" and process those
    //console.log("API Upload Body Completed", body);
  
    return { ok: true, d };
  })

  /**
 * @param {import('http').IncomingMessage} req
 */
function parseMultipartNodeRequest(req, user ) {
    return new Promise(async (resolve, reject) => {
      /** @see https://github.com/node-formidable/formidable/ */


 
    const dir = path.join(core.get_server_root()+'/public/uploads');

    //If the Upload Directory does not exist create it
    if ( ! await core.is_directory(dir)) {
        await core.create_directory(dir);
    }
    let uploadables = await core.get_option({ name : "site_uploadables", value : ["image/png"], flat: true })
    
    const upload_options = { 
        uploadDir :dir ,  
        keepExtensions: true, allowEmptyFiles: false, 
        maxFileSize: 5 * 1024 * 1024 * 1024, 
        multiples: true, 
        //Below is the order in which these optional functions are called
        filter: function ({name, originalFilename, mimetype}) {
            console.log ("<*> Filter Function",name  )
            // keep only images
            return mimetype &&  uploadables.includes( mimetype );
        }, 
        filename : function  (name, ext, part, form) {
            const { originalFilename, mimetype} = part;
            console.log("<*> Filename")
            return `F-${name}${ext}`
        }   
    }


      const form = formidable( upload_options)
      // Event per each field / file pair
      form.on('file', (field_name, file) => { //it is too late to change file.filepath, file.hash
        //file = { size, lastModifiedDate:"2023-05-29T15:57:32.162Z", filepath:Final, newFilename, mimetype }
        console.log("<*> form.on(file)" ,field_name)
      });

      form.parse(req, (error, fields, files) => {
        //fields : Object with name of fields you supplied in the upload form
        //
        //files: { jxt_file : PersistentFile, form_field_name_you_provided: PersistentFile }
        //   where PersistentFile { size, mimetype, originalFilename, newFilename, filepath, lastModifiedDate  }
        //          originalFilename like "name.ext",newFilename like "randomstring.ext", filepath like "/tmp/randomstring.ext"
        //  when renaming use "newFilename"

        var folder = fields.folder || null;
        console.log ("<*> form.parse",fields  )
        if (error) {
          console.log ("Their is an error",error )
          reject(error);
          return;
        }

        //Format the output of this uploaded files, and relocate the files is a upload folder awas specified
        var subroot = "/public"
        if (! folder.endsWith("/")) folder += "/";
        var promises  = [], output    = [];
        var item; 
        for(var f_field_name of Object.keys(files) ){ //Loop all the field names
          var old_name = files[f_field_name].filepath
          
          item = {
            url : old_name, type:"media",status:"published",
            title : files[f_field_name].newFilename,
            amount : files[f_field_name].size,
            created_by : user ? user.id : null, path: old_name
          }
           
          if (folder ){ 
            var new_name = core.get_server_root()+subroot+ folder + files[f_field_name].newFilename ;
            item.url = new_name
            item.path = new_name
            promises.push( core.rename_file(old_name, new_name  ) )
          }
          
          item.url = item.url.replace(core.get_server_root()+"/public", '').replace(core.get_server_root()+"/private",'')
          output.push(item)
        }
         
        Promise.all(promises).then(()=>{
            resolve({ ...fields,  d : output });
        })
        
          /*const final_path=dir +"/"+files.jxt_file.newFilename
          core.rename_file(files.jxt_file.filepath, final_path ) */
        
      });
    });
  }



 