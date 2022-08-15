import {Router} from 'express'
const router = Router();

router.get('/', (req, res) => {

    res.json({
       Argumentos:process.argv,
       SO:process.platform,
       Node_Version:process.version,
       MemoriaOcupada:process.memoryUsage,
       Path: process.cwd(),
       Id_process: process.pid,
       Directorio:process.argv[1]
    });
  

});


export default router