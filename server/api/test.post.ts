import core   from '../jxtpress/core'
import db     from '../jxtpress/db'
import email  from '../jxtpress/email'


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
 
    var email_addr = "soliduscode@gmail.com"
    email.send({
        to : [ email_addr ], 
        subject : `Testing email `,
        html :  `This is is an email test`
    })
    return { }
  })