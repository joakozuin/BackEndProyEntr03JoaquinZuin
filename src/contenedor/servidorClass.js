
import  express from 'express'
import  morgan from 'morgan'

import productoRuta from '../rutas/producto.js'
import carritoRuta from '../rutas/carrito.js'
import loginRuta from '../rutas/apiRoutersLogin.js'
import apiRuta from '../rutas/index.cjs'
import infoRuta from '../rutas/info.js'

import session from 'express-session';
//import sessionFileStore from 'session-file-store'
//const fileStore=sessionFileStore(session)

import MongoStorage from 'connect-mongo'

import {Server as ioServer} from 'socket.io'
import http from 'http'

import '../passport/local.js'
import passport from "passport"

import {funcUtil} from '../util/util.js'
import cors from 'cors' 

/* import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const yarg= yargs(hideBin(process.argv)).argv */

import logger from '../logger/logger.js'

import cluster from 'cluster'
import os from 'os'

import dotenv from 'dotenv';
 dotenv.config();

 
const{calcFechaHora}=funcUtil

class Servidor {
  constructor(login) {
    this.app = express();

    this.port = process.env.PORT || "8082";
    this.Modo=process.env.MODO || "FORK";
    
    this.numProc = os.cpus().length
    this.cluster=cluster

    /* console.log(yarg.PORT)
    this.port = yarg.PORT || "8081"; */

    this.httpServer = http.createServer(this.app);

    this.io = new ioServer(this.httpServer);

    //Middlewares
    this.app.use(morgan("dev"));
    this.app.use(express.json());

    this.hosting=process.env.HOSTING || true;
    if(this.hosting) {
      this.app.use(express.static(process.cwd() + "\/public"));
    } else {
      this.app.use(express.static(process.cwd() + "\\public"));

    }
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(
      session({
        secret: 'Secreto',
        cookie: { maxAge: 1000 * 60 },
        saveUninitialized: true,
        resave: true,

        //sesiones locales
        //store:new fileStore({path:'./sesiones',ttl:30}), 

        //sesiones MongoDB 
        //store:MongoStorage.cretae({mongoUrl:'mongodb://localhost/sesiones',ttl:30}), 

        //sesiones MongoDB Atlas
        store:MongoStorage.create({mongoUrl:'mongodb+srv://joakoBE:joakoBE@cluster0.pgubd90.mongodb.net/joaEcommerce?retryWrites=true&w=majority',ttl:60}) 
      })
    );
   
    this.app.use(passport.initialize())
    this.app.use(passport.session())

    // Ruta de la Api en http://localhost:8080/api
    // prefijo, por el tema de versiones de la API
    this.apiCaminos = {
      api: "/api",
      carritos:'/api/carritos',
      productos: "/api/productos",
      login: "/api/login",
      info:"/api/info"
    };

    this.usuario(login)

    this.rutas();
    this.manErrores();

    //Websocket
    //
    this.mensajes = [
      {
        email: "Juan@gmail.com",
        fecha: calcFechaHora(),
        texto: "Hola que tal...",
      },
      {
        email: "Joaquin@gmail.com",
        fecha: calcFechaHora(),
        texto: "Genial...",
      },
    ];

    this.productos=[];

   /*  this.webSocket(); */
  }

  rutas() {
    this.app.use(this.apiCaminos.api, apiRuta);
    this.app.use(this.apiCaminos.productos, productoRuta);
    this.app.use(this.apiCaminos.carritos, carritoRuta);
    this.app.use(this.apiCaminos.login, loginRuta);
    this.app.use(this.apiCaminos.info, infoRuta);
  }

  webSocket() {
    this.io.on("connection", (cliente) => {
      console.log(`Nuevo Cliente Conectado id:${cliente.id}`);
      cliente.emit("mensaje", this.mensajes);

      //Modulo CHAT
      //
      cliente.on("nuevoMensaje", (mensaje) => {
        console.log("Nuevo Mensaje: " + mensaje.email);
        console.log("Nuevo Mensaje: " + mensaje.texto);
        
        const mens={
          email: mensaje.email,
          fecha: this.calcFechaHora(),
          texto: mensaje.texto,
        }

        this.mensajes.push(mens);

        /* console.log('Enviando Mensajes al cliente')
        this.io.sockets.emit("mensaje", this.mensajes); */

      });

     //Modulo Productos
     //
     cliente.on("nuevoProducto",(producto)=>{
        
       console.log("Servidor Nuevo Producto Titulo: " + producto.titulo);
       console.log("Servidor Nuevo Producto Precio: " + producto.precio);
       console.log("Servidor Nuevo Producto Thumbnail: " + producto.thumbnail);

       const prod={
          titulo: producto.titulo,
          precio: producto.precio,
          thumbnail:producto.thumbnail
        }

       this.productos.push(prod)

      /*  console.log('Servidor Enviando Producto al cliente')
       this.io.sockets.emit("producto", this.productos); */

    });

        console.log('Enviando Mensajes al cliente')
        this.io.sockets.emit("mensaje", this.mensajes);

        console.log('Servidor Enviando Producto al cliente')
        this.io.sockets.emit("producto", this.productos);

    });

  }

   usuario(login){
    if(login=='admin'){
      logger.info('Se ha Conectado un: Administrador')
      logger.info('---------------------------------')
      this.app.use(function(reg,res,next){
        global.acceso=true //acceso administrador
        global.nombClie=''
        next()
        });

   }else{
     logger.info('Se ha Conectado un: Usuario')
     logger.info('---------------------------')
      this.app.use(function(reg,res,next){
        global.acceso=false //acceso usuarios
        global.nombClie=''
        next()
      });
   }}


  
  

  manErrores() {
    this.app.use((err, req, res, next) => {
      res.json({
        Mensage: "Ha ocurrido un error",
        Error: err.message,
        status: err,
      });
      //return next()
    });
  }

  
  escuchando() {

    /* this.httpServer.listen(this.port, () => {
      console.log(`Servidor respondiendo en el puerto ${this.port}`);
    }); */

    const MODO=this.Modo==='CLUSTER'

    if (MODO && cluster.isMaster) {

      logger.info(`🔥​Master ${process.pid} se está ejecutando`);
  
      for (let i = 0; i < this.numProc; i++) {
        this.cluster.fork();
      }
      //💡Aca queda escuchando es un evento, cuando muere un proceso, este
      //lo levanta de nuevo
      cluster.on(" exit", (worker, code, signal) => {
        logger.info(`Master ${worker.process.pid} se está ejecutando`);
        this.cluster.fork();
      });

    } else {
      const server = this.httpServer.listen(this.port, () =>
        logger.info(
          `​🚀 ​ Servidor ejecutando en Modo ${this.Modo} http://localhost:${this.port}-PID:${
            process.pid
          }-Hora:${new Date().toLocaleString()} `
        )
      );
      server.on(`error`, (err) => console.log(err));
    }

  }
}

export default  Servidor