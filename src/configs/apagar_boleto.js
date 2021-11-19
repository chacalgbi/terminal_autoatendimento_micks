var fs = require('fs');
const path = './files/boleto.pdf';

module.exports = function apagar(){
    return new Promise((resolve, reject) =>{
        if (fs.existsSync(path)) {
            //console.log("Boleto encontrado.");
            fs.unlink(path, function(err){
                 if(err){
                    reject("Erro ao deletar o boleto.");
                 }
                 else{
                    resolve("Boleto deletado.");
                 };
            });
        }else{
            resolve("Boleto NAO encontrado.");
        }
    });
}