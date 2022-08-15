import  Nodemailer from 'nodemailer'


// usando  gmail
//---------------
 export const transporter = Nodemailer.createTransport({
    service:'gmail',
    port:'587',
    auth:{
        user: 'jzuin32@gmail.com',
        pass: 'rlwdleupfclhfkil'
    }
  })

 transporter.verify().then(()=>{
   console.log('Listo para enviar mensaje')
 })

 