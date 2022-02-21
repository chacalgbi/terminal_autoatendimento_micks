const express = require("express");
const routes = require('./routes');
const cors = require('cors');
const agendamento = require('./agendamento')

const app = express();

class App{
  constructor(){
      this.app = express();
      this.middlewares();
      this.routes();
      agendamento
  }
  middlewares(){
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(express.static('img'));
  }
  routes(){
      this.app.use(routes);
  }
}

module.exports = new App().app;