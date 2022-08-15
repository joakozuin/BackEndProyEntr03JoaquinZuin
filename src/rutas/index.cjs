  /* import express from 'express';
  
  import { fork } from 'child_process';
  import {join} from 'path';
  import {fileURLToPath} from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = join(__filename,'../../');  */

  const express = require('express')
  const  { fork } = require('child_process')
  const path =require( 'path')

  const router = express.Router();

  console.log('-----------------------------------------')
  const scriptPath = path.resolve(__dirname, '../util/calculo.cjs');
  console.log(scriptPath);
  console.log('-----------------------------------------')

  function admin(reg,res,next){
    if(acceso){
      next()
    }else{
      //const error = new Error(`(Su perfil de usuario no tiene acceso a esta ruta`);

      const error = new Error(`Su perfil de usuario no tiene acceso a las rutas Post/Put/Delete`);

      error.httpStatusCode = 400;
      return next(error);
    }
  
  };


  router.get('/',admin, function (req, res) {
    
      res.status(200).json({ message: 'Perfil autorizado  conectado a la API' })
    
  })


  router.get('/randoms', (req, res) => {

    let cant=0

    if (req.query.cant){

      cant=parseInt(req.query.cant)

    }else{
      cant=10000000
    }

    console.log(`Proceso Padre envía: ${cant}`)

    //console.log(__dirname)
    //console.log(join(__dirname,'./util/calculo.js'))

    //const computo = fork(join(__dirname,'./util/calculo.js'));
    const computo = fork(scriptPath)
  
    computo.send(cant);

    computo.on('message', (respuesta) => {
      res.json({
       resultado: respuesta
      });
    });

    console.log('Esperando la respuesta del Cálculo->')

  });

  module.exports = router
  //export default router