const { Router } = require("express");
const buscarCliente = require('./controllers/buscarCliente');
const jwt = require('jsonwebtoken');
const routes = new Router();

//Buscar Cliente
routes.post('/cpf', buscarCliente.cpf);
routes.post('/cnpj', buscarCliente.cnpj);
routes.post('/faturas', buscarCliente.faturas);
routes.post('/faturas_app', buscarCliente.faturas_app);
routes.post('/desbloqueio', buscarCliente.desbloqueio);
routes.post('/pagar', buscarCliente.pagar);
routes.post('/insert_user', buscarCliente.insert_user);
routes.post('/login', buscarCliente.login);
routes.post('/isgetapp', buscarCliente.isgetapp);
routes.post('/isBlocked', buscarCliente.isBlocked);
routes.post('/conection', buscarCliente.conection);
routes.post('/esqueci_senha', buscarCliente.esqueci_senha);
routes.post('/modify_password', buscarCliente.modify_password);
routes.post('/evaluation', buscarCliente.evaluation);
routes.post('/atendimento', buscarCliente.atendimento);

module.exports = routes;

//https://www.luiztools.com.br/post/autenticacao-json-web-token-jwt-em-nodejs/