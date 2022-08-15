import { Router } from "express";
import passport from 'passport'

import logger from '../logger/logger.js'

import  {twilioAccount} from '../mailer/mensajes.js'
import {transporter} from '../mailer/correos.js'

const router = Router()



function isAuth(req,res,next){

    if(req.isAuthenticated()){
    
        next()
    } else {
        res.redirect('/api/login/errorLogin')
    }
}

const joaLogin=(req,res,next)=>{
    
    logger.info('Ingreso al Login')
    logger.info(req.body)
    logger.info(`Nombre:${req.body.nombre}`)
    logger.info(`Password:${req.body.password}`)

    next()
}




router.post('/registro', passport.authenticate('registro',{
    failureRedirect:'/api/login/errorRegistro',
    successRedirect:'/api/login/registrar',
}))

router.get("/registrar", async (req, res) => {
  try {
    //res.render('registro')
    logger.info("Registro Sin error");

    let htmlTemplate = `
    <h1>INFORMACION USUARIO usando sendinblue</h1>
    <h2> Bienvenido: ${req.user[0].nombre}</h2>
    `;

    //Funcion q envia e-mail
    const informacion = await transporter.sendMail({
      from: "JoaEziSystem <jzuin32@gmail.com>",
      to: "joaquinzuin16@gmail.com",
      subject: "Prueba de Nodemailer Registrando Usuarios",
      html: htmlTemplate,
      attachments: [
        {
          path: process.cwd() + "\\public\\img\\AvatarJoaquinV02.jpg",
        },
      ],
    });

    logger.info(informacion);


   //Envia Mensaje por Whatsapp con twilio
   //-------------------------------------
     const Mensaje=`Prueba Twilio Registrando Usuarios Bienvenido/a: ${req.user[0].nombre}`

      twilioAccount.messages.create({
      body: Mensaje,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+5492616486504",
     })
    .then(mensaje=>console.log(mensaje.sid))
    .done();




    res.json({
      mensaje: "Registro sin error",
      nombre: req.user[0].nombre,
      error: false,
    });
  } catch (err) {
    res
      .status(400)
      .json({ mensaje: "Ha ocurrido un error el registro del usuario " });
  }
});


router.get('/errorRegistro',(req,res)=>{
    logger.warn('Registro Error')
    //res.render('errorRegistro')
    res.json({
        mensaje:'Registro con error',
        nombre:'',
        error:true
    })
})


router.post('/' ,passport.authenticate('login',{
    failureRedirect:'/api/login/errorLogin',
    successRedirect:'/api/login/datos', //redirecciona a una ruta
    failureMessage:true,
    successMessage:true
}),)


router.get('/errorLogin',(req,res)=>{
    //res.render('errorLogin')
    logger.warn('ruta errorLogin-Login con Error')
    //console.log(req.user[0].nombre)
    res.json({
        mensaje:'Login con error',
        nombre:'',
        error:true
    })

})

/* router.get('/datos',isAuth,(req,res)=>{
    //res.render('info',{nombre:req.user.nombre})

}) */

router.get('/datos',isAuth,(req,res)=>{
    //res.render('info',{nombre:req.user.nombre})
    logger.warn('ruta datos-Login sin Error')
    logger.info('RutaLogin usuario logeado con exito')
    logger.info(req.user[0].nombre)
    res.json({
        mensaje:'Login sin error',
        nombre:req.user[0].nombre,
        error:false
    })
})

router.get('/logout',(req,res)=>{

    logger.info('ruta datos-Login usuario deslogeado')
    logger.info(nombClie)
 
    req.session.destroy(err=>{
       res.json({
        mensaje:'Solicitando nombre usuario deslogeado',
        nombre:nombClie,
        error:false
    })

    })
})

router.get('/',(req,res)=>{

    //res.render('login')
    logger.info('ruta datos-Login usuario logeado')
    logger.info(nombClie)
 
    res.json({
        mensaje:'Solicitando nombre usuario logeado',
        nombre:nombClie,
        error:false
    })
})

export default router