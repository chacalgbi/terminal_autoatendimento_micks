const mysql = require('mysql');

// Conecta no DATABASE app_micks
const con_api = mysql.createPool({
  host: process.env.app_HOST,
  user: process.env.app_USER,
  password: process.env.app_PASS,
  database: process.env.app_NAME
  });

module.exports = function BD(query){
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