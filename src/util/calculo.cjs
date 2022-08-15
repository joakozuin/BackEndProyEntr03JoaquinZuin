 const calculo = (cant) => {
  let obj=[]
  
  for (let i = 0; i < cant; i++) {

    j=Math.floor(Math.random() * 1000) + 1

      const indice=obj.findIndex(n=>n.numero===j)

      const num=obj.find(n=>n.numero===j)

        if(num){
          let n=obj[indice].rep+1
          obj[indice].rep=n
        }else{
          let nume={numero:j,
                       rep:1}
          obj.push(nume)
        }
      }
    
    //console.log(obj)
  
  return obj;
};


process.on('message', (cant) => {
   if (cant!=0) {
    console.log('Comienza el cálculo en el hijo');
    const  obj =  calculo(cant);
    process.send(obj);
    
  }

});
