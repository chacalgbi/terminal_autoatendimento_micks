const con_integrator = require('../dataBase/conexao_integrator');

module.exports = function acessar_BD(query){
    return new Promise((resolve , reject)=>{
        con_integrator.query(query, function (erro, result, fields){
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