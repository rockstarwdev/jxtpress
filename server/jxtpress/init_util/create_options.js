export default async  (db, core) =>{//db = instance of Database
    try{ 
        
        // {step Register Account O ption properties}
        await db.update('options', [
            {name :"dashboard_title", value : "JxtPress"},
            {name : "site_title", value : "JxtPress" },
            {name : "site_uploadables", value : [
                "image/x-icon","image/tiff","image/webp",
                "image/gif", "image/png", "image/jpeg","image/jpg", "video/mp4","audio/mp4",
                "application/msword","application/zip","application/vnd.ms-powerpoint",
                "application/pdf","application/vnd.ms-excel","application/json","text/css",
                "text/html", "text/csv",
            ]}
        ], {unique:true, override : false })
        core.log("Updated Accout Options")
    }catch(e){
        core.error("Table instation error during data", e);
        return false; 
    }

}
