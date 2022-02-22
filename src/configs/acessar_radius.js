const con_api = require('../dataBase/conexao_radius');

module.exports = function acessar_radius(query){
    return new Promise((resolve , reject)=>{
        con_api.query(query, function (erro, result, fields){
            if (erro){
                const retorno = {
                    errorBD:"sim",
                    resposta:erro.sqlMessage
                }
                reject(retorno);
            }
            else{
                const resposta = JSON.parse(JSON.stringify(result));
                const retorno = {
                    errorBD:"nao",
                    resposta:resposta
                }
                resolve(retorno);
            }
        });
    })
}