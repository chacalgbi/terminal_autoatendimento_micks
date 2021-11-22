const { Router } = require("express");
const buscarCliente = require('./controllers/buscarCliente');

const routes = new Router();

//Buscar Cliente
routes.post('/cpf', buscarCliente.cpf);
routes.post('/cnpj', buscarCliente.cnpj);
routes.post('/faturas', buscarCliente.faturas);
routes.post('/desbloqueio', buscarCliente.desbloqueio);

module.exports = routes;