import cron from 'node-cron'

export default async  (db, core) =>{//db = instance of Database
    try{ 
        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
        var get_time = ()=>{
            var now = new Date();
            let lz = (val) => val < 10 ? '0'+val : val 
            var time = `${lz(now.getMonth()+1 )}/${lz(now.getDate())} ${lz(now.getHours())}:${lz(now.getMinutes())}`
            return { now, time }
        }

        let plugin = core.plugin;
        /**
         * Serves as a common housing to run plugin code that matches the shell name provided.  Shell name are like "cron_q<N><minute|hour|day>"
         * @param {String} shell_name Name of the cron job frequency to be ran
         */
        let run_cron_shell = async (shell_name)=> {
            var d0 = get_time()
            //console.log (`${d0.time}: ${shell_name}`)

            try{  
                plugin.run_action(shell_name, d0 );
            }catch(pe){  console.error("plugin:error",pe); } 
        }
        var q1_minute = cron.schedule('* * * * *', (t) =>  {
            run_cron_shell('cron_q1min')
        }, {  scheduled: true , timezone });
 
        var q5_minute = cron.schedule('*/5 * * * *', (t) =>  {
            run_cron_shell('cron_q5min')
        }, {  scheduled: true, timezone });

        var q10_minute = cron.schedule('*/10 * * * *', (t) =>  {
            run_cron_shell('cron_q10min')
        }, {  scheduled: true, timezone });

        var q15_minute = cron.schedule('*/15 * * * *', (t) =>  {
            run_cron_shell('cron_q15min')
        }, {  scheduled: true, timezone });

        var q30_minute = cron.schedule('*/30 * * * *', (t) =>  {
            run_cron_shell('cron_q30min')
        }, {  scheduled: true, timezone });

        var q45_minute = cron.schedule('*/45 * * * *', (t) =>  {
            run_cron_shell('cron_q45min')
        }, {  scheduled: true, timezone });

        var q1_hour = cron.schedule('0 0 * * * *', (t) =>  {
            run_cron_shell('cron_q1hour')
        }, {  scheduled: true, timezone });
        var q2_hour = cron.schedule('0 0 */2 * * *', (t) =>  {
            run_cron_shell('cron_q2hour')
        }, {  scheduled: true, timezone });
        var q3_hour = cron.schedule('0 0 */3 * * *', (t) =>  {
            run_cron_shell('cron_q3hour')
        }, {  scheduled: true, timezone });
        var q4_hour = cron.schedule('0 0 */4 * * *', (t) =>  {
            run_cron_shell('cron_q4hour')
        }, {  scheduled: true, timezone });
        var q8_hour = cron.schedule('0 0 */8 * * *', (t) =>  {
            run_cron_shell('cron_q8hour')
        }, {  scheduled: true, timezone });
        var q12hour = cron.schedule('0 0 */12 * * *', (t) =>  {
            run_cron_shell('cron_q12hour')
        }, {  scheduled: true, timezone });
        //
        //console.log ("Cron Task Object", task )

    }catch(e){
        core.error("Table instation error during data", e);
        return false; 
    }

}
